import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useState } from "react";
import { FolderInfo, ThumbnailImage } from "../api/model";
import {
  updateFolderOrder,
  renameFolder,
  chainSimilarImagesInFolder,
} from "../api/folders/folders";
import { SortableImage } from "./parts/SortableImage";
import { useAppContext } from "../contexts/AppContext";

interface Props {
  folderId: number;
  originalFolderName: string;
  initialImages: ThumbnailImage[];
  onExitEditMode: () => void;
  setFolders: React.Dispatch<React.SetStateAction<FolderInfo[]>>;
  columnCount: number;
  onRemoveImage?: (imageIds: number[]) => Promise<void>;
}

const FolderImageEditor: React.FC<Props> = ({
  folderId,
  originalFolderName,
  initialImages,
  onExitEditMode,
  setFolders,
  columnCount = 4,
  onRemoveImage,
}) => {
  const [images, setImages] = useState<ThumbnailImage[]>(initialImages);
  const [folderName, setFolderName] = useState(originalFolderName);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [seedImageId, setSeedImageId] = useState<number | null>(null);
  const [selectingSeed, setSelectingSeed] = useState<boolean>(false);
  const { includeSensitive } = useAppContext();

  const extractNumbers = (name: string): number[] => {
    return name.match(/\d+/g)?.map((n) => parseInt(n, 10)) ?? [];
  };

  const sortByName = () => {
    const sorted = [...images].sort((a, b) => {
      const numsA = extractNumbers(a.name);
      const numsB = extractNumbers(b.name);
      const len = Math.max(numsA.length, numsB.length);
      for (let i = 0; i < len; i++) {
        const aNum = numsA[i] ?? 0;
        const bNum = numsB[i] ?? 0;
        if (aNum !== bNum) return aNum - bNum;
      }
      return 0;
    });
    setImages(sorted);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (isRemoveMode || selectingSeed) return;
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over?.id);
      setImages(arrayMove(images, oldIndex, newIndex));
    }
  };

  const handleImageContextMenu = (e: React.MouseEvent, imageId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isRemoveMode) {
      setIsRemoveMode(true);
      setSelectedImageIds([imageId]);
    }
  };

  const handleImageClick = (imageId: number) => {
    if (isRemoveMode) {
      setSelectedImageIds((prev) =>
        prev.includes(imageId)
          ? prev.filter((id) => id !== imageId)
          : [...prev, imageId]
      );
      return;
    }

    if (selectingSeed) {
      setSeedImageId(imageId);
      setSelectingSeed(false);
      runTagChainSort(imageId);
      return;
    }
    // 普段は単に起点をハイライト
    setSeedImageId(imageId);
  };

  const runTagChainSort = async (seedId: number) => {
    try {
      const result = await chainSimilarImagesInFolder(folderId, {
        seed_image_id: seedId,
        include_sensitive: includeSensitive,
      });
      const returnedIds = new Set(result.map((r) => r.id));
      const remaining = images.filter((img) => !returnedIds.has(img.id));
      setImages([...result, ...remaining]);
    } catch (e) {
      console.error("タグ類似チェーン並び替えエラー", e);
      alert("タグベクトルによる並び替えに失敗しました。");
    }
  };

  const handleRemoveSelectedImages = async () => {
    if (selectedImageIds.length === 0) return;
    const selectedImages = images.filter((img) =>
      selectedImageIds.includes(img.id)
    );
    const imageNames = selectedImages.map((img) => img.name).join(", ");
    if (
      window.confirm(
        `選択した${selectedImageIds.length}枚の画像を削除しますか？\n\n${imageNames}`
      )
    ) {
      try {
        if (onRemoveImage) await onRemoveImage(selectedImageIds);
        const updatedImages = images.filter(
          (img) => !selectedImageIds.includes(img.id)
        );
        setImages(updatedImages);
        setFolders((prev) =>
          prev.map((f) =>
            f.id === folderId ? { ...f, thumbnail_images: updatedImages } : f
          )
        );
        setIsRemoveMode(false);
        setSelectedImageIds([]);
        alert(`画像を${selectedImageIds.length}枚削除しました`);
      } catch (error) {
        console.error("画像削除エラー", error);
        alert("画像の削除に失敗しました");
      }
    }
  };

  const handleCancelDeleteMode = () => {
    setIsRemoveMode(false);
    setSelectedImageIds([]);
  };

  const saveOrder = async () => {
    const image_ids = images.map((img) => img.id);
    await updateFolderOrder(folderId, image_ids);
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, thumbnail_images: images } : f
      )
    );
    alert("並び順を保存しました");
    onExitEditMode();
  };

  const saveFolderName = async () => {
    try {
      await renameFolder(folderId, { new_name: folderName });
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, name: folderName } : f))
      );
      alert("フォルダ名を変更しました");
    } catch (error) {
      console.error("フォルダ名変更エラー", error);
      alert("フォルダ名の変更に失敗しました");
    }
  };

  return (
    <div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={images.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            }}
          >
            {images.map((img) => {
              const isSelected = selectedImageIds.includes(img.id);
              const isSeed = !isRemoveMode && seedImageId === img.id;
              return (
                <div
                  key={img.id}
                  className={`relative transition-all duration-200 ${
                    isRemoveMode
                      ? isSelected
                        ? "ring-4 ring-red-400 ring-opacity-75 transform scale-95"
                        : "opacity-60"
                      : isSeed
                      ? "ring-4 ring-blue-400 ring-opacity-75"
                      : ""
                  }`}
                  onContextMenu={(e) => handleImageContextMenu(e, img.id)}
                >
                  {isRemoveMode && isSelected && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-30 rounded-lg z-50 border-2 border-red-500">
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✖
                      </div>
                    </div>
                  )}
                  {!isRemoveMode && isSeed && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded px-2 py-0.5 text-xs z-50">
                      起点
                    </div>
                  )}
                  <SortableImage
                    image={img}
                    disabled={isRemoveMode || selectingSeed}
                    onClickImage={handleImageClick}
                  />
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="fixed bottom-0 left-0 w-full bg-gray-900 bg-opacity-90 z-50 p-4 flex flex-wrap justify-center items-end gap-4 shadow-md">
        {isRemoveMode ? (
          <>
            <div className="text-white text-sm font-medium">
              削除モード {selectedImageIds.length}枚選択中
            </div>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              onClick={handleRemoveSelectedImages}
              disabled={selectedImageIds.length === 0}
            >
              🗑 選択した画像を削除 ({selectedImageIds.length})
            </button>
            <button
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              onClick={handleCancelDeleteMode}
            >
              キャンセル
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-start">
              <label className="text-white text-sm font-bold mb-1">
                フォルダ名の変更
              </label>
              <input
                type="text"
                className="p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </div>
            <button
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
              onClick={saveFolderName}
            >
              📝 名前を保存
            </button>
            <button
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors"
              onClick={sortByName}
            >
              🔤 名前で並べ替え
            </button>
            <button
              className={`${
                selectingSeed ? "bg-purple-800" : "bg-purple-600"
              } text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors`}
              onClick={() => setSelectingSeed((prev) => !prev)}
              title={
                selectingSeed
                  ? "起点を画像から選択中（クリックでキャンセル）"
                  : "ボタンを押してから起点画像をクリック"
              }
            >
              {selectingSeed
                ? "🏷️ 起点を選択中...（キャンセル）"
                : "🏷️ タグで並び替え"}
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              onClick={saveOrder}
            >
              💾 並び順を保存
            </button>
            <button
              className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors"
              onClick={onExitEditMode}
            >
              戻る
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FolderImageEditor;
