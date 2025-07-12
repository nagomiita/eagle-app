import React from "react";
import { FolderInfo } from "../../api/model";

interface FolderGridProps {
  folders: FolderInfo[];
  columnCount?: number;
  onClickFolder?: (id: string) => void;
}

const FolderGrid: React.FC<FolderGridProps> = ({
  folders,
  columnCount = 3,
  onClickFolder,
}) => {
  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="relative aspect-square cursor-pointer group"
          onClick={() => onClickFolder?.(String(folder.id))}
        >
          {folder.thumbnail_images.slice(0, 3).map((thumb, index) => (
            <img
              key={index}
              src={`http://192.168.11.11/api/static/${thumb.thumbnail}`}
              className={`absolute inset-0 rounded-lg shadow transition-transform ${
                index === 0
                  ? "relative z-30"
                  : index === 1
                  ? "z-20 translate-x-1 translate-y-1 opacity-90"
                  : "z-10 translate-x-2 translate-y-2 opacity-70"
              }`}
              alt={`Folder ${folder.name} thumbnail ${index}`}
            />
          ))}
          <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs text-center rounded py-0.5">
            📁 {folder.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FolderGrid;
