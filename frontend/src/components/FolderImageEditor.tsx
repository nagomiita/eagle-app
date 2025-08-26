import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import React, { useState } from "react";
import { FolderInfo, ThumbnailImage } from "../api/model";
import { updateFolderOrder, renameFolder } from "../api/folders/folders";
import { SortableImage } from "./parts/SortableImage";

interface Props {
  folderId: number;
  originalFolderName: string;
  initialImages: ThumbnailImage[];
  onExitEditMode: () => void;
  setFolders: React.Dispatch<React.SetStateAction<FolderInfo[]>>;
  columnCount: number;
  onRemoveImage?: (imageIds: number[]) => Promise<void>; // 画像削除用のコールバック（配列対応）
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
  const [images, setImages] = useState(initialImages);
  const [folderName, setFolderName] = useState(originalFolderName);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);

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
      return 0; // 完全一致なら順序維持
    });

    setImages(sorted);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // 削除モード中はドラッグを無効化
    if (isRemoveMode) return;

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
        // 配列で一括削除
        if (onRemoveImage) {
          await onRemoveImage(selectedImageIds);
        }

        // ローカル状態から削除
        const updatedImages = images.filter(
          (img) => !selectedImageIds.includes(img.id)
        );
        setImages(updatedImages);

        // フォルダの状態を更新
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === folderId
              ? { ...folder, thumbnail_images: updatedImages }
              : folder
          )
        );

        // 削除モードを解除
        setIsRemoveMode(false);
        setSelectedImageIds([]);

        alert(`✅ ${selectedImageIds.length}枚の画像を削除しました`);
      } catch (error) {
        console.error("❌ 画像削除エラー:", error);
        alert("❌ 画像の削除に失敗しました");
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
    console.log("Updated order:", images);
    // フォルダの画像を更新
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId
          ? { ...folder, thumbnail_images: images }
          : folder
      )
    );
    alert("✅ 並び順を保存しました");
    onExitEditMode();
  };

  const saveFolderName = async () => {
    try {
      await renameFolder(folderId, { new_name: folderName });
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === folderId ? { ...folder, name: folderName } : folder
        )
      );
      alert("✅ フォルダ名を変更しました");
    } catch (error) {
      console.error("❌ フォルダ名変更エラー:", error);
      alert("❌ フォルダ名の変更に失敗しました");
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

              return (
                <div
                  key={img.id}
                  className={`relative transition-all duration-200 ${
                    isRemoveMode
                      ? isSelected
                        ? "ring-4 ring-red-400 ring-opacity-75 transform scale-95"
                        : "opacity-60"
                      : ""
                  }`}
                  onContextMenu={(e) => handleImageContextMenu(e, img.id)}
                  onClick={() => handleImageClick(img.id)}
                >
                  {/* 選択状態のオーバーレイ */}
                  {isRemoveMode && isSelected && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-30 rounded-lg z-50 border-2 border-red-500">
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    </div>
                  )}

                  <SortableImage
                    image={img}
                    disabled={isRemoveMode} // 削除モード中はドラッグを無効化
                  />
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="fixed bottom-0 left-0 w-full bg-gray-900 bg-opacity-90 z-50 p-4 flex flex-wrap justify-center items-end gap-4 shadow-md">
        {isRemoveMode ? (
          // 削除モード中のUI
          <>
            <div className="text-white text-sm font-medium">
              削除モード: {selectedImageIds.length}枚選択中
            </div>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              onClick={handleRemoveSelectedImages}
              disabled={selectedImageIds.length === 0}
            >
              🗑️ 選択した画像を削除 ({selectedImageIds.length})
            </button>
            <button
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              onClick={handleCancelDeleteMode}
            >
              ❌ キャンセル
            </button>
          </>
        ) : (
          // 通常モードのUI
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
