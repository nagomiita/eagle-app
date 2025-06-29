import { useState } from "react";
import { getItemsApiItemListGet } from "../api/default/default";
import { Item } from "../api/model";

export const useThumbnailImages = () => {
  const [images, setImages] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(200);
  const [columnCount, setColumnCount] = useState<number>(4);

  const fetchImages = async (folderId: string, selectedTag: string) => {
    setIsLoading(true);
    try {
      const response = await getItemsApiItemListGet({
        limit,
        offset: 0,
        tags: selectedTag,
        folders: folderId,
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
    limit,
    setLimit,
    columnCount,
    setColumnCount,
    fetchImages,
  };
};
