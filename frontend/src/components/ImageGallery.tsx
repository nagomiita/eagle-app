import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import ThumbnailGrid from "./parts/ThumbnailGrid";
import FolderGrid from "./parts/FolderGrid";
import ImageModal from "./ImageModal";
import { FolderInfo } from "../api/model";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import FolderImageEditor from "./parts/FolderImageEditor";
const ImageGrid: React.FC = () => {
  const { images, folders, isLoading, columnCount, openModal, showFolders } =
    useAppContext();

  const [selectedFolder, setSelectedFolder] = useState<FolderInfo | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedFolder(null);
                  setIsEditMode(false);
                }}
                className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-all"
                title="フォルダー一覧へ戻る"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold">📁 {selectedFolder.name}</h2>
            </div>
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
              >
                ✏️ 並び順を変更
              </button>
            )}
          </div>

          {isEditMode ? (
            <FolderImageEditor
              folderId={selectedFolder.id}
              initialImages={selectedFolder.thumbnail_images}
              onExitEditMode={() => setIsEditMode(false)}
              columnCount={columnCount}
            />
          ) : (
            <ThumbnailGrid
              images={selectedFolder.thumbnail_images}
              folders={folders}
              columnCount={columnCount}
              onClick={(id) => openModal(id)}
            />
          )}
        </div>
      ) : showFolders ? (
        <FolderGrid
          folders={folders}
          columnCount={columnCount}
          onClickFolder={(id) => {
            const folder = folders.find((f) => f.id === id);
            if (folder) {
              setSelectedFolder(folder);
              setIsEditMode(false);
            }
          }}
        />
      ) : (
        <div>
          <FolderGrid
            folders={folders}
            columnCount={columnCount}
            onClickFolder={(id) => {
              const folder = folders.find((f) => f.id === id);
              if (folder) {
                setSelectedFolder(folder);
                setIsEditMode(false);
              }
            }}
          />
          <ThumbnailGrid
            images={images}
            folders={folders}
            columnCount={columnCount}
            onClick={(id) => openModal(id)}
          />
        </div>
      )}
      {selectedFolder ? (
        <ImageModal images={selectedFolder.thumbnail_images} />
      ) : (
        <ImageModal images={images} />
      )}
    </>
  );
};

export default ImageGrid;
