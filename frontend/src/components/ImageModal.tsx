import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import {
  deleteImage,
  fetchOriginalImage,
  fetchSimilarImages,
} from "../api/default/default";
import { HeartIcon } from "@heroicons/react/24/solid";
import { registerFavoriteImage } from "../api/default/default";
import { TrashIcon } from "@heroicons/react/24/solid";
import { ThumbnailImage } from "../api/model";
import { SidebarUi } from "../components/ui/SidebarUi"; // Sidebarをインポート

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
  const {
    selectedImage,
    setSelectedImage,
    closeModal,
    images,
    setImages,
    includeSensitive,
  } = useAppContext();

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
  const [similarImages, setSimilarImages] = useState<ThumbnailImage[]>([]);

  // オプション切り替え
  const toggleOptionPanel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowOptionPanel((prev) => !prev);
  };

  // サイドバーを閉じる
  const closeSidebar = () => {
    setShowOptionPanel(false);
  };

  const handleThumbnailClick = async (imageId: number) => {
    try {
      const originalImage = await fetchOriginalImage({ id: imageId });

      if (!originalImage) {
        console.warn(`📛 画像が見つかりません: ID = ${imageId}`);
        return;
      }

      setSelectedImage(originalImage);
      setShowOptionPanel(false);
    } catch (error) {
      console.error("❌ オリジナル画像の取得中にエラーが発生:", error);
    }
  };

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!selectedImage) return;
      try {
        const SimilarImages = await fetchSimilarImages({
          image_id: selectedImage.id,
          show_sensitive: includeSensitive,
        });
        setSimilarImages(SimilarImages);
      } catch (error) {
        console.error("❌ 類似画像の取得に失敗しました:", error);
      }
    };

    fetchSimilar();
  }, [selectedImage]);

  // 画像クリック時にFABトグル
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    setShowOptionPanel(false);
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

    const preventTouchScroll = (e: TouchEvent) => {
      // サイドバーが開いている場合は、モーダルのスクロール抑制を緩和
      if (showOptionPanel) {
        return;
      }
      e.preventDefault();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventTouchScroll, {
      passive: false,
    });

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventTouchScroll);
    };
  }, [selectedImage, showOptionPanel]);

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

  // タッチイベントハンドラー（サイドバー開いてない時のみ）
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || showOptionPanel) return;

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
      touchState.startY === null ||
      showOptionPanel
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
    if (!isMobile || !touchState.isDragging || showOptionPanel) return;

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
        if (showOptionPanel) {
          setShowOptionPanel(false);
        } else {
          closeModal();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, closeModal, showOptionPanel]);

  if (!selectedImage) return null;

  return (
    <>
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

        {isMobile && showButton && !showOptionPanel && (
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

      {/* 右側からのサイドバー */}
      {showOptionPanel && (
        <SidebarUi
          position="right"
          title="画像オプション"
          onClose={closeSidebar}
        >
          {/* 類似画像 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-gray-100">類似画像</h3>
            <div className="grid grid-cols-3 gap-1">
              {similarImages.map((img) => (
                <div
                  key={img.id}
                  className="relative w-full pt-[100%] bg-gray-700 overflow-hidden rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleThumbnailClick(img.id)}
                >
                  <img
                    src={`http://192.168.11.11/api/static/${img.thumbnail}`}
                    alt={`thumb-${img.id}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {similarImages.length === 0 && (
              <p className="text-gray-400 text-sm">類似画像がありません</p>
            )}
          </div>

          {/* タグ一覧 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-gray-100">タグ</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {(selectedImage?.tags ?? []).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-700 rounded text-gray-100 hover:bg-gray-600 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
            {(!selectedImage?.tags || selectedImage.tags.length === 0) && (
              <p className="text-gray-400 text-sm">タグがありません</p>
            )}
          </div>
        </SidebarUi>
      )}
    </>
  );
};

export default ImageModal;
