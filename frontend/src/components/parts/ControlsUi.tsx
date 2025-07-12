import React from "react";
import { HeartIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  EyeSlashIcon as EyeSlashSolidIcon,
} from "@heroicons/react/24/solid";
import { TagIcon } from "@heroicons/react/24/outline";
import { TagIcon as TagSolidIcon } from "@heroicons/react/24/solid";

export const ImageFilterButtons = ({
  showFavoriteOnly,
  setShowFavoriteOnly,
  showSensitive,
  setShowSensitive,
  selectedTag,
  setSelectedTag,
}: {
  showFavoriteOnly: boolean;
  setShowFavoriteOnly: (val: boolean) => void;
  showSensitive: boolean;
  setShowSensitive: (val: boolean) => void;
  selectedTag: string;
  setSelectedTag: (tagId: string) => void;
}) => (
  <div className="flex gap-2 items-center">
    {/* タグ選択フィルター解除ボタン */}
    <button
      onClick={
        () => setSelectedTag(selectedTag ? "" : selectedTag) // クリックで解除
      }
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

    {/* センシティブフィルター */}
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
    <div className="flex-1 max-w-xs">
      <input
        id="column-slider"
        type="range"
        min="1"
        max="12"
        value={value}
        onChange={onChange}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
      />
    </div>
  </div>
);
