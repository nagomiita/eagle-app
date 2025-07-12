import { useState } from "react";
import { fetchOriginalImage } from "../api/default/default";
import { OriginalImage } from "../api/model";
import { fetchFilteredThumnailImages } from "../api/default/default";
import { ThumbnailImage } from "../api/model";

export const useOriginalImage = () => {
  const [selectedImage, setSelectedImage] = useState<OriginalImage | null>(
    null
  );

  const openModal = async (imageId: number) => {
    try {
      const originalImage = await fetchOriginalImage({
        id: imageId,
      });
      if (originalImage) {
        setSelectedImage(originalImage);
      } else {
        throw new Error("Original image not found");
      }
    } catch (error) {
      console.error("Error fetching original image:", error);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return {
    selectedImage,
    setSelectedImage,
    openModal,
    closeModal,
  };
};

export const useThumbnailImages = () => {
  const [images, setImages] = useState<ThumbnailImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [includeSensitive, setIncludeSensitive] = useState<boolean>(false);
  const [onlyFavorite, setOnlyFavorite] = useState<boolean>(false);
  const [columnCount, setColumnCount] = useState<number>(() => {
    const width = window.innerWidth;
    if (width < 600) return 4; // モバイル
    if (width < 1024) return 6; // タブレット
    return 8; // PC
  });

  const fetchImages = async (selectedTag: string) => {
    setIsLoading(true);
    try {
      const thumnailImages = await fetchFilteredThumnailImages({
        include_sensitive: includeSensitive,
        favorites_only: onlyFavorite,
        selected_tag: selectedTag,
      });
      setImages(thumnailImages);
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
    includeSensitive,
    setIncludeSensitive,
    onlyFavorite,
    setOnlyFavorite,
  };
};
