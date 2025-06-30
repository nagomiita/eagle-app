import { useState } from "react";
import { fetchOriginalImage } from "../api/default/default";
import { ThumbnailImage, OriginalImage } from "../api/model";

export const useOriginalImage = () => {
  const [selectedImage, setSelectedImage] = useState<OriginalImage | null>(
    null
  );

  const openModal = async (image: ThumbnailImage) => {
    try {
      const originalImage = await fetchOriginalImage({
        id: image.id,
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
