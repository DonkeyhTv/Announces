import React from "react";
import { useTranslation } from "react-i18next";

interface AdditionalImagesGalleryProps {
  additionalImages: Array<{
    url: string;
    status: number;
    cover: boolean;
    fileName: string;
  }>;
  onAddToGallery: (imageUrl: string) => void;
  currentGalleryStatus: number;
}

const AdditionalImagesGallery: React.FC<AdditionalImagesGalleryProps> = ({
  additionalImages,
  onAddToGallery,
  currentGalleryStatus,
}) => {
  const { t } = useTranslation();

  const handleAddToGallery = (
    event: React.MouseEvent<HTMLButtonElement>,
    imageUrl: string
  ) => {
    event.preventDefault();
    onAddToGallery(imageUrl);
  };

  if (additionalImages.length === 0) {
    return null; // Ne rien rendre si additionalImages est vide
  }

  return (
    <div>
      <h3 className="p-2 bg-anthracite my-2 rounded-lg text-white text-center text-base">
        {t("all-my-images")}
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {additionalImages.map((image, index) => (
          <div
            key={index}
            className="p-2 rounded-lg bg-grisclair mb-4"
            style={{
              position: "relative",
              flexBasis: "calc(20% - 10px)",
              height: "150px",
              backgroundImage: `url(${image.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "end",
              justifyContent: "center",
            }}
          >
            <button
              className="bg-anthracite text-white px-2 py-1 rounded-lg hover:bg-redpink"
              onClick={(event) => handleAddToGallery(event, image.url)}
            >
              {t("add-to-gallery")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdditionalImagesGallery;
