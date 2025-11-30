import React from "react";
import { OriginalImage, ThumbnailImage } from "../api/model";
import { useAppContext } from "../contexts/AppContext";
import TagList from "./parts/TagList";
import ThumbnailGrid from "./parts/ThumbnailGrid";

type Props = {
  sheetRef: React.RefObject<HTMLDivElement | null>;
  sheetTranslateY: number;
  handleSheetTouchStart: (e: React.TouchEvent) => void;
  handleSheetTouchMove: (e: React.TouchEvent) => void;
  handleSheetTouchEnd: () => void;
  selectedImage?: OriginalImage | null;
  handleTagClick: (tagId: number) => () => void;
  excludeFolderImages: boolean;
  setExcludeFolderImages: React.Dispatch<React.SetStateAction<boolean>>;
  isSimilarLoading: boolean;
  similarImages: ThumbnailImage[];
  isMobile: boolean;
  handleThumbnailClick: (id: number) => Promise<void> | void;
};

const ImageOptionPanel: React.FC<Props> = ({
  sheetRef,
  sheetTranslateY,
  handleSheetTouchStart,
  handleSheetTouchMove,
  handleSheetTouchEnd,
  selectedImage,
  handleTagClick,
  excludeFolderImages,
  setExcludeFolderImages,
  isSimilarLoading,
  similarImages,
  isMobile,
  handleThumbnailClick,
}) => {
  const { folders } = useAppContext();
  return (
    // bottom sheet container
    <div
      ref={sheetRef as React.RefObject<HTMLDivElement>}
      className="fixed left-0 right-0 bottom-0 w-full z-50"
      onTouchStart={handleSheetTouchStart}
      onTouchMove={handleSheetTouchMove}
      onTouchEnd={handleSheetTouchEnd}
    >
      <div
        className="bg-gradient-to-b from-gray-900 to-gray-950 backdrop-blur-lg bg-opacity-98 border-t border-gray-700 shadow-2xl"
        style={{
          transform: `translateY(${sheetTranslateY}%)`,
          transition: "transform 240ms ease-out",
          touchAction: "none",
          maxHeight: "70vh",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
        }}
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-600 rounded-full opacity-50"></div>
        </div>

        {/* コンテンツエリア */}
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: "calc(70vh - 40px)" }}>
          {/* タグセクション */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Tags</h3>
            <TagList tags={selectedImage?.tags ?? []} onTagClick={handleTagClick} />
          </div>

          {/* 類似画像のオプション: フォルダ内の画像を含めるか（トグル） */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-gray-300"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M4 3a1 1 0 011-1h10a1 1 0 011 1v2H4V3zM3 7h14v8a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-200">フォルダ内の画像を除外する</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">フォルダに格納された画像を類似検索の対象から除外します（検索結果や速度に影響する可能性があります）。</p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={excludeFolderImages}
                onClick={() => setExcludeFolderImages((v: boolean) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  excludeFolderImages ? "bg-red-600" : "bg-gray-600"
                }`}
                title={excludeFolderImages ? "フォルダ内の画像を除外する: ON" : "フォルダ内の画像を除外する: OFF"}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${excludeFolderImages ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          {/* 類似画像セクション */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Similar Images</h3>
            {isSimilarLoading ? (
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <svg className="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>類似画像を取得中...</span>
              </div>
            ) : similarImages.length > 0 ? (
              <ThumbnailGrid images={similarImages} folders={folders} columnCount={isMobile ? 4 : 8} onClick={handleThumbnailClick} />
            ) : (
              <div className="text-sm text-gray-400">類似画像は見つかりませんでした</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageOptionPanel;
