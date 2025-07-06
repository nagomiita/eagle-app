import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import { deleteImage, fetchOriginalImage } from "../api/default/default";
import { HeartIcon } from "@heroicons/react/24/solid";
import { registerFavoriteImage } from "../api/default/default";
import { TrashIcon } from "@heroicons/react/24/solid";

const SWIPE_CLOSE_THRESHOLD = 100; // 上スワイプで閉じる距離
const SWIPE_IMAGE_THRESHOLD = 80; // 左右スワイプで画像切り替え距離
const MOBILE_BREAKPOINT = 1024; // モバイル判定用

interface TouchState {
  startX: number | null;
  startY: number | null;
  dragX: number;
  dragY: number;
  isDragging: boolean;
}

const ImageModal: React.FC = () => {
  const { selectedImage, setSelectedImage, closeModal, images, setImages } =
    useAppContext();

  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [touchState, setTouchState] = useState<TouchState>({
    startX: null,
    startY: null,
    dragX: 0,
    dragY: 0,
    isDragging: false,
  });
  const [showOptionPanel, setShowOptionPanel] = useState(false);

  // オプション切り替え
  const toggleOptionPanel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowOptionPanel((prev) => !prev);
  };

  // 画像クリック時にFABトグル
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    setShowButton((prev) => !prev);
  };

  // モバイル判定
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 背景スクロール抑制
  useEffect(() => {
    if (!selectedImage) return;

    const preventTouchScroll = (e: TouchEvent) => e.preventDefault();

    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventTouchScroll, {
      passive: false,
    });

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventTouchScroll);
    };
  }, [selectedImage]);

  // 画像変更時のドラッグ状態リセット
  useEffect(() => {
    setTouchState({
      startX: null,
      startY: null,
      dragX: 0,
      dragY: 0,
      isDragging: false,
    });
  }, [selectedImage]);

  // タッチイベントハンドラー
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchState({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      dragX: 0,
      dragY: 0,
      isDragging: true,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      !isMobile ||
      !touchState.isDragging ||
      touchState.startX === null ||
      touchState.startY === null
    )
      return;

    const deltaX = e.touches[0].clientX - touchState.startX;
    const deltaY = e.touches[0].clientY - touchState.startY;

    setTouchState((prev) => ({
      ...prev,
      dragX: deltaX,
      dragY: deltaY < 0 ? deltaY : 0, // 上方向のみ
    }));
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;

    const { dragX, dragY } = touchState;

    if (dragY < -SWIPE_CLOSE_THRESHOLD) {
      closeModal();
    } else if (dragX > SWIPE_IMAGE_THRESHOLD) {
      showPreviousImage();
    } else if (dragX < -SWIPE_IMAGE_THRESHOLD) {
      showNextImage();
    }

    setTouchState({
      startX: null,
      startY: null,
      dragX: 0,
      dragY: 0,
      isDragging: false,
    });
  };

  const showPreviousImage = async () => {
    const index = images.findIndex((img) => img.id === selectedImage?.id);
    if (index > 0) {
      const originalImage = await fetchOriginalImage({
        id: images[index - 1].id,
      });
      if (originalImage) {
        setSelectedImage(originalImage);
      } else {
        throw new Error("Original image not found");
      }
    }
  };

  const showNextImage = async () => {
    const index = images.findIndex((img) => img.id === selectedImage?.id);
    if (index >= 0 && index < images.length - 1) {
      const originalImage = await fetchOriginalImage({
        id: images[index + 1].id,
      });
      if (originalImage) {
        setSelectedImage(originalImage);
      } else {
        throw new Error("Original image not found");
      }
    }
  };

  const currentImage = useMemo(() => {
    return images.find((img) => img.id === selectedImage?.id);
  }, [images, selectedImage]);

  const handleToggleFavorite = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();

    if (!selectedImage) return;
    await registerFavoriteImage({ image_id: selectedImage.id });

    setImages((prev) =>
      prev.map((img) =>
        img.id === selectedImage.id
          ? { ...img, is_favorite: !img.is_favorite }
          : img
      )
    );
  };

  const handleDeleteImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!selectedImage) return;
    try {
      await deleteImage({ image_id: selectedImage.id });
      setImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
      closeModal();
    } catch (err) {
      console.error("画像削除中にエラーが発生しました:", err);
    }
  };

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedImage) {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, closeModal]);

  if (!selectedImage) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 transition-all overscroll-contain"
      onClick={closeModal}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {!isMobile && (
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-white text-3xl font-bold z-50 hover:text-gray-300"
          aria-label="モーダルを閉じる"
        >
          &times;
        </button>
      )}

      <img
        src={selectedImage.image || undefined}
        alt="Selected image"
        className={`
    max-w-full max-h-full object-contain transition-transform duration-300
    ${touchState.isDragging ? "" : "ease-out"}
  `}
        onClick={handleImageClick}
        style={{
          transform: `translate(${touchState.dragX}px, ${touchState.dragY}px)`,
        }}
      />

      {isMobile && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70">
          上にスワイプで閉じる・左右で画像切替
        </div>
      )}
      {/* オプション切り替えボタン（右上） */}
      {showButton && (
        <button
          onClick={toggleOptionPanel}
          className="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-70 hover:bg-opacity-90 px-3 py-1 rounded z-50"
        >
          オプション
        </button>
      )}
      {showOptionPanel && (
        <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 text-black dark:text-white shadow-lg overflow-y-auto z-40 p-4">
          <h2 className="text-lg font-bold mb-2">オプション</h2>

          {/* 類似画像のダミー例 */}
          <div className="mb-4">
            <h3 className="font-semibold mb-1">類似画像</h3>
            <div className="grid grid-cols-3 gap-1">
              {/* サムネイルを並べる（仮） */}
              {images.slice(0, 6).map((img) => (
                <img
                  key={img.id}
                  src={`http://192.168.11.11/api/static/${img.thumbnail}`}
                  alt={`thumb-${img.id}`}
                  className="w-full h-auto cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>

          {/* タグ一覧（仮） */}
          <div>
            <h3 className="font-semibold mb-1">タグ</h3>
            <ul className="text-sm list-disc list-inside">
              {(selectedImage?.tags ?? []).map((tag, i) => (
                <li key={i}>{tag}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showButton && currentImage && (
        <>
          {/* ゴミ箱ボタン（左下） */}
          <button
            onClick={handleDeleteImage}
            className={`
        absolute bottom-6 left-6 rounded-full p-3 shadow-lg z-50 transition-colors
        bg-red-600 hover:bg-red-700
      `}
          >
            <TrashIcon className="h-6 w-6 text-white" />
          </button>

          {/* お気に入りボタン（右下） */}
          <button
            onClick={handleToggleFavorite}
            className={`
        absolute bottom-6 right-6 rounded-full p-3 shadow-lg z-50 transition-colors
        ${
          currentImage.is_favorite
            ? "bg-pink-500 hover:bg-pink-600"
            : "bg-gray-500 hover:bg-gray-600"
        }
      `}
          >
            <HeartIcon
              className={`h-6 w-6 transition-colors ${
                currentImage.is_favorite ? "text-white" : "text-gray-200"
              }`}
            />
          </button>
        </>
      )}
    </div>
  );
};

export default ImageModal;
