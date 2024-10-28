import React, { useCallback, useEffect, useRef, useState } from "react";
import ProfileCard from "./ProfileCard";
import { Announce } from "../interfaces/announce";
import { User } from "../interfaces/user";
import { fetchUsers } from "../../services/fetchAllUser";
import { fetchAnnounceDetails } from "../../services/announces";
import calculateAge from "../fonctions/calculateAge";
import { calculateDistance } from "../fonctions/calculateDistance";
import citiesData from "../../public/data/cities.json";
import BigFilter, { SearchFilters } from "./BigFilter";
import { API_BASE_URL } from "../../services/api";

const ITEMS_PER_PAGE = 12;

const distanceRanges: { [key: string]: number[] } = {
  "< 10km": [0, 10],
  "< 20km": [0, 20],
  "< 50km": [0, 50],
  "< 75km": [0, 75],
  "< 100km": [0, 100],
};

const getCityCoordinates = (cityName: string) => {
  for (const province of citiesData) {
    const city = province.cities.find((c) => c.city_fr === cityName);
    if (city) {
      return { latitude: city.latitude, longitude: city.longitude };
    }
  }
  return { latitude: 0, longitude: 0 };
};

const defaultImageUrl = (gender: string | undefined) => {
  const baseUrl = window.location.origin;

  switch (gender) {
    case "man":
      return `${baseUrl}/images/silouhette-male.jpg`;
    case "woman":
      return `${baseUrl}/images/silouhette-female.jpg`;
    case "transgender":
      return `${baseUrl}/images/silouhette-transgender.jpg`;
    case "couple":
      return `${baseUrl}/images/silouhette-couple.jpg`;
    default:
      return `${baseUrl}/images/silouhette.jpg`;
  }
};

