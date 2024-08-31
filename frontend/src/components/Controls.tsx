import React from "react";
import { useAppContext } from "../contexts/AppContext";

const Controls: React.FC = () => {
  const {
    isDarkMode,
    tags,
    selectedTag,
    setSelectedTag,
    limit,
    setLimit,
    columnCount,
    setColumnCount,
  } = useAppContext();

  return (
    <div className="mb-5">
      <div className="mb-4">
        <label htmlFor="tag-select" className="mr-2">
          タグ選択:{" "}
        </label>
        <select
          id="tag-select"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className={`${
            isDarkMode ? "bg-gray-700 text-white" : "bg-white text-black"
          } border rounded p-1`}
        >
          <option value="">全て</option>
          {tags.historyTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="limit-select" className="mr-2">
          表示数:{" "}
        </label>
        <select
          id="limit-select"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className={`${
            isDarkMode ? "bg-gray-700 text-white" : "bg-white text-black"
          } border rounded p-1`}
        >
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="500">500</option>
          <option value="1000">1000</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="column-slider" className="mr-2">
          列の数: {columnCount}
        </label>
        <input
          id="column-slider"
          type="range"
          min="1"
          max="12"
          value={columnCount}
          onChange={(e) => setColumnCount(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default Controls;
