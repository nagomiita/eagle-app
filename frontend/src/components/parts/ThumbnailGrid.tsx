import { CheckIcon, HeartIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import {
  addImagesToFolder,
  createImageFolder,
} from "../../api/folders/folders";
import { FolderInfo, ThumbnailImage } from "../../api/model";
import { STATIC_BASE_URL } from "../../config";
import { handleApiRequest } from "../../utils/apiHelpers";
import LazyImage from "./LazyImage";
import ScrollToTopButton from "./ScrollToTopButton";

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
  const [showFolderDropdown, setShowFolderDropdown] = useState<boolean>(false);
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

  const addToExistingFolder = async () => {
    if (!selectedFolderId) return;

    await handleApiRequest({
      apiCall: () => addImagesToFolder(parseInt(selectedFolderId), selectedIds),
      errorContext: "既存フォルダへの追加中",
      onSuccess: async (res) => {
        if (res) {
          alert("✅ フォルダに追加しました");
          const selectedImages = images.filter((img) =>
            selectedIds.includes(img.id)
          );
          // 🔄 既存フォルダに画像を追加（参照を変える）
          if (setFolders) {
            setFolders((prev) =>
              prev.map((folder) =>
                folder.id === parseInt(selectedFolderId)
                  ? {
                      ...folder,
                      thumbnail_images: [
                        ...folder.thumbnail_images,
                        ...selectedImages,
                      ],
                    }
                  : folder
              )
            );
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
          setSelectedFolderId(null);
        } else {
          alert("❌ 追加に失敗しました");
        }
      },
    });
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
          {/* Custom folder dropdown with thumbnails */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowFolderDropdown((s) => !s)}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded w-full sm:w-64"
            >
              {selectedFolderId ? (
                (() => {
                  const f = (folders ?? []).find((ff) => String(ff.id) === selectedFolderId);
                  const thumb = f?.thumbnail_images?.[0]?.thumbnail;
                  return (
                    <>
                          {thumb ? (
                            <img src={`${STATIC_BASE_URL}/${thumb}`} alt="folder-thumb" className="w-9 h-9 object-cover rounded mr-2" />
                          ) : (
                            <span className="w-9 h-9 bg-gray-300 rounded inline-block mr-2" />
                          )}
                      <span>{f?.name ?? "📁 フォルダを選択"}</span>
                    </>
                  );
                })()
              ) : (
                <>
                  <span>📁 フォルダを選択</span>
                </>
              )}
            </button>

            {/** dropdown list */}
            {showFolderDropdown && (
              <div className="absolute bottom-14 left-0 w-80 max-h-64 overflow-auto bg-white text-black rounded shadow-lg z-60">
                {(folders ?? []).length === 0 ? (
                  <div className="p-3 text-sm text-gray-600">フォルダがありません</div>
                ) : (
                  (folders ?? []).map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedFolderId(String(folder.id));
                        setShowFolderDropdown(false);
                      }}
                    >
                      {folder.thumbnail_images?.[0]?.thumbnail ? (
                        <img
                          src={`${STATIC_BASE_URL}/${folder.thumbnail_images[0].thumbnail}`}
                          alt={folder.name}
                          className="w-20 h-20 object-cover rounded mr-5"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded mr-5" />
                      )}
                      <div className="truncate">{folder.name}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            disabled={!selectedFolderId}
            onClick={addToExistingFolder}
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
              src={`${STATIC_BASE_URL}/${image.thumbnail}`}
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
      <ScrollToTopButton />
    </div>
  );
};

export default ThumbnailGrid;
