import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import {
  deleteImage,
  fetchOriginalImage,
  fetchSimilarImages,
} from "../api/default/default";
import { registerFavoriteImage } from "../api/default/default";
import { ThumbnailImage } from "../api/model";
import { SidebarUi } from "./parts/SidebarUi"; // Sidebarをインポート
import ThumbnailGrid from "./parts/ThumbnailGrid";
import ActionButton from "./parts/ActionButton";
import TagList from "./parts/TagList";

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

interface ImageModalProps {
  images: ThumbnailImage[];
}

const ImageModal: React.FC<ImageModalProps> = ({ images }) => {
  const {
    selectedImage,
    setSelectedImage,
    closeModal,
    setImages,
    includeSensitive,
    setSelectedTag,
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

  const handleTagClick = (tagId: number) => () => {
    setSelectedTag(String(tagId));
    setShowOptionPanel(false);
    closeModal();
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
          <ActionButton
            type="options"
            position="top-right"
            onClick={(e) => {
              e.stopPropagation();
              setShowOptionPanel((prev) => !prev);
            }}
          />
        )}

        {showButton && currentImage && (
          <>
            <ActionButton
              type="favorite"
              position="bottom-right"
              isActive={currentImage.is_favorite}
              onClick={handleToggleFavorite}
            />

            <ActionButton
              type="delete"
              position="bottom-left"
              isActive={currentImage.is_favorite} //お気に入りは削除不可
              onClick={handleDeleteImage}
            />
          </>
        )}
      </div>

      {/* 右側からのサイドバー */}
      {showOptionPanel && (
        <SidebarUi position="right" onClose={closeSidebar}>
          {/* タグ一覧 */}
          <TagList
            tags={selectedImage?.tags ?? []}
            onTagClick={handleTagClick}
          />
          {/* 類似画像 */}
          <ThumbnailGrid
            images={similarImages}
            columnCount={3}
            onClick={handleThumbnailClick}
          />
        </SidebarUi>
      )}
    </>
  );
};

export default ImageModal;
