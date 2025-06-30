import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import Select from "react-select";

const Controls: React.FC = () => {
  const {
    isDarkMode,
    tags,
    selectedTag,
    setSelectedTag,
    columnCount,
    setColumnCount,
    includeSensitive,
    setIncludeSensitive,
    onlyFavorite,
    setOnlyFavorite,
  } = useAppContext();

  const [selectedCategory, setSelectedCategory] = useState<string>("全て");
  const [selectedGenre, setSelectedGenre] = useState<string>("全て");
  // カテゴリリストを作成
  const categories = Array.from(
    new Set((tags || []).map((tag) => tag.category))
  ).filter((category) => category);
  const Genres = Array.from(
    new Set((tags || []).map((tag) => tag.genre))
  ).filter((genre) => genre);
  // フィルタリングされたタグ
  const filteredTags = (tags || []).filter((tag) => {
    const categoryMatch =
      selectedCategory === "全て" || tag.category === selectedCategory;
    const genreMatch = selectedGenre === "全て" || tag.genre === selectedGenre;
    return categoryMatch && genreMatch;
  });

  // react-selectのオプション
  const tagOptions = [
    { value: "", label: "全て" },
    ...filteredTags.map((tag) => ({
      value: String(tag.tag_id),
      label: tag.tag_name,
    })),
  ];

  // 現在選択されているタグのオプション
  const currentTagOption =
    tagOptions.find((option) => option.value === selectedTag) || tagOptions[0];

  // カテゴリ変更
  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
    setSelectedTag(""); // タグ選択をリセット
  };

  const handleGenreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenre(event.target.value);
    setSelectedTag(""); // タグ選択をリセット
  };

  // タグ変更
  const handleTagChange = (option: any) => {
    setSelectedTag(option?.value || "");
  };

  // 列数変更
  const handleColumnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnCount(Number(event.target.value));
  };

  return (
    <div className="mb-6 space-y-4">
      {/* カテゴリー選択 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label
          htmlFor="category-select"
          className="text-sm font-medium min-w-fit"
        >
          カテゴリー選択:
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className={`
            px-3 py-2 border rounded-md shadow-sm transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${
              isDarkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            }
          `}
        >
          <option value="全て">全て</option>
          {categories.map((category) => (
            <option key={category} value={category ?? ""}>
              {category ?? ""}
            </option>
          ))}
        </select>
      </div>
      {/* ジャンル選択 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label htmlFor="genre-select" className="text-sm font-medium min-w-fit">
          ジャンル選択:
        </label>
        <select
          id="genre-select"
          value={selectedGenre}
          onChange={handleGenreChange}
          className={`
            px-3 py-2 border rounded-md shadow-sm transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${
              isDarkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            }
          `}
        >
          <option value="全て">全て</option>
          {Genres.map((genre) => (
            <option key={genre} value={genre ?? ""}>
              {genre ?? ""}
            </option>
          ))}
        </select>
      </div>
      {/* タグ選択 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label htmlFor="tag-select" className="text-sm font-medium min-w-fit">
          タグ選択:
        </label>
        <div className="w-full sm:w-64">
          <Select
            id="tag-select"
            options={tagOptions}
            value={currentTagOption}
            onChange={handleTagChange}
            isSearchable
            isClearable
            placeholder="タグを選択または検索..."
            noOptionsMessage={() => "該当するタグがありません"}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: isDarkMode ? "#3b82f6" : "#2563eb",
                neutral0: isDarkMode ? "#1f2937" : "#ffffff",
                neutral80: isDarkMode ? "#ffffff" : "#374151",
                neutral20: isDarkMode ? "#4b5563" : "#d1d5db",
              },
            })}
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "38px",
                boxShadow: "none",
              }),
            }}
          />
        </div>
      </div>
      {/* センシティブ画像表示トグル */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="sensitive-toggle"
          className="text-sm font-medium min-w-fit"
        >
          センシティブ画像を表示:
        </label>
        <button
          id="sensitive-toggle"
          onClick={() => setIncludeSensitive((prev) => !prev)}
          className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
            includeSensitive ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
              includeSensitive ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      {/* お気に入り画像表示トグル */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="sensitive-toggle"
          className="text-sm font-medium min-w-fit"
        >
          お気に入り画像のみを表示:
        </label>
        <button
          id="sensitive-toggle"
          onClick={() => setOnlyFavorite((prev) => !prev)}
          className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
            onlyFavorite ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
              onlyFavorite ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* 列数調整 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label
          htmlFor="column-slider"
          className="text-sm font-medium min-w-fit"
        >
          列数: {columnCount}
        </label>
        <div className="flex-1 max-w-xs">
          <input
            id="column-slider"
            type="range"
            min="1"
            max="12"
            value={columnCount}
            onChange={handleColumnChange}
            className={`
              w-full h-2 rounded-lg appearance-none cursor-pointer
              ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}
            `}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>12</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
