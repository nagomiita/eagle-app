import React from "react";
import { useAppContext } from "../contexts/AppContext";
import { ThumbnailImage } from "../api/model";
import LazyImage from "./LazyImage";

const ImageGrid: React.FC = () => {
  const { images, isLoading, columnCount, openModal } = useAppContext();

  const LoadingIndicator = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
    </div>
  );

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div
      className={`grid gap-0.5`}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {images.map((image: ThumbnailImage) => (
        <LazyImage
          key={image.id}
          src={`http://192.168.11.11/api/static/${image.thumbnail}`}
          alt={`Thumbnail ${image.id}`}
          onClick={() => openModal(image.id)}
        />
      ))}
    </div>
  );
};

export default ImageGrid;
