import React, { useState } from "react";
import { ThumbnailImage } from "../../api/model";
import LazyImage from "./LazyImage";
import { HeartIcon, CheckIcon } from "@heroicons/react/24/solid";

interface ThumbnailGridProps {
  images: ThumbnailImage[];
  columnCount?: number;
  onClick?: (id: number) => void;
}

const ThumbnailGrid: React.FC<ThumbnailGridProps> = ({
  images,
  columnCount = 4,
  onClick,
}) => {
  const [isCheckMode, setIsCheckMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  let longPressTimer: NodeJS.Timeout | null = null;

  const handleContextMenu = (e: React.MouseEvent, imageId: number) => {
    e.preventDefault();
    if (!isCheckMode) {
      setIsCheckMode(true);
      setSelectedIds([imageId]);
      const index = images.findIndex((img) => img.id === imageId);
      setLastSelectedIndex(index);
    }
  };

  const handleTouchStart = (imageId: number) => {
    longPressTimer = setTimeout(() => {
      if (!isCheckMode) {
        setIsCheckMode(true);
        setSelectedIds([imageId]);
        const index = images.findIndex((img) => img.id === imageId);
        setLastSelectedIndex(index);
      }
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    const index = images.findIndex((img) => img.id === id);
    setLastSelectedIndex(index);
  };

  const handleShiftClick = (currentImageId: number) => {
    const currentIndex = images.findIndex((img) => img.id === currentImageId);

    if (lastSelectedIndex === null) {
      // 最初の選択の場合
      setSelectedIds([currentImageId]);
      setLastSelectedIndex(currentIndex);
      return;
    }

    // 範囲選択の開始と終了のインデックスを決定
    const startIndex = Math.min(lastSelectedIndex, currentIndex);
    const endIndex = Math.max(lastSelectedIndex, currentIndex);

    // 範囲内の画像IDを取得
    const rangeIds = images
      .slice(startIndex, endIndex + 1)
      .map((img) => img.id);

    // 既存の選択に追加（重複は自動的に除去される）
    setSelectedIds((prev) => {
      const newSelection = new Set([...prev, ...rangeIds]);
      return Array.from(newSelection);
    });
  };

  const handleImageClick = (e: React.MouseEvent, imageId: number) => {
    if (isCheckMode) {
      if (e.shiftKey) {
        handleShiftClick(imageId);
      } else {
        toggleSelect(imageId);
      }
    } else {
      onClick?.(imageId);
    }
  };

  const createFolder = async () => {
    const folderName = prompt("フォルダ名を入力してください：");
    if (!folderName) return;

    const res = await fetch("http://localhost:8000/folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder_name: folderName,
        image_ids: selectedIds,
        description: "", // 任意で記述可能
      }),
    });

    if (res.ok) {
      alert("フォルダを作成しました");
      setIsCheckMode(false);
      setSelectedIds([]);
      setLastSelectedIndex(null);
    } else {
      alert("作成に失敗しました");
    }
  };

  return (
    <div>
      {isCheckMode && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 bg-opacity-90 z-50 p-4 flex justify-center items-center gap-4 shadow-md">
          <button
            onClick={createFolder}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            📁 フォルダ作成（{selectedIds.length} 枚）
          </button>
          <button
            onClick={() => {
              setIsCheckMode(false);
              setSelectedIds([]);
              setLastSelectedIndex(null);
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            キャンセル
          </button>
        </div>
      )}

      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        }}
      >
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative w-full h-full cursor-pointer ${
              isCheckMode && selectedIds.includes(image.id)
                ? "bg-gray-400 bg-opacity-50"
                : ""
            }`}
            onClick={(e) => handleImageClick(e, image.id)}
            onContextMenu={(e) => handleContextMenu(e, image.id)}
            onTouchStart={() => handleTouchStart(image.id)}
            onTouchEnd={handleTouchEnd}
          >
            <LazyImage
              src={`http://192.168.11.11/api/static/${image.thumbnail}`}
              alt={`Thumbnail ${image.id}`}
              className={selectedIds.includes(image.id) ? "opacity-60" : ""}
            />

            {selectedIds.includes(image.id) && (
              <div className="absolute top-1 left-1 bg-green-500 p-1 rounded-full shadow z-40">
                <CheckIcon className="w-5 h-5 text-white" />
              </div>
            )}

            {image.is_favorite && (
              <div className="absolute bottom-1 right-1 bg-pink-500 p-1 rounded-full shadow">
                <HeartIcon className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThumbnailGrid;
