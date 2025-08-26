import { useEffect, useState } from "react";
import { Tag } from "../api/model";
import { fetchTranslatedTags, toggleTagFlag } from "../api/tags/tags";
export const useTags = () => {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetchTranslatedTags();
        setTags(response);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, []);

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
  };

  return {
    tags,
    selectedTag,
    setSelectedTag: handleTagChange,
  };
};

export const useTagToggle = () => {
  const [tagSettings, setTagSettings] = useState<
    Record<string, { isFavorite: boolean; isSensitive: boolean }>
  >({});

  const toggleTagSetting = async (
    tagId: number,
    key: "isFavorite" | "isSensitive"
  ) => {
    const id = String(tagId);
    const prevValue = tagSettings[id]?.[key] ?? false;
    const nextValue = !prevValue;
    try {
      await toggleTagFlag(tagId, {
        flag: key === "isFavorite" ? "favorite" : "sensitive",
        value: nextValue,
      });
      setTagSettings((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          [key]: nextValue,
        },
      }));
    } catch (error) {
      console.error("Failed to toggle tag setting:", error);
      // エラー時は状態を変更しない
    }
  };

  return { tagSettings, setTagSettings, toggleTagSetting };
};
