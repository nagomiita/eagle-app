import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import React, { useState } from "react";
import { FolderInfo, ThumbnailImage } from "../../api/model";
import { updateFolderOrder } from "../../api/default/default";
import { SortableImage } from "./SortableImage";

interface Props {
  folderId: number;
  initialImages: ThumbnailImage[];
  onExitEditMode: () => void;
  setFolders: React.Dispatch<React.SetStateAction<FolderInfo[]>>;
  columnCount: number;
}

const FolderImageEditor: React.FC<Props> = ({
  folderId,
  initialImages,
  onExitEditMode,
  setFolders,
  columnCount = 4,
}) => {
  const [images, setImages] = useState(initialImages);

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
      <div className="fixed bottom-0 left-0 w-full bg-gray-900 bg-opacity-90 z-50 p-4 flex justify-center items-center gap-4 shadow-md">
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
