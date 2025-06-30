import { useEffect, useState } from "react";
import { Tags } from "../api/model";
import { getTags } from "../api/default/default";

const useTags = () => {
  const [tags, setTags] = useState<Tags[] | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await getTags();
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
