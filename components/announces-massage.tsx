import React, { useEffect, useState, useRef, useCallback } from "react";
import ProfileCard from "./ProfileCard";
import { Announce } from "../interfaces/announce";
import { User } from "../interfaces/user";
import { fetchUsers } from "../../services/fetchAllUser";
import { fetchAnnounceDetails } from "../../services/announces";
import calculateAge from "../fonctions/calculateAge";
import { useSearchFilters } from "./SearchFiltersContext";
import { calculateDistance } from "../fonctions/calculateDistance";
import citiesData from "../../public/data/cities.json";

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

const AnnouncesMassage: React.FC = () => {
  const [announces, setAnnounces] = useState<Announce[]>([]);
  const [filteredAnnounces, setFilteredAnnounces] = useState<Announce[]>([]);
  const [displayedAnnounces, setDisplayedAnnounces] = useState<Announce[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { filters } = useSearchFilters();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [statusToShow, setStatusToShow] = useState(1);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);

        const response = await fetch("http://localhost:3333/api/announces");
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
  }, []);

  useEffect(() => {
    const filtered = announces.filter((announce) => {
      const user = users.find((u) => u.id === announce.user.id);
      if (!user) return false;

      if (!announce.user.userProfile.massageOnly === true) return false;

      const matchesJeCherche =
        filters.imLookingFor.length === 0 ||
        filters.imLookingFor.includes(user.userProfile.gender);

      const matchesOrientation =
        filters.orientation.length === 0 ||
        filters.orientation.includes(user.userProfile.orientation);

      let matchesLocation = filters.iLiveIn.length === 0;

      if (!matchesLocation && filters.iLiveIn.length > 0) {
        const filterCity = getCityCoordinates(filters.iLiveIn[0]);
        const userCity = getCityCoordinates(user.address.city);

        if (filterCity && userCity) {
          const distance = calculateDistance(
            filterCity.latitude,
            filterCity.longitude,
            userCity.latitude,
            userCity.longitude
          );

          console.log(
            `Distance between ${filters.iLiveIn[0]} and ${user.address.city}: ${distance} km`
          );

          if (filters.distance.length > 0) {
            const [, maxDistance] = distanceRanges[filters.distance[0]] || [
              0,
              Infinity,
            ];
            matchesLocation = distance <= maxDistance;
          } else {
            matchesLocation =
              filterCity.latitude === userCity.latitude &&
              filterCity.longitude === userCity.longitude;
          }
        }
      }

      return matchesJeCherche && matchesOrientation && matchesLocation;
    });

    if (filters.iLiveIn.length > 0) {
      const referenceCity = getCityCoordinates(filters.iLiveIn[0]);
      if (referenceCity) {
        filtered.sort((a, b) => {
          const cityA = getCityCoordinates(a.user.address.city);
          const cityB = getCityCoordinates(b.user.address.city);
          if (cityA && cityB) {
            const distanceA = calculateDistance(
              referenceCity.latitude,
              referenceCity.longitude,
              cityA.latitude,
              cityA.longitude
            );
            const distanceB = calculateDistance(
              referenceCity.latitude,
              referenceCity.longitude,
              cityB.latitude,
              cityB.longitude
            );
            return distanceA - distanceB;
          }
          return 0;
        });
      }
    }

    setFilteredAnnounces(filtered);
    setPage(1);
    setDisplayedAnnounces([]);
  }, [filters, users, announces]);

  useEffect(() => {
    setLoading(true);
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
    <div className="announces-list px-5 grid grid-cols-2 gap-4">
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
            announce={announce}
            user={announce.user}
            statusToShow={statusToShow}
            gallery={announce.gallery || []}
          />
        </div>
      ))}
      {loading && (
        <div className="col-span-2 text-center">Loading more announces...</div>
      )}
    </div>
  );
};

export default AnnouncesMassage;
