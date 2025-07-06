import React from "react";
import { ThumbnailImage } from "../../api/model";
import LazyImage from "./LazyImage";
import { HeartIcon } from "@heroicons/react/24/solid";

interface ThumbnailGridProps {
  images: ThumbnailImage[];
  columnCount?: number;
  onClick?: (id: number) => void;
}

const ThumbnailGrid: React.FC<ThumbnailGridProps> = ({
  images,
  columnCount = 3,
  onClick,
}) => {
  return (
    <div
      className="grid gap-0.5"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {images.map((image) => (
        <div
          key={image.id}
          className="relative w-full h-full cursor-pointer"
          onClick={() => onClick?.(image.id)}
        >
          <LazyImage
            src={`http://192.168.11.11/api/static/${image.thumbnail}`}
            alt={`Thumbnail ${image.id}`}
            onClick={() => onClick?.(image.id)}
          />
          {image.is_favorite && (
            <div className="absolute bottom-1 right-1 bg-pink-500 p-1 rounded-full shadow">
              <HeartIcon className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ThumbnailGrid;
