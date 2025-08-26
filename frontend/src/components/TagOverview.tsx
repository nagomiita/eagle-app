import React, { useEffect, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import {
  HeartIcon,
  EyeSlashIcon,
  TagIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  EyeSlashIcon as EyeSlashSolidIcon,
} from "@heroicons/react/24/solid";
import { useTagToggle } from "../hooks/useTags";

const TagOverview: React.FC = () => {
  const { selectedTag, tags, setSelectedTag } = useAppContext();
  const { tagSettings, setTagSettings, toggleTagSetting } = useTagToggle();
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {}
  );
  const [openGenres, setOpenGenres] = useState<Record<string, boolean>>({});
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "favorite" | "sensitive"
  >("all");

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };
  const toggleGenre = (genre: string) => {
    setOpenGenres((prev) => ({
      ...prev,
      [genre]: !prev[genre],
    }));
  };
  useEffect(() => {
    if (!tags) return;

    const initialSettings: Record<
      string,
      { isFavorite: boolean; isSensitive: boolean }
    > = {};

    tags.forEach((tag) => {
      const key = String(tag.tag_id);
      initialSettings[key] = {
        isFavorite: tag.is_favorite ?? false,
        isSensitive: tag.is_sensitive ?? false,
      };
    });

    setTagSettings(initialSettings);
  }, [tags]);

  // フィルタリング済みタグ
  const filteredTags = (tags ?? []).filter((tag) => {
    const key = String(tag.tag_id);
    const settings = tagSettings[key];

    // 検索クエリフィルター
    if (
      searchQuery &&
      !tag.tag_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // カテゴリフィルター
    if (selectedFilter === "favorite" && !settings?.isFavorite) return false;
    if (selectedFilter === "sensitive" && !settings?.isSensitive) return false;

    return true;
  });

  // グループ化
  const grouped = filteredTags.reduce((acc, tag) => {
    const category = tag.category || "未分類";
    const genre = tag.genre || "未分類";

    if (!acc[category]) acc[category] = {};
    if (!acc[category][genre]) acc[category][genre] = [];

    acc[category][genre].push(tag);
    return acc;
  }, {} as Record<string, Record<string, typeof tags>>);

  // 統計情報
  const stats = {
    total: tags?.length || 0,
    favorites: Object.values(tagSettings).filter((s) => s.isFavorite).length,
    sensitive: Object.values(tagSettings).filter((s) => s.isSensitive).length,
    categories: Object.keys(grouped).length,
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl text-white max-h-[85vh] flex flex-col">
      {/* ヘッダー */}
      <div className="p-2 border-b border-gray-700/50">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <TagIcon className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            タグ管理
          </h2>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-gray-800/50 rounded-lg p-2 backdrop-blur-sm">
            <div className="text-lg font-bold text-blue-400">{stats.total}</div>
            <div className="text-xs text-gray-400">総タグ数</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 backdrop-blur-sm">
            <div className="text-lg font-bold text-pink-400">
              {stats.favorites}
            </div>
            <div className="text-xs text-gray-400">お気に入り</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 backdrop-blur-sm">
            <div className="text-lg font-bold text-red-400">
              {stats.sensitive}
            </div>
            <div className="text-xs text-gray-400">センシティブ</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 backdrop-blur-sm">
            <div className="text-lg font-bold text-green-400">
              {stats.categories}
            </div>
            <div className="text-xs text-gray-400">カテゴリ</div>
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="タグを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/70 border border-gray-600 rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <TagIcon className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedFilter === "all"
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setSelectedFilter("favorite")}
              className={`px-2 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                selectedFilter === "favorite"
                  ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <HeartIcon className="w-3 h-3" />
              <span className="hidden sm:inline">お気に入り</span>
            </button>
            <button
              onClick={() => setSelectedFilter("sensitive")}
              className={`px-2 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                selectedFilter === "sensitive"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <EyeSlashIcon className="w-3 h-3" />
              <span className="hidden sm:inline">センシティブ</span>
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-2 space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12">
            <FunnelIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              条件に一致するタグがありません
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, genres]) => (
            <div
              key={category}
              className="bg-gray-800/30 rounded-xl p-2 backdrop-blur-sm border border-gray-700/30"
            >
              <h3
                className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2 cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{category}</span>
                <span className="ml-auto text-sm text-gray-400">
                  {openCategories[category] ? "▲" : "▼"}
                </span>
              </h3>

              {openCategories[category] && (
                <div className="space-y-4">
                  {Object.entries(genres).map(([genre, genreTags]) => (
                    <div key={genre}>
                      <h4
                        className="text-lg font-semibold text-green-300 mb-3 flex items-center gap-2 cursor-pointer"
                        onClick={() => toggleGenre(genre)}
                      >
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="break-words">{genre}</span>
                        <span className="ml-auto text-sm text-gray-400">
                          {openGenres[genre] ? "▲" : "▼"}
                        </span>
                      </h4>

                      {openGenres[genre] && (
                        <div className="space-y-2">
                          {[...(genreTags ?? [])]
                            .sort(
                              (a, b) =>
                                (b.usage_count ?? 0) - (a.usage_count ?? 0)
                            ) // 使用数の多い順にソート
                            .map((tag) => {
                              const key = String(tag.tag_id);
                              const settings = tagSettings[key] || {
                                isFavorite: false,
                                isSensitive: false,
                              };

                              return (
                                <div
                                  key={tag.tag_id}
                                  onClick={() => {
                                    if (selectedTag === String(tag.tag_id)) {
                                      setSelectedTag(""); // または null
                                    } else {
                                      setSelectedTag(String(tag.tag_id));
                                    }
                                  }}
                                  className={`group rounded-lg p-3 transition-all duration-200 border ${
                                    selectedTag === String(tag.tag_id)
                                      ? "bg-blue-700 border-blue-500"
                                      : "bg-gray-700/50 hover:bg-gray-700/80 border-gray-600/30 hover:border-gray-500/50"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <span className="font-medium text-gray-200 group-hover:text-white transition-colors text-sm leading-tight break-words flex-1 min-w-0">
                                      {tag.tag_name}
                                      {tag.usage_count
                                        ? ` (${tag.usage_count})`
                                        : ""}
                                    </span>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <button
                                        onClick={() =>
                                          toggleTagSetting(
                                            tag.tag_id,
                                            "isFavorite"
                                          )
                                        }
                                        className={`p-1 rounded-full transition-all ${
                                          settings.isFavorite
                                            ? "bg-pink-500/20 text-pink-400 hover:bg-pink-500/30"
                                            : "text-gray-500 hover:text-pink-400 hover:bg-pink-500/10"
                                        }`}
                                        title="お気に入りに追加"
                                      >
                                        {settings.isFavorite ? (
                                          <HeartSolidIcon className="w-3 h-3" />
                                        ) : (
                                          <HeartIcon className="w-3 h-3" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          toggleTagSetting(
                                            tag.tag_id,
                                            "isSensitive"
                                          )
                                        }
                                        className={`p-1 rounded-full transition-all ${
                                          settings.isSensitive
                                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                            : "text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                                        }`}
                                        title="センシティブに設定"
                                      >
                                        {settings.isSensitive ? (
                                          <EyeSlashSolidIcon className="w-3 h-3" />
                                        ) : (
                                          <EyeSlashIcon className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {(settings.isFavorite ||
                                    settings.isSensitive) && (
                                    <div className="flex gap-1 flex-wrap">
                                      {settings.isFavorite && (
                                        <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 text-xs rounded-full">
                                          お気に入り
                                        </span>
                                      )}
                                      {settings.isSensitive && (
                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full">
                                          センシティブ
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TagOverview;
