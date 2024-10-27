import React from "react";
import { useAppContext } from "../contexts/AppContext";
import { ImageData } from "../types";

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
      className={`grid gap-2.5`}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {images.map((image: ImageData) => (
        <div key={image.id} className="aspect-square">
          <img
            src={image.thumbnail || undefined}
            alt={`Thumbnail ${image.id}`}
            onClick={() => openModal(image)}
            className="w-full h-full object-cover cursor-pointer rounded"
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
