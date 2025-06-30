import { useEffect, useState } from "react";
import { Tag } from "../api/model";
import { fetchTranslatedTags } from "../api/default/default";

const useTags = () => {
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

export default useTags;
