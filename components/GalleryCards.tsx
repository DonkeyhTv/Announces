import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { fetchUsers } from "../../services/fetchAllUser";

interface GalleryItem {
  id: number;
  fileUrl: string;
  fileName: string;
  cover?: boolean;
  status: number;
}

interface GalleryProps {
  gallery: GalleryItem[];
  coverImage: GalleryItem | undefined;
  gender: string | undefined;
  statusToShow: number;
  isEstablishment?: boolean;
}

const GalleryCards: React.FC<GalleryProps> = ({
  gallery,
  coverImage,
  gender,
  statusToShow,
  isEstablishment = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userStatus, setUserStatus] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const users = await fetchUsers();
        const user = users.find((user: { id: number }) => user.id === 1);
        if (user) {
          setUserStatus(user.status);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const defaultImageUrl = (gender: string | undefined) => {
    const baseUrl = window.location.origin;
    if (isEstablishment) {
      return `${baseUrl}/images/establishment.jpg`;
    }
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

  const filteredGallery = useMemo(() => {
    const filtered = gallery.filter((item) =>
      item.status.toString().includes(statusToShow.toString())
    );
    return filtered;
  }, [gallery, statusToShow]);

  const sortedGallery = useMemo(() => {
    if (filteredGallery.length > 0) {
      return [...filteredGallery].sort((b) => (b.cover === true ? -1 : 1));
    } else {
      return [
        {
          id: 0,
          fileUrl: defaultImageUrl(gender),
          fileName: "Default Image",
          status: statusToShow,
        },
      ];
    }
  }, [filteredGallery, gender, statusToShow, isEstablishment]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + sortedGallery.length) % sortedGallery.length
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % sortedGallery.length);
  };

  const currentImage = sortedGallery[currentIndex];

  return (
    <div className="relative w-full h-full">
      <img
        src={currentImage.fileUrl}
        alt={currentImage.fileName}
        className="w-full h-full object-cover"
        onContextMenu={(e) => e.preventDefault()}
      />
      {sortedGallery.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l"
          >
            <ChevronRight />
          </button>
        </>
      )}
    </div>
  );
};

export default GalleryCards;
