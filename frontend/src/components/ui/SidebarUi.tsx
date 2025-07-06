import React from "react";

interface SidebarUiProps {
  onClose: () => void;
  children: React.ReactNode;
  position?: "left" | "right"; // デフォルトは左
  title?: string; // カスタマイズ可能なタイトル
}

export const SidebarUi: React.FC<SidebarUiProps> = ({
  onClose,
  children,
  position = "left", // デフォルト引数
  title = "メニュー",
}) => {
  // ポジションに応じてスタイルを動的に変更
  const positionClasses = position === "left" ? "left-0" : "right-0";

  return (
    <>
      {/* オーバーレイ背景 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* サイドバー本体 */}
      <div
        className={`fixed top-0 ${positionClasses} h-full 
          w-64 sm:w-80 md:w-96 lg:w-[28rem]
          bg-gray-900 text-white shadow-lg z-50 
          transform transition-transform duration-300 translate-x-0`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-red-500 transition-colors text-xl font-bold"
            aria-label="サイドバーを閉じる"
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
          {children}
        </div>
      </div>
    </>
  );
};
