import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "../interfaces/user";
import formatBelgianPhoneNumber from "../fonctions/formatBelgiumPhone";
import { Establishment } from "../interfaces/establishment";
import { API_BASE_URL } from "../../services/api";
import GalleryCards from "./GalleryCards";

interface EstablishmentCardProps {
  user: User;
  establishment: Establishment;
  gallery: {
    id: number;
    fileUrl: string;
    fileName: string;
    cover?: boolean;
    status: number;
  }[];
  statusToShow: number;
  isEstablishment?: boolean;
}

export const EstablishmentCard: React.FC<EstablishmentCardProps> = ({
  user,
  establishment,
  gallery,
  statusToShow,
  isEstablishment,
}) => {
  const navigate = useNavigate();

  const handleClick = async (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `${API_BASE_URL}/establishment/${establishment.id}/view`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      navigate(`/establishment/${establishment.id}`);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const userGender = user?.userProfile?.gender || "unknown";
  const userZipCode = user?.address?.zip_code || "";
  const userCity = user?.address?.city || "";
  const establishmentTitle =
    user?.establishment?.title || establishment.title || "Untitled";
  const establishmentPhone =
    user?.establishment?.phone || establishment.phone || "";

  return (
    <Link
      to={`/establishment/${establishment.id}`}
      className="group bg-grisclair text-redpink hover:bg-redpink transition-all rounded-lg shadow-md"
      style={{
        fontFamily: "Poppins, sans-serif",
      }}
      onClick={handleClick}
    >
      <div className="overflow-hidden rounded-t-lg h-48">
        <GalleryCards
          gallery={gallery}
          coverImage={gallery.find((img) => img.cover)}
          gender={userGender}
          statusToShow={Number(statusToShow)}
          isEstablishment={isEstablishment}
        />
      </div>

      <div className="text-center p-3">
        <p className="text-redpink uppercase font-bold group-hover:text-white transition-all">
          {establishmentTitle}
        </p>
        <p className="text-anthracite group-hover:text-white group-hover:opacity-80 transition-all">
          {userZipCode} {userCity}
        </p>

        <p className="text-anthracite group-hover:text-white group-hover:opacity-80 transition-all">
          {establishmentPhone
            ? formatBelgianPhoneNumber(establishmentPhone)
            : "N/A"}
        </p>
      </div>
    </Link>
  );
};

export default EstablishmentCard;
