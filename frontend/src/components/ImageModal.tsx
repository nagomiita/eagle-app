import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import {
  deleteImage,
  fetchOriginalImage,
  fetchSimilarImages,
} from "../api/default/default";
import { registerFavoriteImage } from "../api/default/default";
import { FolderInfo, ThumbnailImage } from "../api/model";
import { SidebarUi } from "./parts/SidebarUi";
import ThumbnailGrid from "./parts/ThumbnailGrid";
import ActionButton from "./parts/ActionButton";
import TagList from "./parts/TagList";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const SWIPE_CLOSE_THRESHOLD = 100;
const SWIPE_IMAGE_THRESHOLD = 80;
const MOBILE_BREAKPOINT = 1024;
const VELOCITY_THRESHOLD = 0.5; // スワイプ速度による切り替え閾値

interface TouchState {
  startX: number | null;
  startY: number | null;
  dragX: number;
  dragY: number;
  isDragging: boolean;
  lastMoveTime: number;
  lastMoveX: number;
  velocity: number;
}

interface ImageModalProps {
  images: ThumbnailImage[];
  setImages?: React.Dispatch<React.SetStateAction<ThumbnailImage[]>>;
  setFolders?: React.Dispatch<React.SetStateAction<FolderInfo[]>>;
}

const ImageModal: React.FC<ImageModalProps> = ({
  images,
  setImages,
  setFolders,
}) => {
  const {
    selectedImage,
    setSelectedImage,
    closeModal,
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
    lastMoveTime: 0,
    lastMoveX: 0,
    velocity: 0,
  });
  const [showOptionPanel, setShowOptionPanel] = useState(false);
  const [similarImages, setSimilarImages] = useState<ThumbnailImage[]>([]);
  const [showCarouselControls, setShowCarouselControls] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 現在の画像インデックスを取得
  const currentIndex = useMemo(() => {
    return images.findIndex((img) => img.id === selectedImage?.id);
  }, [images, selectedImage]);

  // 前後の画像があるかどうか
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < images.length - 1;

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

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    setShowOptionPanel(false);
    setShowButton((prev) => !prev);
    setShowCarouselControls((prev) => !prev);
  };

  const handleTagClick = (tagId: number) => () => {
    setSelectedTag(String(tagId));
    setShowOptionPanel(false);
    closeModal();
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    const preventTouchScroll = (e: TouchEvent) => {
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

  useEffect(() => {
    setTouchState({
      startX: null,
      startY: null,
      dragX: 0,
      dragY: 0,
      isDragging: false,
      lastMoveTime: 0,
      lastMoveX: 0,
      velocity: 0,
    });
    setIsTransitioning(false);
  }, [selectedImage]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || showOptionPanel || isTransitioning) return;

    const now = Date.now();
    setTouchState({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      dragX: 0,
      dragY: 0,
      isDragging: true,
      lastMoveTime: now,
      lastMoveX: e.touches[0].clientX,
      velocity: 0,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      !isMobile ||
      !touchState.isDragging ||
      touchState.startX === null ||
      touchState.startY === null ||
      showOptionPanel ||
      isTransitioning
    )
      return;

    const now = Date.now();
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchState.startX;
    const deltaY = e.touches[0].clientY - touchState.startY;

    // 速度計算
    const timeDelta = now - touchState.lastMoveTime;
    const distanceDelta = currentX - touchState.lastMoveX;
    const velocity = timeDelta > 0 ? distanceDelta / timeDelta : 0;

    // 境界での抵抗効果
    let adjustedDeltaX = deltaX;
    if ((deltaX > 0 && !hasPrevious) || (deltaX < 0 && !hasNext)) {
      // 境界での抵抗（減衰効果）
      adjustedDeltaX = deltaX * 0.3;
    }

    setTouchState((prev) => ({
      ...prev,
      dragX: adjustedDeltaX,
      dragY: deltaY < 0 ? deltaY : 0,
      lastMoveTime: now,
      lastMoveX: currentX,
      velocity: velocity,
    }));
  };

  const handleTouchEnd = () => {
    if (
      !isMobile ||
      !touchState.isDragging ||
      showOptionPanel ||
      isTransitioning
    )
      return;

    const { dragX, dragY, velocity } = touchState;

    // 上スワイプで閉じる
    if (dragY < -SWIPE_CLOSE_THRESHOLD) {
      closeModal();
      return;
    }

    // 速度による判定または距離による判定
    const shouldSwipeLeft =
      (dragX < -SWIPE_IMAGE_THRESHOLD ||
        (dragX < -30 && velocity < -VELOCITY_THRESHOLD)) &&
      hasNext;
    const shouldSwipeRight =
      (dragX > SWIPE_IMAGE_THRESHOLD ||
        (dragX > 30 && velocity > VELOCITY_THRESHOLD)) &&
      hasPrevious;

    if (shouldSwipeLeft) {
      setIsTransitioning(true);
      showNextImage();
    } else if (shouldSwipeRight) {
      setIsTransitioning(true);
      showPreviousImage();
    }

    // ドラッグ状態をリセット（アニメーション付き）
    setTouchState((prev) => ({
      ...prev,
      startX: null,
      startY: null,
      dragX: 0,
      dragY: 0,
      isDragging: false,
      velocity: 0,
    }));
  };

  const showPreviousImage = async () => {
    if (!hasPrevious) return;

    try {
      const originalImage = await fetchOriginalImage({
        id: images[currentIndex - 1].id,
      });
      if (originalImage) {
        setSelectedImage(originalImage);
      }
    } catch (error) {
      console.error("前の画像の取得に失敗:", error);
    } finally {
      setIsTransitioning(false);
    }
  };

  const showNextImage = async () => {
    if (!hasNext) return;

    try {
      const originalImage = await fetchOriginalImage({
        id: images[currentIndex + 1].id,
      });
      if (originalImage) {
        setSelectedImage(originalImage);
      }
    } catch (error) {
      console.error("次の画像の取得に失敗:", error);
    } finally {
      setIsTransitioning(false);
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

    if (setImages) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImage.id
            ? { ...img, is_favorite: !img.is_favorite }
            : img
        )
      );
    }
    // setFoldersが存在する場合、フォルダ内の画像も更新
    if (setFolders) {
      setFolders((prev) =>
        prev.map((folder) => ({
          ...folder,
          thumbnail_images: folder.thumbnail_images.map((img) =>
            img.id === selectedImage.id
              ? { ...img, is_favorite: !img.is_favorite }
              : img
          ),
        }))
      );
    }
  };

  const handleDeleteImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!selectedImage) return;
    try {
      await deleteImage({ image_id: selectedImage.id });
      if (setImages) {
        setImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
      }
      // setFoldersが存在する場合、フォルダ内の画像も更新
      if (setFolders) {
        setFolders((prev) =>
          prev.map((folder) => ({
            ...folder,
            thumbnail_images: folder.thumbnail_images.filter(
              (img) => img.id !== selectedImage.id
            ),
          }))
        );
      }
      alert("✅ 画像を削除しました");
      closeModal();
    } catch (err) {
      console.error("画像削除中にエラーが発生しました:", err);
    }
  };

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage || isTransitioning) return;

      switch (e.key) {
        case "Escape":
          if (showOptionPanel) {
            setShowOptionPanel(false);
          } else {
            closeModal();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (hasPrevious) {
            setIsTransitioning(true);
            showPreviousImage();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (hasNext) {
            setIsTransitioning(true);
            showNextImage();
          }
          break;
        case " ": // スペースキー
          e.preventDefault();
          setShowButton((prev) => !prev);
          setShowCarouselControls((prev) => !prev);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedImage,
    closeModal,
    showOptionPanel,
    hasPrevious,
    hasNext,
    isTransitioning,
  ]);

  // 画像の透明度計算（スワイプ中の視覚効果）
  const imageOpacity = useMemo(() => {
    if (!touchState.isDragging) return 1;
    const maxDrag = 200;
    const opacity = 1 - Math.min(Math.abs(touchState.dragX) / maxDrag, 0.3);
    return Math.max(opacity, 0.7);
  }, [touchState.isDragging, touchState.dragX]);

  // 背景の透明度計算
  const backgroundOpacity = useMemo(() => {
    if (!touchState.isDragging) return 0.8;
    const maxDrag = 300;
    const opacity = 0.8 - Math.min(Math.abs(touchState.dragY) / maxDrag, 0.4);
    return Math.max(opacity, 0.4);
  }, [touchState.isDragging, touchState.dragY]);

  if (!selectedImage) return null;

  return (
    <>
      <div
        ref={modalRef}
        className="fixed inset-0 bg-black flex justify-center items-center z-50 transition-all overscroll-contain"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`,
          transition: touchState.isDragging
            ? "none"
            : "background-color 0.3s ease-out",
        }}
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

        {/* デスクトップ用カルーセルナビゲーション */}
        {!isMobile && showCarouselControls && hasPrevious && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsTransitioning(true);
              showPreviousImage();
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-50 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
            aria-label="前の画像"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
        )}

        {!isMobile && showCarouselControls && hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsTransitioning(true);
              showNextImage();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-50 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
            aria-label="次の画像"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        )}

        <img
          src={selectedImage.image || undefined}
          alt="Selected image"
          className="max-w-full max-h-full object-contain"
          onClick={handleImageClick}
          style={{
            transform: `translate(${touchState.dragX}px, ${touchState.dragY}px)`,
            opacity: imageOpacity,
            transition:
              touchState.isDragging || isTransitioning
                ? "none"
                : "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.2s ease-out",
          }}
        />

        {/* 画像カウンター表示 */}
        {showCarouselControls && images.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70 bg-black bg-opacity-50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {isMobile && showButton && !showOptionPanel && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70">
            上にスワイプで閉じる・左右で画像切替
          </div>
        )}

        {/* モバイル用カルーセルインジケーター */}
        {isMobile && showButton && images.length > 1 && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white opacity-100"
                    : "bg-white opacity-30"
                }`}
              />
            ))}
          </div>
        )}

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
              isActive={currentImage.is_favorite}
              onClick={handleDeleteImage}
            />
          </>
        )}
      </div>

      {showOptionPanel && (
        <SidebarUi position="right" onClose={closeSidebar}>
          <TagList
            tags={selectedImage?.tags ?? []}
            onTagClick={handleTagClick}
          />
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
