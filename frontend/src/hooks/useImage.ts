import { useState } from "react";
import {
  fetchFilteredThumnailImages,
  fetchOriginalImage,
} from "../api/images/images";
import { OriginalImage, ThumbnailImage } from "../api/model";

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
  const [excludeInFolder, setExcludeInFolder] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [onlyFavorite, setOnlyFavorite] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  const fetchImages = async (
    selectedTag: string,
    includeSensitive: boolean,
    isShuffle:boolean = false
  ) => {
    setIsLoading(true);
    try {
      const thumnailImages = await fetchFilteredThumnailImages({
        include_sensitive: includeSensitive,
        favorites_only: onlyFavorite,
        selected_tag: selectedTag,
        exclude_in_folder: excludeInFolder,
        shuffle: isShuffle,
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
    excludeInFolder,
    setExcludeInFolder,
    isLoading,
    fetchImages,
    onlyFavorite,
    setOnlyFavorite,
    isShuffle,
    setIsShuffle
  };
};
