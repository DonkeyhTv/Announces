import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import MyButton from "./buttons";
import DropZone from "./DropZone";
import ImageGallery from "./ImageGallery";
import AdditionalImagesGallery from "./AdditionalImagesGallery";
import useImageUpload from "./UseImageUpload";
import Modal from "./MyModal";

const ImageUpload: React.FC = () => {
  const { t } = useTranslation();
  const [showAdditionalImages, setShowAdditionalImages] = useState(false);
  const {
    selectedFiles,
    uploadedImages,
    additionalImages,
    totalFolderSize,
    uploadProgress,
    isUploading,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDelete,
    handleDeleteAllImages,
    handleCoverChange,
    updateTrigger,
    addImageToGallery,
    currentGalleryStatus,
    onRemoveStatus,
    isModalOpen,
    setIsModalOpen,
    errorMessage,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    confirmDeleteAllImages,
    cancelDeleteAllImages,
  } = useImageUpload();

  const toggleShowAdditionalImages = () => {
    setShowAdditionalImages(!showAdditionalImages);
  };

  return (
    <>
      <DropZone
        selectedFiles={selectedFiles}
        uploadProgress={uploadProgress}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onChange={handleFileChange}
      />
      <ImageGallery
        uploadedImages={uploadedImages}
        totalFolderSize={totalFolderSize}
        onDelete={handleDelete}
        onCoverChange={handleCoverChange}
        onRemoveStatus={onRemoveStatus}
        currentGalleryStatus={currentGalleryStatus}
        showAllImages={false}
        updateTrigger={updateTrigger}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        errorMessage={errorMessage}
      />
      {showAdditionalImages && (
        <AdditionalImagesGallery
          additionalImages={additionalImages}
          onAddToGallery={addImageToGallery}
          currentGalleryStatus={currentGalleryStatus}
        />
      )}
      <div className="w-full flex justify-center space-x-4">
        {uploadedImages.length > 0 && (
          <MyButton
            onClick={handleDeleteAllImages}
            className="justify-center"
            variant="anthracite"
          >
            {t("delete-all-pictures")}
          </MyButton>
        )}
        {additionalImages.length > 0 && (
          <MyButton
            onClick={toggleShowAdditionalImages}
            className="justify-center"
            variant="anthracite"
          >
            {showAdditionalImages
              ? t("hide-available-images")
              : t("show-available-images")}
          </MyButton>
        )}
      </div>
      <Modal isOpen={isConfirmModalOpen} onClose={cancelDeleteAllImages}>
        <div className="bg-white p-4 rounded">
          <h2 className="text-xl font-bold mb-2">{t("confirm-delete-all")}</h2>
          <p>{t("confirm-delete-all-message")}</p>
          <div className="mt-4 flex justify-end space-x-2">
            <MyButton onClick={cancelDeleteAllImages} variant="anthracite">
              {t("cancel")}
            </MyButton>
            <MyButton onClick={confirmDeleteAllImages} variant="redpink">
              {t("confirm")}
            </MyButton>
          </div>
        </div>
      </Modal>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default ImageUpload;
