import React from "react";
import Controls from "./Controls";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">メニュー</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-red-500"
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 overflow-y-auto">
          <Controls />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
