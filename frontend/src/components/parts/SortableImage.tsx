import { useSortable } from "@dnd-kit/sortable";

import React from "react";
import { ThumbnailImage } from "../../api/model";
import { CSS } from "@dnd-kit/utilities";

export const SortableImage: React.FC<{
  image: ThumbnailImage;
  disabled?: boolean;
}> = ({
  image,
  disabled = false, // ドラッグを無効化するためのフラグ
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image.id,
    disabled: disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : "auto", // ドラッグ中に最前面に
    position: isDragging ? "relative" : "static", // z-index効かせるために必要
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(disabled ? {} : listeners)} // disabledの時はlistenersを適用しない
      className={
        disabled ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
      }
    >
      <img
        src={`http://192.168.11.11/api/static/${image.thumbnail}`}
        alt=""
        className="w-full rounded mb-1"
        draggable={false} // 画像のネイティブドラッグを無効化
      />
      <div className="text-sm text-white-700 truncate text-center">
        {image.name}
      </div>
    </div>
  );
};
