import React, { useEffect, useState } from "react";
import { EstablishmentCard } from "./EstablishmentCard";
import { useFetchEstablishments } from "../hooks/useFetchEstablishments";
import { User, Establishment } from "../interfaces/user";
import { fetchUsers } from "../../services/fetchAllUser";
import { API_BASE_URL } from "../../services/api";
import { fetchEstablishmentDetails } from "../../services/announcesEstablishment";
import calculateAge from "../fonctions/calculateAge";
import { useTranslation } from "react-i18next";
import citiesData from "../../public/data/cities.json";
import { useLocation, useNavigate } from "react-router-dom";
import EstablishmentsFilters from "./EstablishmentsFilters";

interface EstablishmentWithUser extends Establishment {
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

type SortType =
  | ""
  | "maison privee"
  | "bars et clubs prive"
  | "hotels coquins"
  | "saunas prives"
  | "salons de massage"
  | "clubs echangistes";

interface AnnouncesEstablishmentProps {
  initialStatusFilter: string | null;
}
const AnnouncesEstablishment: React.FC<AnnouncesEstablishmentProps> = ({
  initialStatusFilter,
}) => {
  const { t } = useTranslation();
  const { loading, error } = useFetchEstablishments();
  const [establishmentsWithUsers, setEstablishmentsWithUsers] = useState<
    EstablishmentWithUser[]
  >([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState<
    EstablishmentWithUser[]
  >([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedStatuses] = useState<string[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<ProvinceOption[]>([]);
  const [, setStatusOptions] = useState<StatusOption[]>([]);
  const location = useLocation();
  const [statusToShow, setStatusToShow] = useState(1);
  const [sortType, setSortType] = useState<SortType>(
    (initialStatusFilter as SortType) || ""
  );

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

        const response = await fetch(`${API_BASE_URL}/establishments`);
        if (!response.ok) {
          throw new Error("Failed to fetch announces");
        }
        const data = await response.json();
        const announceIds = data.map((announce: { id: string }) => announce.id);

        const announceDetails = await Promise.all(
          announceIds.map(async (id: string) => {
            const announceData = await fetchEstablishmentDetails(id);
            const user = usersData.find(
              (user) => user.id === announceData.establishment.userId
            );

            const filteredGallery = (announceData.gallery || []).filter(
              (img: any) =>
                img.status.toString().includes(statusToShow.toString())
            );

            return {
              ...announceData.establishment,
              age: user ? calculateAge(user.birthday) : null,
              user: user || {
                id: 0,
                birthday: "",
                nickname: "",
                userProfile: { gender: "", orientation: "" },
                address: { city: "", zip_code: 0 },
              },
              galleryUrl: filteredGallery.find((img: any) => img.cover)
                ?.fileUrl,
              gallery: filteredGallery,
            };
          })
        );

        const sortedAnnounces = announceDetails.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setEstablishmentsWithUsers(sortedAnnounces);
        setFilteredEstablishments(sortedAnnounces);

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
    let filtered = establishmentsWithUsers;

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

    setFilteredEstablishments(filtered);
  }, [selectedProvince, selectedStatuses, sortType, establishmentsWithUsers]);

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setSortType(statusParam as SortType);
    }
  }, [location]);

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
        {filteredEstablishments.map((establishmentWithUser) => (
          <EstablishmentCard
            key={establishmentWithUser.id}
            establishment={establishmentWithUser}
            user={establishmentWithUser.user}
            gallery={establishmentWithUser.gallery || []}
            statusToShow={statusToShow}
            isEstablishment={true}
          />
        ))}
      </div>
    </div>
  );
};

export default AnnouncesEstablishment;
