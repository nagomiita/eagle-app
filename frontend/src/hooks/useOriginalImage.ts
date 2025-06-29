import { useState } from "react";
import { getOriginalImageApiItemOriginalGet } from "../api/default/default";
import { Item, OriginalImage } from "../api/model";

export const useOriginalImage = () => {
  const [selectedImage, setSelectedImage] = useState<OriginalImage | null>(
    null
  );

  const openModal = async (image: Item) => {
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
    selectedImage,
    setSelectedImage,
    openModal,
    closeModal,
  };
};
