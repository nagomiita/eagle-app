import React from "react";
import { useAppContext } from "../contexts/AppContext";
import ThumbnailGrid from "./parts/ThumbnailGrid";
import ImageModal from "./ImageModal";

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
    <>
      <ThumbnailGrid
        images={images}
        columnCount={columnCount}
        onClick={(id) => openModal(id)}
      />
      <ImageModal />
    </>
  );
};

export default ImageGrid;
