import { useEffect, useState } from "react";
import { Tag } from "../api/model";
import { fetchTranslatedTags, useToggleTagFlag } from "../api/default/default";
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
  const toggleMutation = useToggleTagFlag();
  const [tagSettings, setTagSettings] = useState<
    Record<string, { isFavorite: boolean; isSensitive: boolean }>
  >({});

  const toggleTagSetting = (
    tagId: number,
    key: "isFavorite" | "isSensitive"
  ) => {
    setTagSettings((prev) => {
      const id = String(tagId);
      const prevValue = prev[id]?.[key] ?? false;
      const nextValue = !prevValue;

      toggleMutation.mutate(
        {
          tagId,
          data: {
            flag: key === "isFavorite" ? "favorite" : "sensitive",
            value: nextValue,
          },
        },
        {
          onError: () => {
            // ロールバックする
            setTagSettings((prev) => ({
              ...prev,
              [id]: {
                ...prev[id],
                [key]: prevValue,
              },
            }));
          },
        }
      );

      return {
        ...prev,
        [id]: {
          ...prev[id],
          [key]: nextValue,
        },
      };
    });
  };

  return { tagSettings, setTagSettings, toggleTagSetting };
};
