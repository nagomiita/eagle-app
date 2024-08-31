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
      {selectedImage.error ? (
        <div className="text-white text-lg text-center">
          {selectedImage.error}
        </div>
      ) : (
        <img
          src={selectedImage.image || undefined}
          alt="Selected"
          className="max-w-[90%] max-h-[90%] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
};

export default ImageModal;
