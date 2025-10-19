import React, { useState } from "react";
import { FolderInfo, ThumbnailImage } from "../../api/model";
import LazyImage from "./LazyImage";
import { HeartIcon, CheckIcon } from "@heroicons/react/24/solid";
import {
  createImageFolder,
  addImagesToFolder,
} from "../../api/folders/folders";
import { handleApiRequest } from "../../utils/apiHelpers";

interface ThumbnailGridProps {
  images: ThumbnailImage[];
  folders?: FolderInfo[];
  columnCount?: number;
  onClick: (id: number) => void;
  setImages?: React.Dispatch<React.SetStateAction<ThumbnailImage[]>>;
  setFolders?: React.Dispatch<React.SetStateAction<FolderInfo[]>>;
  aspectRatioSquare?: boolean;
}

const ThumbnailGrid: React.FC<ThumbnailGridProps> = ({
  images,
  folders,
  columnCount = 4,
  onClick,
  setImages,
  setFolders,
  aspectRatioSquare = true,
}) => {
  const [isCheckMode, setIsCheckMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  //長押しで選択モードに入るためのタイマー
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

    await handleApiRequest({
      apiCall: () =>
        createImageFolder({
          folder_name: folderName,
          image_ids: selectedIds,
          description: "",
        }),
      errorContext: "新規フォルダ作成中",
      onSuccess: async (folderId) => {
        if (folderId) {
          alert("フォルダを作成しました");
          const selectedImages = images.filter((img) =>
            selectedIds.includes(img.id)
          );
          // フォルダに追加
          const newFolder: FolderInfo = {
            id: folderId,
            name: folderName,
            description: "",
            thumbnail_images: selectedImages,
          };
          // 🔄 フォルダ更新（参照を変える）
          if (setFolders) {
            setFolders((prev) => [...prev, newFolder]);
          }
          // 🔄 画像一覧から削除（参照が変わるように）
          if (setImages) {
            setImages((prev) =>
              prev.filter((img) => !selectedIds.includes(img.id))
            );
          }
          // UI状態の初期化
          setIsCheckMode(false);
          setSelectedIds([]);
          setLastSelectedIndex(null);
        } else {
          alert("作成に失敗しました");
        }
      },
    });
  };

  return (
    <div>
      {isCheckMode && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 bg-opacity-90 z-50 p-4 flex flex-col sm:flex-row justify-center items-center gap-4 shadow-md">
          <select
            value={selectedFolderId ?? ""}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            className="px-2 py-1 rounded bg-white text-black border w-full sm:w-auto"
          >
            <option value="">📁 フォルダを選択</option>
            {(folders ?? []).map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>

          <button
            disabled={!selectedFolderId}
            onClick={async () => {
              if (!selectedFolderId) return;
              const res = await addImagesToFolder(
                parseInt(selectedFolderId),
                selectedIds
              );

              if (res) {
                alert("✅ フォルダに追加しました");
                setIsCheckMode(false);
                setSelectedIds([]);
                setLastSelectedIndex(null);
                setSelectedFolderId(null);
              } else {
                alert("❌ 追加に失敗しました");
              }
            }}
            className="bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full sm:w-auto"
          >
            ➕ 既存フォルダに追加（{selectedIds.length} 枚）
          </button>

          <button
            onClick={createFolder}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            📁 フォルダ作成（{selectedIds.length} 枚）
          </button>

          <button
            onClick={() => {
              setIsCheckMode(false);
              setSelectedIds([]);
              setLastSelectedIndex(null);
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded w-full sm:w-auto"
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
              aspectRatioSquare={aspectRatioSquare}
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
