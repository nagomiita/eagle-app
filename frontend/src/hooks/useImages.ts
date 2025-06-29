import { useState } from "react";
import { ImageData } from "../types";
import {
  getItemsApiItemListGet,
  getOriginalImageApiItemOriginalGet,
} from "../api/default/default";
import { Item, OriginalImage } from "../api/model";
const useImages = () => {
  const [images, setImages] = useState<Item[]>([]);
  const [selectedImage, setSelectedImage] = useState<OriginalImage | null>(
    null
  );
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
      setImages(response.data); // Orval の response.data が { status, data } の場合
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = async (image: ImageData) => {
    try {
      const response = await getOriginalImageApiItemOriginalGet({
        id: image.id,
      });

      const originalImage = response.data?.[0];
      if (originalImage) {
        setSelectedImage(originalImage);
      } else {
        throw new Error("Original image not found");
      }
    } catch (error) {
      console.error("Error fetching original image:", error);
      setSelectedImage({
        id: image.id,
        image: image.thumbnail,
        error: "Failed to load original image",
      });
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return {
    images,
    setImages,
    selectedImage,
    setSelectedImage,
    isLoading,
    limit,
    setLimit,
    columnCount,
    setColumnCount,
    fetchImages,
    openModal,
    closeModal,
  };
};

export default useImages;
