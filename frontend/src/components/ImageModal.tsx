import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../contexts/AppContext";

// 定数定義
const SWIPE_CLOSE_THRESHOLD = 100; // px
const MOBILE_BREAKPOINT = 1024; // px

// タッチ操作の状態を管理する型
interface TouchState {
  startY: number | null;
  dragY: number;
  isDragging: boolean;
}

const ImageModal: React.FC = () => {
  const { selectedImage, closeModal } = useAppContext();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [touchState, setTouchState] = useState<TouchState>({
    startY: null,
    dragY: 0,
    isDragging: false,
  });

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
      e.preventDefault();
    };

    // スクロール無効化
    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventTouchScroll, {
      passive: false,
    });

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventTouchScroll);
    };
  }, [selectedImage]);

  // 画像変更時のタッチ状態リセット
  useEffect(() => {
    setTouchState({
      startY: null,
      dragY: 0,
      isDragging: false,
    });
  }, [selectedImage]);

  // タッチイベントハンドラー
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;

    setTouchState((prev) => ({
      ...prev,
      startY: e.touches[0].clientY,
      isDragging: true,
    }));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !touchState.isDragging || touchState.startY === null)
      return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchState.startY;

    // 上方向のスワイプのみ許可
    if (deltaY < 0) {
      setTouchState((prev) => ({
        ...prev,
        dragY: deltaY,
      }));
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;

    // スワイプ距離が閾値を超えた場合は閉じる
    if (touchState.dragY < -SWIPE_CLOSE_THRESHOLD) {
      closeModal();
    } else {
      // 元の位置に戻す
      setTouchState((prev) => ({
        ...prev,
        dragY: 0,
      }));
    }

    setTouchState((prev) => ({
      ...prev,
      isDragging: false,
      startY: null,
    }));
  };

  // ESCキーでモーダル閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedImage) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, closeModal]);

  // モーダルが開いていない場合は何も表示しない
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
      {/* デスクトップ用の閉じるボタン */}
      {!isMobile && (
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-white text-3xl font-bold z-50 hover:text-gray-300 transition-colors"
          aria-label="モーダルを閉じる"
        >
          &times;
        </button>
      )}

      {/* 画像表示 */}
      <img
        src={selectedImage.image || undefined}
        alt="Selected image"
        className={`
          max-w-full max-h-full object-contain transition-transform duration-300
          ${touchState.isDragging ? "" : "ease-out"}
        `}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translateY(${touchState.dragY}px)`,
        }}
        onError={(e) => {
          console.error(
            `画像の読み込みに失敗しました:${e}`,
            selectedImage.image
          );
        }}
      />

      {/* モバイル用のスワイプヒント */}
      {isMobile && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70">
          上にスワイプして閉じる
        </div>
      )}
    </div>
  );
};

export default ImageModal;
