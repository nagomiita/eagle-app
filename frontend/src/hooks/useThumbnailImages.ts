import { useState } from "react";
import { getItemsApiItemListGet } from "../api/default/default";
import { Item } from "../api/model";

export const useThumbnailImages = () => {
  const [images, setImages] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [columnCount, setColumnCount] = useState<number>(() => {
    const width = window.innerWidth;
    if (width < 600) return 4; // モバイル
    if (width < 1024) return 6; // タブレット
    return 8; // PC
  });

  const fetchImages = async (selectedTag: string) => {
    setIsLoading(true);
    try {
      const response = await getItemsApiItemListGet({
        selected_tag: selectedTag,
      });
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    images,
    setImages,
    isLoading,
    columnCount,
    setColumnCount,
    fetchImages,
  };
};
