import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useAppContext } from "../contexts/AppContext";
import { ColumnSlider, ImageFilterButtons } from "./parts/ControlsUi";

const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    excludeInFolder,
    setExcludeInFolder,
    includeSensitive,
    setIncludeSensitive,
    onlyFavorite,
    setOnlyFavorite,
    columnCount,
    setColumnCount,
    selectedTag,
    setSelectedTag,
    showFolders,
    setShowFolders,
    aspectRatioSquare,
    setAspectRatioSquare,
    isShuffle,
    setIsShuffle,
  } = useAppContext();

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* ヘッダーの行全体 */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 text-white shadow-md rounded-lg">
        {/* 左：サイドバーを開くボタン + タイトル */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSidebarToggle}
            className="text-xl font-bold focus:outline-none text-gray-300"
            aria-label="サイドバーを開く"
          >
            &#9776;
          </button>
          <h1 className="font-bold">Tag Palette</h1>
        </div>

        {/* 右：フィルターボタン */}
        <ColumnSlider
          value={columnCount}
          onChange={(e) => setColumnCount(Number(e.target.value))}
        />
        <button
          onClick={() => setAspectRatioSquare((prev) => !prev)}
          className={[
            "relative flex items-center gap-2 px-1 py-1 rounded-full",
            "transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95",
            "font-medium text-sm shadow-lg hover:shadow-xl border-2",
            aspectRatioSquare
              ? "bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400 text-white shadow-blue-500/25"
              : "bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500 text-gray-200 shadow-gray-500/25",
          ].join(" ")}
          aria-label={`画像比率を${
            aspectRatioSquare ? "オリジナル" : "正方形"
          }に切り替え`}
        >
          <div
            className={`transition-transform duration-300 ${
              aspectRatioSquare ? "rotate-180" : ""
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              {aspectRatioSquare ? (
                <rect x="2" y="2" width="12" height="12" rx="2" />
              ) : (
                <rect x="4" y="1" width="8" height="14" rx="2" />
              )}
            </svg>
          </div>

          {aspectRatioSquare && (
            <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-pulse" />
          )}
        </button>
        <ImageFilterButtons
          excludeInFolder={excludeInFolder}
          setExcludeInFolder={setExcludeInFolder}
          showFavoriteOnly={onlyFavorite}
          setShowFavoriteOnly={setOnlyFavorite}
          showSensitive={includeSensitive}
          setShowSensitive={setIncludeSensitive}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          showFolders={showFolders}
          setShowFolders={setShowFolders}
          isShuffle={isShuffle}
          setIsShuffle={setIsShuffle}
        />
      </div>

      {/* サイドバーをレンダリング */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </>
  );
};

export default Header;
