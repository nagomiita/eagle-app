import React from "react";
import { FolderIcon, PhotoIcon } from "@heroicons/react/24/solid";

// アイコンタイプの定義
type IconType = "Folder" | "Image";

// セクション見出しコンポーネント
interface SectionHeaderProps {
  iconType?: IconType; // 文字列でアイコンを指定
  icon?: React.ReactNode; // カスタムアイコン（オプション）
  title: string;
  count?: number;
  subtitle?: string;
}

// アイコンタイプに基づいてアイコンを取得する関数
const getIconByType = (iconType: IconType): React.ReactNode => {
  switch (iconType) {
    case "Folder":
      return <FolderIcon className="w-5 h-5" />;
    case "Image":
      return <PhotoIcon className="w-5 h-5" />;
    default:
      return <PhotoIcon className="w-5 h-5" />;
  }
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  iconType,
  icon,
  title,
  count,
  subtitle,
}) => {
  // カスタムアイコンが指定されていればそれを使用、なければ iconType に基づいて選択
  const displayIcon = icon || (iconType ? getIconByType(iconType) : null);

  return (
    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-600">
      {displayIcon && <div className="text-white">{displayIcon}</div>}
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="text-sm font-normal text-gray-300 bg-gray-700 px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </h3>
        {subtitle && <p className="text-sm text-gray-300 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

// セクション区切りコンポーネント
export const SectionDivider: React.FC = () => (
  <div className="my-8 flex items-center">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
    <div className="mx-4 text-gray-400">
      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
    </div>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
  </div>
);
