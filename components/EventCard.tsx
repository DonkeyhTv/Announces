import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User } from "../interfaces/user";
import formatBelgianPhoneNumber from "../fonctions/formatBelgiumPhone";
import { Event } from "../interfaces/event";
import GalleryCards from "./GalleryCards";
import { API_BASE_URL } from "../../services/api";

interface EventCardProps {
  event: Event;
  user: User;
  gallery: {
    id: number;
    fileUrl: string;
    fileName: string;
    cover?: boolean;
    status: number;
  }[];
  statusToShow: number;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  user,
  gallery,
  statusToShow,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultImageUrl = "/images/establishment.jpg";
  const imageUrl = event.galleryUrl || defaultImageUrl;

  const handleClick = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/event/${event.id}/view`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      navigate(`/event/${event.id}`, {
        state: {
          from: location.pathname,
          eventData: data,
        },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Link
      to={`/event/${event.id}`}
      className="group bg-grisclair text-redpink hover:bg-redpink transition-all rounded-lg shadow-md"
      style={{
        fontFamily: "Poppins, sans-serif",
      }}
      onClick={handleClick}
    >
      <div className="overflow-hidden rounded-t-lg h-44">
        <GalleryCards
          gallery={gallery}
          coverImage={gallery.find((img) => img.cover)}
          gender={user.userProfile.gender}
          statusToShow={Number(statusToShow)}
        />
      </div>

      <div className="text-center p-3">
        <p className="text-redpink uppercase font-bold group-hover:text-white transition-all">
          {event.title}
        </p>
        <p className="text-anthracite group-hover:text-white group-hover:opacity-80 transition-all">
          {user.address?.zip_code} {user.address?.city}
        </p>
        <p className="text-anthracite group-hover:text-white group-hover:opacity-80 transition-all">
          {user.address?.number} {user.address?.street}
        </p>

        <p className="text-anthracite group-hover:text-white group-hover:opacity-80 transition-all">
          {event.phone ? formatBelgianPhoneNumber(event.phone) : "N/A"}
        </p>
      </div>
    </Link>
  );
};

export default EventCard;
