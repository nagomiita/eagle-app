import React from "react";
import { useAppContext } from "../contexts/AppContext";
import { FolderInfo } from "../types";

const FolderList: React.FC = () => {
  const { folders, currentFolder, handleFolderClick, handleBackClick } =
    useAppContext();

  const renderFolder = (folder: FolderInfo) => (
    <div
      key={folder.id}
      className="mb-4 cursor-pointer"
      onClick={() => handleFolderClick(folder)}
    >
      <h2 className="text-xl font-bold">{folder.name}</h2>
      {folder.folder_image[1] && (
        <img
          src={`data:image/${folder.folder_image[0]};base64,${folder.folder_image[1]}`}
          alt={folder.name}
          className="w-32 h-32 object-cover rounded"
        />
      )}
    </div>
  );

  const renderFolderList = (folderList: FolderInfo[]) => (
    <div className="folder-list grid grid-cols-4 gap-4">
      {folderList.map(renderFolder)}
    </div>
  );

  return (
    <div className="mb-5">
      {currentFolder && (
        <button
          onClick={handleBackClick}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Back
        </button>
      )}
      {currentFolder
        ? renderFolderList(currentFolder.children)
        : renderFolderList(folders)}
    </div>
  );
};

export default FolderList;
