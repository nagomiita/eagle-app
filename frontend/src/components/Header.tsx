import React, { useState } from "react";
import Sidebar from "./Sidebar";

const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-5 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSidebarToggle}
            className={"text-2xl font-bold focus:outline-none text-gray"}
            aria-label="サイドバーを開く"
          >
            &#9776;
          </button>
          <h1 className="text-2xl font-bold">Tag Palette</h1>
        </div>
      </div>

      {/* サイドバーをレンダリング */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </>
  );
};

export default Header;
