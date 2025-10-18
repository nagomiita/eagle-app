import { useSortable } from "@dnd-kit/sortable";
import React from "react";
import { ThumbnailImage } from "../../api/model";
import { CSS } from "@dnd-kit/utilities";

export const SortableImage: React.FC<{
  image: ThumbnailImage;
  disabled?: boolean;
  onClickImage?: (id: number) => void;
}> = ({ image, disabled = false, onClickImage }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : "auto",
    position: isDragging ? "relative" : "static",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(disabled ? {} : listeners)}
      onClick={() => {
        if (!isDragging) onClickImage?.(image.id);
      }}
      className={
        disabled ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
      }
    >
      <img
        src={`http://192.168.11.11/api/static/${image.thumbnail}`}
        alt=""
        className="w-full rounded mb-1"
        draggable={false}
      />
      <div className="text-sm text-white-700 truncate text-center">
        {image.name}
      </div>
    </div>
  );
};
