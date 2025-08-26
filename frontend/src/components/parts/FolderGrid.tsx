import React, { useState } from "react";
import { FolderInfo } from "../../api/model";

interface FolderGridProps {
  folders: FolderInfo[];
  columnCount?: number;
  onClickFolder?: (id: number) => void;
  onDeleteFolder?: (id: number) => void;
}

const FolderGrid: React.FC<FolderGridProps> = ({
  folders,
  columnCount = 4,
  onClickFolder,
  onDeleteFolder,
}) => {
  const [isCheckMode, setIsCheckMode] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  const handleContextMenu = (e: React.MouseEvent, folderId: number) => {
    e.preventDefault();
    if (!isCheckMode) {
      setIsCheckMode(true);
      setSelectedFolderId(folderId);
    }
  };

  const handleDeleteFolder = () => {
    if (selectedFolderId && onDeleteFolder) {
      const folder = folders.find((f) => f.id === selectedFolderId);

      // 削除の確認ダイアログ
      if (window.confirm(`フォルダ「${folder?.name}」を削除しますか？`)) {
        onDeleteFolder(selectedFolderId);
        setIsCheckMode(false);
        setSelectedFolderId(null);
      }
    }
  };

  const handleCancelCheckMode = () => {
    setIsCheckMode(false);
    setSelectedFolderId(null);
  };

  // チェックモード中に他のフォルダーをクリックして選択を変更
  const handleFolderClick = (folderId: number) => {
    if (isCheckMode) {
      setSelectedFolderId(folderId);
    } else {
      onClickFolder?.(folderId);
    }
  };

  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {isCheckMode && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 bg-opacity-95 z-50 p-4 flex flex-col sm:flex-row justify-center items-center gap-4 shadow-lg border-t border-gray-600">
          <div className="text-white text-sm font-medium">
            選択中:{" "}
            {folders.find((f) => f.id === selectedFolderId)?.name || "未選択"}
          </div>

          {/* 削除ボタン */}
          <button
            onClick={handleDeleteFolder}
            disabled={!selectedFolderId}
            className="bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🗑️ フォルダ削除
          </button>

          {/* キャンセルボタン */}
          <button
            onClick={handleCancelCheckMode}
            className="bg-gray-600 text-white px-4 py-2 rounded w-full sm:w-auto hover:bg-gray-700 transition-colors"
          >
            ❌ キャンセル
          </button>
        </div>
      )}

      {folders.map((folder) => {
        const isSelected = isCheckMode && selectedFolderId === folder.id;

        return (
          <div
            key={folder.id}
            className={`relative w-full h-full cursor-pointer group transition-all duration-200 ${
              isSelected
                ? "transform scale-95"
                : isCheckMode
                ? "opacity-60"
                : "hover:transform hover:scale-105"
            }`}
            onContextMenu={(e) => handleContextMenu(e, folder.id)}
            onClick={() => handleFolderClick(folder.id)}
          >
            {/* 選択状態のオーバーレイ */}
            {isSelected && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-30 rounded-lg z-50 border-2 border-blue-500 animate-pulse">
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              </div>
            )}

            <div
              className={`relative aspect-square w-full overflow-hidden rounded-lg ${
                isSelected ? "ring-4 ring-blue-400 ring-opacity-75" : ""
              }`}
            >
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
                  } ${isSelected ? "brightness-110" : ""}`}
                  alt={`Folder ${folder.name} thumbnail ${thumb.id}`}
                />
              ))}

              {/* フォルダ名 */}
              <div
                className={`absolute bottom-1 left-1 right-1 text-white text-xs text-center rounded py-1 z-40 ${
                  isSelected ? "bg-blue-600/80 font-semibold" : "bg-black/60"
                }`}
              >
                📁 {folder.name}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FolderGrid;
