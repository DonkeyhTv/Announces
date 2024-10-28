import React, { useState, useMemo } from "react";
import Modal from "./MyModal";

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
}

const Gallery: React.FC<GalleryProps> = ({
  gallery,
  coverImage,
  gender,
  statusToShow,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

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

  const filteredGallery = useMemo(() => {
    return gallery.filter((item) =>
      item.status?.toString().includes(statusToShow.toString())
    );
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
  }, [filteredGallery, gender, statusToShow]);

  const validCoverImage = useMemo(
    () =>
      coverImage && coverImage.status === statusToShow ? coverImage : undefined,
    [coverImage, statusToShow]
  );

  const displayImage = validCoverImage || sortedGallery[0];

  const openModal = (index: number) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  const handlePrev = () => {
    setPhotoIndex(
      (photoIndex + sortedGallery.length - 1) % sortedGallery.length
    );
  };

  const handleNext = () => {
    setPhotoIndex((photoIndex + 1) % sortedGallery.length);
  };

  const coverImageIndex = sortedGallery.findIndex(
    (item) => item.cover === true
  );

  return (
    <>
      <div className="w-full mb-2 overflow-hidden rounded">
        <img
          src={displayImage.fileUrl}
          alt={displayImage.fileName}
          onClick={() =>
            openModal(coverImageIndex !== -1 ? coverImageIndex : 0)
          }
          onContextMenu={(e) => e.preventDefault()}
          className="w-full object-cover rounded cursor-pointer hover:rounded transform transition-transform duration-300 hover:scale-110"
        />
      </div>
      {sortedGallery.length > 0 && (
        <div className="w-full grid grid-cols-3 gap-2">
          {sortedGallery.map((item, index) => (
            <div key={item.id} className="overflow-hidden rounded">
              <img
                src={item.fileUrl}
                alt={item.fileName}
                className="w-full h-40 rounded object-cover cursor-pointer transform transition-transform duration-300 hover:scale-110"
                onClick={() => openModal(index)}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          ))}
        </div>
      )}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
      >
        <img
          src={sortedGallery[photoIndex]?.fileUrl}
          alt={sortedGallery[photoIndex]?.fileName}
          className="max-w-full max-h-[90vh] rounded-lg"
          onContextMenu={(e) => e.preventDefault()}
        />
      </Modal>
    </>
  );
};

export default Gallery;
