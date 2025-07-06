import React from "react";
import Select from "react-select";

// セレクトボックス汎用コンポーネント
export const LabeledSelectBox = ({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
    <label htmlFor={id} className="text-sm font-medium min-w-fit">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="
    w-full max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md
    px-3 py-2 border rounded-md shadow-sm transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500
    bg-gray-700 text-white border-gray-600
    truncate
  "
    >
      {options.map((option) => (
        <option key={option} value={option ?? ""}>
          {option ?? ""}
        </option>
      ))}
    </select>
  </div>
);

// タグ選択用コンポーネント
export const TagSelector = ({
  id,
  label,
  tags,
  selectedTag,
  setSelectedTag,
}: {
  id: string;
  label: string;
  tags: { tag_id: string | number; tag_name: string }[];
  selectedTag: string;
  setSelectedTag: (value: string) => void;
}) => {
  const tagOptions = [
    { value: "", label: "全て" },
    ...tags.map((tag) => ({
      value: String(tag.tag_id),
      label: tag.tag_name,
    })),
  ];

  const selectedOption =
    tagOptions.find((opt) => opt.value === selectedTag) || tagOptions[0];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <label htmlFor={id} className="text-sm font-medium min-w-fit">
        {label}
      </label>
      <div className="w-full sm:w-64">
        <Select
          id={id}
          options={tagOptions}
          value={selectedOption}
          onChange={(opt) => setSelectedTag(opt?.value || "")}
          isSearchable
          isClearable
          placeholder="タグを選択または検索..."
          noOptionsMessage={() => "該当するタグがありません"}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#3b82f6", // アクティブ色（青系）
              primary25: "#374151", // ホバー時の背景色（暗いグレー）
              neutral0: "#1f2937", // 背景色（かなり暗い）
              neutral20: "#4b5563", // 境界線（灰色）
              neutral80: "#ffffff", // テキスト（白）
            },
          })}
          styles={{
            control: (base) => ({
              ...base,
              minHeight: "38px",
              boxShadow: "none",
              backgroundColor: "#1f2937", // 入力欄背景
              borderColor: "#4b5563", // 入力欄枠線
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: "#1f2937", // メニュー背景
            }),
            option: (base, { isFocused }) => ({
              ...base,
              backgroundColor: isFocused ? "#374151" : "transparent", // ホバー時の背景色
              color: "#ffffff", // テキスト色
            }),
          }}
        />
      </div>
    </div>
  );
};

// トグルスイッチ
export const ToggleSwitch = ({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center gap-2">
    <label htmlFor={id} className="text-sm font-medium min-w-fit">
      {label}
    </label>
    <button
      id={id}
      onClick={onToggle}
      className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
        checked ? "bg-green-500" : "bg-gray-400"
      }`}
    >
      <div
        className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

// スライダー
export const ColumnSlider = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
    <label htmlFor="column-slider" className="text-sm font-medium min-w-fit">
      {label} {value}
    </label>
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
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>1</span>
        <span>12</span>
      </div>
    </div>
  </div>
);
