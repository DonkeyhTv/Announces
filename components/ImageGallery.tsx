import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ImageItem from "./ImageItem";
import Modal from "./MyModal";

interface ImageGalleryProps {
  uploadedImages: Array<{
    url: string;
    status: number;
    cover: boolean;
    fileName: string;
  }>;
  totalFolderSize: number;
  onDelete: (index: number) => void;
  onCoverChange: (fileUrl: string) => void;
  onRemoveStatus: (fileUrl: string, currentStatus: number) => void;
  showAllImages: boolean;
  currentGalleryStatus: number;
  updateTrigger: number;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  errorMessage: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  uploadedImages,
  totalFolderSize,
  onDelete,
  onCoverChange,
  onRemoveStatus,
  showAllImages,
  currentGalleryStatus,
  updateTrigger,
  isModalOpen,
  setIsModalOpen,
  errorMessage,
}) => {
  const { t } = useTranslation();
  const [localImages, setLocalImages] = useState(uploadedImages);

  useEffect(() => {
    setLocalImages(uploadedImages);
  }, [uploadedImages, updateTrigger]);

  return (
    <div>
      <div className="p-2 bg-anthracite my-2 rounded-lg text-white text-center">
        {t("storage-used")} : {totalFolderSize.toFixed(2)} / 10 MB
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {localImages.map((image, index) => (
          <ImageItem
            key={image.url}
            image={image}
            index={index}
            onDelete={onDelete}
            onCoverChange={onCoverChange}
            onRemoveStatus={onRemoveStatus}
            showAllImages={showAllImages}
            currentGalleryStatus={currentGalleryStatus}
          />
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-white p-4 rounded">
          <h2 className="text-xl font-bold mb-2">{t("error")}</h2>
          <p>{errorMessage}</p>
          <button
            className="mt-4 bg-redpink text-white px-4 py-2 rounded"
            onClick={() => setIsModalOpen(false)}
          >
            {t("close")}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ImageGallery;
