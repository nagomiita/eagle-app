import React from "react";
import { FolderInfo } from "../../api/model";

interface FolderGridProps {
  folders: FolderInfo[];
  columnCount?: number;
  onClickFolder?: (id: string) => void;
}

const FolderGrid: React.FC<FolderGridProps> = ({
  folders,
  columnCount = 4,
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
          className="cursor-pointer group"
          onClick={() => onClickFolder?.(String(folder.id))}
        >
          <div className="relative aspect-square w-full overflow-hidden">
            <div className="absolute top-1 right-1 bg-white/80 text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full z-40">
              {folder.thumbnail_images.length}
            </div>
            {folder.thumbnail_images.slice(0, 3).map((thumb, index) => (
              <img
                key={thumb.id}
                src={`http://192.168.11.11/api/static/${thumb.thumbnail}`}
                className={`absolute w-full h-full object-cover rounded-lg shadow transition-transform ${
                  index === 0
                    ? "relative z-30"
                    : index === 1
                    ? "z-20 translate-x-1 translate-y-1 opacity-90"
                    : "z-10 translate-x-2 translate-y-2 opacity-70"
                }`}
                alt={`Folder ${folder.name} thumbnail ${thumb.id}`}
              />
            ))}

            {/* フォルダ名 */}
            <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-xs text-center rounded py-1 z-40">
              📁 {folder.name}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FolderGrid;
