import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useAppContext } from "../contexts/AppContext";
import { ColumnSlider, ImageFilterButtons } from "./parts/ControlsUi";

const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
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
      <div className="flex justify-between items-center mb-5 px-4 py-2 bg-gray-800 text-white shadow-md rounded-lg">
        {/* 左：サイドバーを開くボタン + タイトル */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSidebarToggle}
            className="text-2xl font-bold focus:outline-none text-gray-300"
            aria-label="サイドバーを開く"
          >
            &#9776;
          </button>
          <h1 className="text-xl font-bold">Tag Palette</h1>
        </div>

        {/* 右：フィルターボタン */}
        <ColumnSlider
          value={columnCount}
          onChange={(e) => setColumnCount(Number(e.target.value))}
        />
        <ImageFilterButtons
          showFavoriteOnly={onlyFavorite}
          setShowFavoriteOnly={setOnlyFavorite}
          showSensitive={includeSensitive}
          setShowSensitive={setIncludeSensitive}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          showFolders={showFolders}
          setShowFolders={setShowFolders}
        />
      </div>

      {/* サイドバーをレンダリング */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </>
  );
};

export default Header;
