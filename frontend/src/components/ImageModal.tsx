import React from "react";
import { useAppContext } from "../contexts/AppContext";

const ImageModal: React.FC = () => {
  const { selectedImage, closeModal } = useAppContext();

  if (!selectedImage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
      onClick={closeModal}
    >
      <img
        src={selectedImage.image || undefined}
        alt="Selected"
        className="max-w-[100%] max-h-[100%] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImageModal;
