import React from "react";

interface SidebarUiProps {
  onClose: () => void;
  children: React.ReactNode;
}

export const SidebarUi: React.FC<SidebarUiProps> = ({ onClose, children }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full 
        w-64 sm:w-80 md:w-96 lg:w-[28rem]
        bg-gray-900 text-white shadow-lg z-50 
        transform transition-transform duration-300 translate-x-0`}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">メニュー</h2>
        <button onClick={onClose} className="text-gray-300 hover:text-red-500">
          ×
        </button>
      </div>

      {/* 内容 */}
      <div className="p-4 overflow-y-auto">{children}</div>
    </div>
  );
};
