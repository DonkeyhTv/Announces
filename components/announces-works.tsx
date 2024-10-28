import React, { useEffect, useState } from "react";

import { useFetchWorks } from "../hooks/useFetchWorks";
import { User, Work } from "../interfaces/user";
import { fetchUsers } from "../../services/fetchAllUser";
import { API_BASE_URL } from "../../services/api";
import { fetchWorkDetails } from "../../services/announcesWorks";
import calculateAge from "../fonctions/calculateAge";
import MySelect from "./MySelect";
import { useTranslation } from "react-i18next";
import citiesData from "../../public/data/cities.json";
import WorkCard from "./WorkCard";
import EstablishmentsFilters from "./EstablishmentsFilters";

interface WorkWithUser extends Work {
  user: User;
  age: number | null;
  galleryUrl?: string;
  gallery?: {
    id: number;
    fileUrl: string;
    fileName: string;
    cover?: boolean;
    status: number;
  }[];
}
interface ProvinceOption {
  value: string;
  label: string;
}

interface StatusOption {
  value: string;
  label: string;
}

interface AnnouncesWorkProps {
  initialStatusFilter: string | null;
}

type SortType =
  | ""
  | "maison privee"
  | "bars et clubs prive"
  | "hotels coquins"
  | "saunas prives"
  | "salons de massage"
  | "clubs echangistes";

const AnnouncesWorks: React.FC<AnnouncesWorkProps> = ({
  initialStatusFilter,
}) => {
  const { t } = useTranslation();
  const { loading, error } = useFetchWorks();
  const [worksWithUsers, setWorksWithUsers] = useState<WorkWithUser[]>([]);
  const [filteredWorks, setFilteredWorks] = useState<WorkWithUser[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedStatuses] = useState<string[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<ProvinceOption[]>([]);
  const [, setStatusOptions] = useState<StatusOption[]>([]);
  const [sortType, setSortType] = useState<SortType>(
    (initialStatusFilter as SortType) || ""
  );
  const [statusToShow, setStatusToShow] = useState(3);

  const findProvince = (city: string): string | undefined => {
    for (const province of citiesData) {
      if (
        province.cities.some(
          (c) => c.city_fr.toLowerCase() === city.toLowerCase()
        )
      ) {
        return province.province;
      }
    }
    return undefined;
  };

  useEffect(() => {
    if (initialStatusFilter) {
      setSortType(initialStatusFilter as SortType);
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await fetchUsers();

        const response = await fetch(`${API_BASE_URL}/works`);
        if (!response.ok) {
          throw new Error("Failed to fetch announces");
        }
        const data = await response.json();
        const announceIds = data.map((announce: { id: string }) => announce.id);

        const announceDetails = await Promise.all(
          announceIds.map(async (id: string) => {
            const announceData = await fetchWorkDetails(id);
            const user = usersData.find(
              (user) => user.id === announceData.work.userId
            );

            // Filter gallery images based on statusToShow
            const filteredGallery = (announceData.gallery || []).filter(
              (img: any) =>
                img.status.toString().includes(statusToShow.toString())
            );

            return {
              ...announceData.work,
              age: user ? calculateAge(user.birthday) : null,
              user: user || {
                id: 0,
                birthday: "",
                nickname: "",
                userProfile: { gender: "", orientation: "" },
                address: { city: "", zip_code: 0, street: "", number: 0 },
              },
              galleryUrl:
                filteredGallery.find((img: any) => img.cover)?.fileUrl ||
                filteredGallery[0]?.fileUrl,
              gallery: filteredGallery,
            };
          })
        );

        const sortedAnnounces = announceDetails.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setWorksWithUsers(sortedAnnounces);
        setFilteredWorks(sortedAnnounces);

        const uniqueProvinces = Array.from(
          new Set(
            sortedAnnounces
              .map((e) => findProvince(e.user.address.city))
              .filter(Boolean)
          )
        );
        const provinceOpts = uniqueProvinces.map((province) => ({
          value: province!,
          label: province!,
        }));
        setProvinceOptions([...provinceOpts]);

        const uniqueStatuses = Array.from(
          new Set(sortedAnnounces.flatMap((e) => e.status))
        );
        setStatusOptions(
          uniqueStatuses.map((status) => ({ value: status, label: t(status) }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [t]);

  useEffect(() => {
    let filtered = worksWithUsers;

    if (selectedProvince) {
      filtered = filtered.filter(
        (e) => findProvince(e.user.address.city) === selectedProvince
      );
    }

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((e) =>
        e.status.some((status) => selectedStatuses.includes(status))
      );
    }

    if (sortType) {
      filtered = filtered.filter((e) => e.status.includes(sortType));
    }

    setFilteredWorks(filtered);
  }, [selectedProvince, selectedStatuses, sortType, worksWithUsers]);

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
  };

  const handleSortChange = (type: SortType) => {
    setSortType(type);
  };

  if (loading) {
    return <div>{t("page-loading")}</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <EstablishmentsFilters
        provinceOptions={provinceOptions}
        selectedProvince={selectedProvince}
        onProvinceChange={handleProvinceChange}
        onProvinceReset={() => setSelectedProvince("")}
        sortType={sortType}
        onSortChange={handleSortChange}
      />
      <div className="grid grid-cols-1 px-5 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredWorks.map((workWithUser: WorkWithUser) => (
          <WorkCard
            key={workWithUser.id}
            work={workWithUser}
            user={workWithUser.user}
            gallery={workWithUser.gallery || []}
            statusToShow={statusToShow}
          />
        ))}
      </div>
    </div>
  );
};

export default AnnouncesWorks;
