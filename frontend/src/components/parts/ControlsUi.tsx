import React from "react";
import {
  HeartIcon,
  HeartIcon as HeartSolidIcon,
  EyeSlashIcon,
  EyeSlashIcon as EyeSlashSolidIcon,
  FolderIcon,
  FolderOpenIcon,
  TagIcon,
  TagIcon as TagSolidIcon,
  PhotoIcon,
  PhotoIcon as PhotoSolidIcon,
  ArrowsRightLeftIcon,
  ArrowsRightLeftIcon as ArrowsRightLeftSolidIcon,
} from "@heroicons/react/24/solid";

interface ImageFilterButtonsProps {
  showFavoriteOnly: boolean;
  setShowFavoriteOnly: (val: boolean) => void;
  showSensitive: boolean;
  setShowSensitive: (val: boolean) => void;
  selectedTag: string;
  setSelectedTag: (tagId: string) => void;
  showFolders: boolean;
  setShowFolders: (val: boolean) => void;
  excludeInFolder: boolean;
  setExcludeInFolder: React.Dispatch<React.SetStateAction<boolean>>;
  isShuffle: boolean;
  setIsShuffle: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ImageFilterButtons: React.FC<ImageFilterButtonsProps> = ({
  showFavoriteOnly,
  setShowFavoriteOnly,
  showSensitive,
  setShowSensitive,
  selectedTag,
  setSelectedTag,
  showFolders,
  setShowFolders,
  excludeInFolder,
  setExcludeInFolder,
  isShuffle,
  setIsShuffle,
}) => (
  <div className="flex gap-2 items-center">
    {/* シャッフルボタン */}
    <button
      onClick={() => setIsShuffle(!isShuffle)}
      className={`rounded-full transition-all ${
        isShuffle
          ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
          : "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
      }`}
      title="画像をシャッフル"
    >
      {isShuffle ? (
        <ArrowsRightLeftSolidIcon className="w-5 h-5" />
      ) : (
        <ArrowsRightLeftIcon className="w-5 h-5" />
      )}
    </button>
    {/* タグ選択フィルター解除 */}
    <button
      onClick={() => setSelectedTag(selectedTag ? "" : selectedTag)}
      className={`rounded-full transition-all ${
        selectedTag
          ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
          : "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
      }`}
      title="選択されたタグを解除"
    >
      {selectedTag ? (
        <TagSolidIcon className="w-5 h-5" />
      ) : (
        <TagIcon className="w-5 h-5" />
      )}
    </button>
    {/* イラスト全表示切り替えボタン */}
    <button
      onClick={() => setExcludeInFolder(!excludeInFolder)}
      className={`rounded-full transition-all ${
        !excludeInFolder
          ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
          : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
      }`}
      title="フォルダ表示の切り替え"
    >
      {excludeInFolder ? (
        <PhotoSolidIcon className="w-5 h-5" />
      ) : (
        <PhotoIcon className="w-5 h-5" />
      )}
    </button>

    {/* フォルダ表示切り替えボタン */}
    <button
      onClick={() => setShowFolders(!showFolders)}
      className={`rounded-full transition-all ${
        showFolders
          ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
          : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
      }`}
      title="フォルダ表示の切り替え"
    >
      {showFolders ? (
        <FolderOpenIcon className="w-5 h-5" />
      ) : (
        <FolderIcon className="w-5 h-5" />
      )}
    </button>

    {/* お気に入りフィルター */}
    <button
      onClick={() => setShowFavoriteOnly(!showFavoriteOnly)}
      className={`rounded-full transition-all ${
        showFavoriteOnly
          ? "bg-pink-500/20 text-pink-400 hover:bg-pink-500/30"
          : "text-gray-400 hover:text-pink-400 hover:bg-pink-500/10"
      }`}
      title="お気に入りのみ表示"
    >
      {showFavoriteOnly ? (
        <HeartSolidIcon className="w-5 h-5" />
      ) : (
        <HeartIcon className="w-5 h-5" />
      )}
    </button>

    {/* センシティブ表示切り替え */}
    <button
      onClick={() => setShowSensitive(!showSensitive)}
      className={`rounded-full transition-all ${
        showSensitive
          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
          : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
      }`}
      title="センシティブを表示"
    >
      {showSensitive ? (
        <EyeSlashSolidIcon className="w-5 h-5" />
      ) : (
        <EyeSlashIcon className="w-5 h-5" />
      )}
    </button>
  </div>
);

// スライダー
export const ColumnSlider = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
    <div className="flex-1 max-w-[100px]">
      <input
        id="column-slider"
        type="range"
        min="1"
        max="20"
        value={value}
        onChange={onChange}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
      />
    </div>
  </div>
);
