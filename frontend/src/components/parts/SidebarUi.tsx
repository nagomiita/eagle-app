import React from "react";

interface SidebarUiProps {
  onClose: () => void;
  children: React.ReactNode;
  position?: "left" | "right"; // デフォルトは左
}

export const SidebarUi: React.FC<SidebarUiProps> = ({
  onClose,
  children,
  position = "left", // デフォルト引数
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
        w-72 sm:w-96 md:w-[28rem] lg:w-[32rem] xl:w-[36rem]
        bg-gray-900 text-white shadow-lg z-50 
        transform transition-transform duration-300 translate-x-0`}
      >
        {/* 内容 */}
        <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
          {children}
        </div>
      </div>
    </>
  );
};
