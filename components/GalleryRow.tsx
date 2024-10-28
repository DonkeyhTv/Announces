import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../services/api";
import { useLocation } from "react-router-dom";

interface Image {
  fileName: string;
  status: number;
}

interface GalleryProps {
  images: Image[];
  maxImages?: number;
}

const GalleryRow: React.FC<GalleryProps> = ({ images, maxImages = 7 }) => {
  const { t } = useTranslation();
  const [filteredImages, setFilteredImages] = useState<Image[]>([]);
  const userId = localStorage.getItem("userId");
  const location = useLocation();

  const getStatusFromUrl = (): number => {
    const currentPath = location.pathname;
    switch (true) {
      case currentPath.includes("dashboard/announces/") ||
        currentPath.includes("dashboard/announces-libertin/"):
        return 1;
      case currentPath.includes("dashboard/events/"):
        return 2;
      case currentPath.includes("dashboard/job-offers/"):
        return 3;
      default:
        return 0;
    }
  };

  const shouldDisplayImage = (
    imageStatus: number,
    currentStatus: number
  ): boolean => {
    return imageStatus.toString().includes(currentStatus.toString());
  };

  useEffect(() => {
    const currentStatus = getStatusFromUrl();
    const filteredByStatus = images.filter((img) =>
      shouldDisplayImage(img.status, currentStatus)
    );
    setFilteredImages(filteredByStatus.slice(0, maxImages));
  }, [images, maxImages, location]);

  return (
    <div className="mt-5 bg-grisclair rounded-lg text-center">
      <div className="mt-5 bg-grisclair2 m-2 p-2 font-bold rounded-lg text-center">
        {t("create-ad.my-gallery")}
      </div>
      <div className="flex overflow-hidden whitespace-nowrap relative">
        <div className="flex w-full scroll mb-5">
          {filteredImages.length > 0 ? (
            filteredImages.map((image, index) => (
              <img
                key={index}
                src={`${API_BASE_URL}/images/${userId}/${image.fileName}`}
                alt={`User image ${index + 1}`}
                className="m-2 w-32 h-32 object-cover rounded-lg"
              />
            ))
          ) : (
            <p className="w-full text-center p-4">{t("no-images-found")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryRow;
