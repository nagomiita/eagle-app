import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import ThumbnailGrid from "./parts/ThumbnailGrid";
import FolderGrid from "./parts/FolderGrid";
import ImageModal from "./ImageModal";
import { FolderInfo } from "../api/model";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
const ImageGrid: React.FC = () => {
  const { images, folders, isLoading, columnCount, openModal, showFolders } =
    useAppContext();

  const [selectedFolder, setSelectedFolder] = useState<FolderInfo | null>(null);

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
      {selectedFolder ? (
        <div className="mb-4">
          <div className="flex">
            <button
              onClick={() => setSelectedFolder(null)}
              className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-all"
              title="フォルダー一覧へ戻る"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold">📁 {selectedFolder.name}</h2>
          </div>
          <ThumbnailGrid
            images={selectedFolder.thumbnail_images}
            columnCount={columnCount}
            onClick={(id) => openModal(id)}
          />
        </div>
      ) : showFolders ? (
        <FolderGrid
          folders={folders}
          columnCount={columnCount}
          onClickFolder={(id) => {
            const folder = folders.find((f) => String(f.id) === id);
            if (folder) {
              setSelectedFolder(folder);
            }
          }}
        />
      ) : (
        <ThumbnailGrid
          images={images}
          columnCount={columnCount}
          onClick={(id) => openModal(id)}
        />
      )}

      <ImageModal />
    </>
  );
};

export default ImageGrid;
