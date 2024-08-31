import { useState } from "react";
import axios from "axios";
import { ImageData, OriginalImageData } from "../types";
import { API_BASE_URL } from "../config";

const useImages = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<OriginalImageData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(200);
  const [columnCount, setColumnCount] = useState<number>(4);

  const fetchImages = async (folderId: string, selectedTag: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/item/list?limit=${limit}&offset=0&tags=${selectedTag}&folders=${folderId}`
      );
      setImages(response.data.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = async (image: ImageData) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/item/original?id=${image.id}`
      );
      if (response.data.status === "success") {
        const originalImage = response.data.data[0];
        setSelectedImage(originalImage);
      } else {
        throw new Error(
          response.data.data[0]?.error || "Failed to fetch original image"
        );
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