const fetchAnnounceDetailsWithUser = async (id: string, usersData: User[]) => {
  const announceData = await fetchAnnounceDetails(id);
  const user = usersData.find(
    (user) => user.id === announceData.announce.userId
  );

  const age = user ? calculateAge(user.birthday) : 0;
  return {
    ...announceData.announce,

    age: age,
    user: user || {
      id: 0,
      birthday: "",
      isVerified: false,

      nickname: "",
      userProfile: {
        gender: "",
        orientation: "",
        languages: [],
        size: 0,
        weight: 0,
        hairColor: "",
        eyeColor: "",
        intimateHairCut: "",
        nationality: "",
        ethnicity: "",
        penisSize: 0,
        braCup: "",
        tattoo: false,
        smoker: false,
        piercing: false,
        massageOnly: false,
        isVerified: false,
        escort: false,
        alcohol: false,
      },
      address: { city: "" },
    },
    status: announceData.announce.status,
    practices: announceData.announce.practices,
    galleryUrl:
      announceData.gallery.find((img: any) => img.cover)?.fileUrl ||
      defaultImageUrl(user?.userProfile.gender),
  };
};
const AnnouncesSearch: React.FC = () => {
  const [announces, setAnnounces] = useState<Announce[]>([]);
  const [filteredAnnounces, setFilteredAnnounces] = useState<Announce[]>([]);
  const [displayedAnnounces, setDisplayedAnnounces] = useState<Announce[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statusToShow, setStatusToShow] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    gender: [],
    orientation: [],
    distance: [],
    location: [],
    ageRange: [],
    status: [],
    sizeRange: [],
    weightRange: [],
    hairColor: [],
    eyeColor: [],
    intimateHairCut: [],
    nationality: [],
    ethnicity: [],
    languages: [],
    penisSize: [],
    practices: [],
    braCup: [],
    tattoo: null,
    smoker: null,
    piercing: null,
    massageOnly: null,
    alcohol: null,
    isVerified: null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver>();
  const lastAnnounceElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    localStorage.setItem("bigSearchFilters", JSON.stringify(newFilters));
    setPage(1);
    setDisplayedAnnounces([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);

        const response = await fetch(`${API_BASE_URL}/announces`);
        if (!response.ok) {
          throw new Error("Failed to fetch announces");
        }
        const data = await response.json();
        const announceIds = data.map((announce: { id: string }) => announce.id);

        const announceDetails = await Promise.all(
          announceIds.map(async (id: string) => {
            const announceData = await fetchAnnounceDetails(id);
            const user = usersData.find(
              (user) => user.id === announceData.announce.userId
            );

            // Filter gallery images based on statusToShow
            const filteredGallery = (announceData.gallery || []).filter(
              (img: any) =>
                img.status.toString().includes(statusToShow.toString())
            );

            return {
              ...announceData.announce,
              age: user ? calculateAge(user.birthday) : null,
              user: user || {
                id: 0,
                birthday: "",
                nickname: "",
                userProfile: { gender: "", orientation: "" },
                address: { city: "" },
              },
              galleryUrl:
                filteredGallery.find((img: any) => img.cover)?.fileUrl ||
                filteredGallery[0]?.fileUrl ||
                defaultImageUrl(user?.userProfile?.gender),
              gallery: filteredGallery,
            };
          })
        );

        const sortedAnnounces = announceDetails.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setAnnounces(sortedAnnounces);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [statusToShow]);

  useEffect(() => {
    const savedFilters = JSON.parse(
      localStorage.getItem("bigSearchFilters") || "{}"
    );
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...savedFilters,
      massageOnly: savedFilters.massageOnly ?? null,
    }));
  }, []);

  useEffect(() => {
    const bigSearchFilters: SearchFilters = JSON.parse(
      localStorage.getItem("bigSearchFilters") || "{}"
    );

    if (
      bigSearchFilters.distance &&
      !Array.isArray(bigSearchFilters.distance)
    ) {
      bigSearchFilters.distance = [bigSearchFilters.distance];
    }

    const statusFilters = [
      ...(filters.status ?? []),
      ...(bigSearchFilters.status ?? []),
    ];

    const filtered = announces.filter((announce) => {
      const user = users.find((u) => u.id === announce.user.id);
      if (!user) return false;

      const matchesGender =
        ((filters.gender ?? []).length === 0 &&
          (bigSearchFilters.gender ?? []).length === 0) ||
        (Array.isArray(filters.gender) &&
          filters.gender.includes(user.userProfile.gender)) ||
        (Array.isArray(bigSearchFilters.gender) &&
          bigSearchFilters.gender.includes(user.userProfile.gender));

      const matchesNationality =
        ((filters.nationality ?? []).length === 0 &&
          (bigSearchFilters.nationality ?? []).length === 0) ||
        (Array.isArray(filters.nationality) &&
          filters.nationality.includes(user.userProfile.nationality)) ||
        (Array.isArray(bigSearchFilters.nationality) &&
          bigSearchFilters.nationality.includes(user.userProfile.nationality));

      const matchesEthnicity =
        ((filters.ethnicity ?? []).length === 0 &&
          (bigSearchFilters.ethnicity ?? []).length === 0) ||
        (Array.isArray(filters.ethnicity) &&
          filters.ethnicity.includes(user.userProfile.ethnicity)) ||
        (Array.isArray(bigSearchFilters.ethnicity) &&
          bigSearchFilters.ethnicity.includes(user.userProfile.ethnicity));

      const matchesLanguages =
        ((filters.languages ?? []).length === 0 &&
          (bigSearchFilters.languages ?? []).length === 0) ||
        (Array.isArray(filters.languages) &&
          filters.languages.some((lang) =>
            user.userProfile.languages.includes(lang)
          )) ||
        (Array.isArray(bigSearchFilters.languages) &&
          bigSearchFilters.languages.some((lang) =>
            user.userProfile.languages.includes(lang)
          ));
      const matchesPractices =
        ((filters.practices ?? []).length === 0 &&
          (bigSearchFilters.practices ?? []).length === 0) ||
        (Array.isArray(filters.practices) &&
          filters.practices.every((prac) =>
            announce.practices.includes(Number(prac))
          )) ||
        (Array.isArray(bigSearchFilters.practices) &&
          bigSearchFilters.practices.every((prac) =>
            announce.practices.includes(Number(prac))
          ));

      const matchesEyeColor =
        ((filters.eyeColor ?? []).length === 0 &&
          (bigSearchFilters.eyeColor ?? []).length === 0) ||
        (Array.isArray(filters.eyeColor) &&
          filters.eyeColor.includes(user.userProfile.eyeColor)) ||
        (Array.isArray(bigSearchFilters.eyeColor) &&
          bigSearchFilters.eyeColor.includes(user.userProfile.eyeColor));

      const matchesHairColor =
        ((filters.hairColor ?? []).length === 0 &&
          (bigSearchFilters.hairColor ?? []).length === 0) ||
        (Array.isArray(filters.hairColor) &&
          filters.hairColor.includes(user.userProfile.hairColor)) ||
        (Array.isArray(bigSearchFilters.hairColor) &&
          bigSearchFilters.hairColor.includes(user.userProfile.hairColor));

      const matchesIntimateHairCut =
        ((filters.intimateHairCut ?? []).length === 0 &&
          (bigSearchFilters.intimateHairCut ?? []).length === 0) ||
        (Array.isArray(filters.intimateHairCut) &&
          filters.intimateHairCut.includes(user.userProfile.intimateHairCut)) ||
        (Array.isArray(bigSearchFilters.intimateHairCut) &&
          bigSearchFilters.intimateHairCut.includes(
            user.userProfile.intimateHairCut
          ));

      const matchesZigounette =
        ((filters.penisSize ?? []).length === 0 &&
          (bigSearchFilters.penisSize ?? []).length === 0) ||
        (Array.isArray(filters.penisSize) &&
          filters.penisSize.some((range) => {
            const [min, max] = range.split("-").map(Number);
            return (
              user.userProfile.penisSize >= min &&
              user.userProfile.penisSize <= (max || Infinity)
            );
          })) ||
        (Array.isArray(bigSearchFilters.penisSize) &&
          bigSearchFilters.penisSize.some((range) => {
            const [min, max] = range.split("-").map(Number);
            return (
              user.userProfile.penisSize >= min &&
              user.userProfile.penisSize <= (max || Infinity)
            );
          }));

      const matchesBraCup =
        ((filters.braCup ?? []).length === 0 &&
          (bigSearchFilters.braCup ?? []).length === 0) ||
        (Array.isArray(filters.braCup) &&
          filters.braCup.includes(user.userProfile.braCup)) ||
        (Array.isArray(bigSearchFilters.braCup) &&
          bigSearchFilters.braCup.includes(user.userProfile.braCup));

      const matchesOrientation =
        ((filters.orientation ?? []).length === 0 &&
          (bigSearchFilters.orientation ?? []).length === 0) ||
        (Array.isArray(filters.orientation) &&
          filters.orientation.includes(user.userProfile.orientation)) ||
        (Array.isArray(bigSearchFilters.orientation) &&
          bigSearchFilters.orientation.includes(user.userProfile.orientation));

      const matchesAgeRange = () => {
        const ageRanges = [
          ...(filters.ageRange ?? []),
          ...(bigSearchFilters.ageRange ?? []),
        ];
        if (ageRanges.length === 0) return true;
        const userAge = announce.age || 0;
        return ageRanges.some((range) => {
          const [minAge, maxAge] = range.split("-").map(Number);
          return userAge >= minAge && (maxAge ? userAge <= maxAge : true);
        });
      };

      let matchesDistance = true;
      const selectedLocations = filters.location ?? [];
      const distanceKey = filters.distance?.[0] ?? "< 50km";
      const [, maxDistance] = distanceRanges[
        distanceKey as keyof typeof distanceRanges
      ] || [0, Infinity];

      if (selectedLocations.length > 0) {
        matchesDistance = selectedLocations.some((location) => {
          const cityCoordinates = getCityCoordinates(location);
          const userCityCoordinates = getCityCoordinates(user.address.city);
          const distance = calculateDistance(
            cityCoordinates.latitude,
            cityCoordinates.longitude,
            userCityCoordinates.latitude,
            userCityCoordinates.longitude
          );
          return distance <= maxDistance;
        });
      }
      const matchesLocation = selectedLocations.length === 0 || matchesDistance;
      const matchesStatus = () => {
        if (statusFilters.length === 0) {
          return true;
        }

        const normalizeStatus = (status: string | string[]): string[] => {
          if (Array.isArray(status)) {
            return status.flatMap((s) =>
              s.split(",").map((item) => item.trim().toLowerCase())
            );
          }
          return status.split(",").map((item) => item.trim().toLowerCase());
        };

        const normalizedAnnounceStatus = normalizeStatus(announce.status);

        const result = statusFilters.some((filterStatus) =>
          normalizedAnnounceStatus.includes(filterStatus.toLowerCase())
        );
        return result;
      };

      const matchesWeightRange = () => {
        const weightRanges = [
          ...(filters.weightRange ?? []),
          ...(bigSearchFilters.weightRange ?? []),
        ];
        if (weightRanges.length === 0) return true;
        const userWeight = user.userProfile.weight || 0;
        return weightRanges.some((range) => {
          const [minWeight, maxWeight] = range.split("-").map(Number);
          return (
            userWeight >= minWeight &&
            (maxWeight ? userWeight <= maxWeight : true)
          );
        });
      };

      const matchesSizeRange = () => {
        const sizeRanges = [
          ...(filters.sizeRange ?? []),
          ...(bigSearchFilters.sizeRange ?? []),
        ];
        if (sizeRanges.length === 0) return true;
        const userSize = user.userProfile.size || 0;
        return sizeRanges.some((range) => {
          const [minSize, maxSize] = range.split("-").map(Number);
          return userSize >= minSize && (maxSize ? userSize <= maxSize : true);
        });
      };

      const matchesTatoo =
        filters.tattoo === null ||
        bigSearchFilters.tattoo === null ||
        (filters.tattoo === true && user.userProfile.tattoo === true) ||
        (bigSearchFilters.tattoo === true && user.userProfile.tattoo === true);

      const matchesSmoker =
        filters.smoker === null ||
        bigSearchFilters.smoker === null ||
        (filters.smoker === true && user.userProfile.smoker === true) ||
        (bigSearchFilters.smoker === true && user.userProfile.smoker === true);

      const matchesPiercing =
        filters.piercing === null ||
        bigSearchFilters.piercing === null ||
        (filters.piercing === true && user.userProfile.piercing === true) ||
        (bigSearchFilters.piercing === true &&
          user.userProfile.piercing === true);

      const matchesMassageOnly =
        filters.massageOnly === null ||
        bigSearchFilters.massageOnly === null ||
        (filters.massageOnly === true &&
          user.userProfile.massageOnly === true) ||
        (bigSearchFilters.massageOnly === true &&
          user.userProfile.massageOnly === true);
      const matchesAlcohol =
        filters.alcohol === null ||
        bigSearchFilters.alcohol === null ||
        (filters.alcohol === true && user.userProfile.alcohol === true) ||
        (bigSearchFilters.alcohol === true &&
          user.userProfile.alcohol === true);
      const matchesIsVerified =
        filters.isVerified === null ||
        bigSearchFilters.isVerified === null ||
        (filters.isVerified === true && user.isVerified === true) ||
        (bigSearchFilters.isVerified === true && user.isVerified === true);

      const statusResult = matchesStatus();
      const weightResult = matchesWeightRange();
      const sizeResult = matchesSizeRange();
      const finalResult =
        matchesGender &&
        matchesHairColor &&
        matchesEyeColor &&
        matchesNationality &&
        matchesEthnicity &&
        matchesLanguages &&
        matchesIntimateHairCut &&
        matchesLocation &&
        matchesZigounette &&
        matchesBraCup &&
        matchesOrientation &&
        matchesAgeRange() &&
        matchesIsVerified &&
        matchesTatoo &&
        matchesSmoker &&
        matchesPiercing &&
        matchesPractices &&
        matchesMassageOnly &&
        matchesAlcohol &&
        matchesDistance &&
        statusResult &&
        weightResult &&
        sizeResult;

      return finalResult;
    });

    const filteredWithDistance = filtered.map((announce) => {
      const user = users.find((u) => u.id === announce.user.id);
      if (!user) return { ...announce, distance: Infinity };

      const selectedLocation = [
        ...(filters.location ?? []),
        ...(bigSearchFilters.location ?? []),
      ][0];
      if (!selectedLocation) return { ...announce, distance: 0 };

      const city = getCityCoordinates(selectedLocation);
      const userCityCoordinates = getCityCoordinates(user.address.city);

      const distance = calculateDistance(
        city.latitude,
        city.longitude,
        userCityCoordinates.latitude,
        userCityCoordinates.longitude
      );

      return { ...announce, distance };
    });

    const sortedByDistance = filteredWithDistance.sort(
      (a, b) => a.distance - b.distance
    );

    const sortedByDateAndDistance = sortedByDistance.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    setFilteredAnnounces(sortedByDateAndDistance);
    setPage(1);
    setDisplayedAnnounces([]);
  }, [filters, users, announces]);

  useEffect(() => {
    if (filteredAnnounces.length === 0) return;

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newAnnounces = filteredAnnounces.slice(startIndex, endIndex);

    setDisplayedAnnounces((prev) => [
      ...prev,
      ...newAnnounces.filter(
        (newAnnounce) =>
          !prev.some((announce) => announce.id === newAnnounce.id)
      ),
    ]);
    setHasMore(endIndex < filteredAnnounces.length);
    setLoading(false);
  }, [page, filteredAnnounces]);

  return (
    <div className="announces-list px-5">
      {isFilterOpen && (
        <BigFilter
          isFilterOpen={isFilterOpen}
          toggleFilter={toggleFilter}
          onFiltersChange={handleFiltersChange}
        />
      )}
      {displayedAnnounces.map((announce, index) => (
        <div
          key={announce.id}
          ref={
            index === displayedAnnounces.length - 1
              ? lastAnnounceElementRef
              : null
          }
        >
          <ProfileCard
            key={announce.id}
            announce={announce}
            user={announce.user}
            gallery={announce.gallery || []}
            statusToShow={statusToShow}
          />
        </div>
      ))}
    </div>
  );
};

export default AnnouncesSearch;
