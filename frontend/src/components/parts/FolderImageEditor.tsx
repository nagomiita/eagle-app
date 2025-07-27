import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import React, { useState } from "react";
import { FolderInfo, ThumbnailImage } from "../../api/model";
import { updateFolderOrder, renameFolder } from "../../api/default/default";
import { SortableImage } from "./SortableImage";
interface Props {
  folderId: number;
  originalFolderName: string;
  initialImages: ThumbnailImage[];
  onExitEditMode: () => void;
  setFolders: React.Dispatch<React.SetStateAction<FolderInfo[]>>;
  columnCount: number;
}

const FolderImageEditor: React.FC<Props> = ({
  folderId,
  originalFolderName,
  initialImages,
  onExitEditMode,
  setFolders,
  columnCount = 4,
}) => {
  const [images, setImages] = useState(initialImages);
  const [folderName, setFolderName] = useState(originalFolderName);

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
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over?.id);
      setImages(arrayMove(images, oldIndex, newIndex));
    }
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
      await renameFolder({ folder_id: folderId, new_name: folderName });
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
            {images.map((img) => (
              <SortableImage key={img.id} image={img} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="fixed bottom-0 left-0 w-full bg-gray-900 bg-opacity-90 z-50 p-4 flex flex-wrap justify-center items-end gap-4 shadow-md">
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
          className="bg-yellow-600 text-white px-4 py-2 rounded"
          onClick={saveFolderName}
        >
          📝 名前を保存
        </button>

        <button
          className="bg-green-600 text-white px-3 py-2 rounded"
          onClick={sortByName}
        >
          🔤 名前で並べ替え
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={saveOrder}
        >
          💾 並び順を保存
        </button>
        <button
          className="bg-gray-500 text-white px-3 py-2 rounded"
          onClick={onExitEditMode}
        >
          戻る
        </button>
      </div>
    </div>
  );
};

export default FolderImageEditor;
