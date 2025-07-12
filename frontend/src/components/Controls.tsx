import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import { LabeledSelectBox } from "./parts/ControlsUi";
import { TagSelector } from "./parts/ControlsUi";
import { ToggleSwitch } from "./parts/ControlsUi";
import { ColumnSlider } from "./parts/ControlsUi";

const Controls: React.FC = () => {
  const {
    tags,
    selectedTag,
    setSelectedTag,
    columnCount,
    setColumnCount,
    includeSensitive,
    setIncludeSensitive,
    onlyFavorite,
    setOnlyFavorite,
    setShowTagOverview,
  } = useAppContext();

  const [selectedCategory, setSelectedCategory] = useState<string>("全て");
  const [selectedGenre, setSelectedGenre] = useState<string>("全て");

  const categories = Array.from(
    new Set((tags || []).map((tag) => tag.category))
  ).filter(
    (category): category is string =>
      typeof category === "string" && Boolean(category)
  );

  const genres = Array.from(
    new Set((tags || []).map((tag) => tag.genre))
  ).filter(
    (genre): genre is string => typeof genre === "string" && Boolean(genre)
  );

  const filteredTags = (tags || []).filter((tag) => {
    const categoryMatch =
      selectedCategory === "全て" || tag.category === selectedCategory;
    const genreMatch = selectedGenre === "全て" || tag.genre === selectedGenre;
    return categoryMatch && genreMatch;
  });

  return (
    <div className="mb-6 space-y-4">
      <LabeledSelectBox
        label="カテゴリー選択:"
        id="category-select"
        value={selectedCategory}
        options={["全て", ...categories]}
        onChange={(e) => {
          setSelectedCategory(e.target.value);
          setSelectedTag("");
        }}
      />

      <LabeledSelectBox
        label="ジャンル選択:"
        id="genre-select"
        value={selectedGenre}
        options={["全て", ...genres]}
        onChange={(e) => {
          setSelectedGenre(e.target.value);
          setSelectedTag("");
        }}
      />

      <TagSelector
        label="タグ選択:"
        id="tag-select"
        tags={filteredTags}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
      />

      <ToggleSwitch
        id="sensitive-toggle"
        label="センシティブ画像を表示:"
        checked={includeSensitive}
        onToggle={() => setIncludeSensitive((prev) => !prev)}
      />

      <ToggleSwitch
        id="favorite-toggle"
        label="お気に入り画像のみを表示:"
        checked={onlyFavorite}
        onToggle={() => setOnlyFavorite((prev) => !prev)}
      />

      <ColumnSlider
        label="列数:"
        value={columnCount}
        onChange={(e) => setColumnCount(Number(e.target.value))}
      />
      <button
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        onClick={() => setShowTagOverview(true)}
      >
        タグ一覧を見る
      </button>
    </div>
  );
};

export default Controls;
