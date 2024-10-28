import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdDelete, MdRemoveCircleOutline } from "react-icons/md";
import { Checkbox, Grid } from "@mui/material";
import { IoMdEye } from "react-icons/io";
import Tooltip from "./MyTooltip";
import MyFixedTooltip from "./MyFixedTooltip";

interface ImageItemProps {
  image: { url: string; status: number; cover: boolean; fileName: string };
  index: number;
  onDelete: (index: number) => void;
  onCoverChange: (fileUrl: string) => void;
  onRemoveStatus: (fileUrl: string, currentStatus: number) => void;
  showAllImages: boolean;
  currentGalleryStatus: number;
}

const ImageItem: React.FC<ImageItemProps> = ({
  image,
  index,
  onDelete,
  onCoverChange,
  onRemoveStatus,
  showAllImages,
  currentGalleryStatus,
}) => {
  const { t } = useTranslation();
  const [deleteTooltip, setDeleteTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
  });
  const [removeTooltip, setRemoveTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
  });
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const removeButtonRef = useRef<HTMLButtonElement>(null);

  const handleRemoveStatus = (event: React.MouseEvent) => {
    event.preventDefault();
    onRemoveStatus(image.url, currentGalleryStatus);
  };
  const showTooltip = (
    buttonRef: React.RefObject<HTMLButtonElement>,
    setTooltipState: React.Dispatch<
      React.SetStateAction<{ show: boolean; x: number; y: number }>
    >
  ) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipState({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
  };

  const hideTooltip = (
    setTooltipState: React.Dispatch<
      React.SetStateAction<{ show: boolean; x: number; y: number }>
    >
  ) => {
    setTooltipState({ show: false, x: 0, y: 0 });
  };

  return (
    <div
      className={`p-2 rounded-lg bg-grisclair`}
      style={{
        position: "relative",
        backgroundColor: image.cover ? "#ff005a" : "#f5f5f5",
        marginRight: "10px",
        marginBottom: "10px",
      }}
    >
      <img
        src={image.url}
        alt={`Uploaded ${index}`}
        style={{
          width: "200px",
          height: "200px",
          borderRadius: "5px",
          objectFit: "cover",
          border: "0px solid #fff",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
        }}
      />
      {!showAllImages && (
        <>
          <div className="flex justify-center pt-2">
            <button
              ref={deleteButtonRef}
              className="bg-anthracite text-white px-2 top-3 right-3 py-2 absolute hover:bg-redpink rounded-lg"
              onClick={() => onDelete(index)}
              onMouseEnter={() =>
                showTooltip(deleteButtonRef, setDeleteTooltip)
              }
              onMouseLeave={() => hideTooltip(setDeleteTooltip)}
            >
              <MdDelete />
            </button>
            <button
              ref={removeButtonRef}
              className="bg-anthracite text-white px-2 top-3 right-12 py-2 absolute hover:bg-redpink rounded-lg"
              onClick={handleRemoveStatus}
              onMouseEnter={() =>
                showTooltip(removeButtonRef, setRemoveTooltip)
              }
              onMouseLeave={() => hideTooltip(setRemoveTooltip)}
            >
              <IoMdEye />
            </button>
          </div>
          <div className="flex justify-center text-sm">
            <Grid item xs={2}>
              <label
                className={`form-control-label item-${index} flex justify-left cursor-pointer items-center w-full ml-0`}
                style={{
                  color: image.cover ? "white" : "#222121",
                  marginLeft: "0px",
                }}
              >
                <Checkbox
                  checked={image.cover}
                  onChange={() => onCoverChange(image.url)}
                  name={image.url}
                  disabled={image.cover}
                  style={{
                    color: image.cover ? "white" : "#222121",
                  }}
                />
                {t("create-ad.cover-image")}
              </label>
            </Grid>
          </div>
        </>
      )}
      {deleteTooltip.show && (
        <MyFixedTooltip
          text="delete-from-gallery"
          x={deleteTooltip.x}
          y={deleteTooltip.y}
        />
      )}
      {removeTooltip.show && (
        <MyFixedTooltip
          text="hide-from-gallery"
          x={removeTooltip.x}
          y={removeTooltip.y}
        />
      )}
    </div>
  );
};

export default ImageItem;
