import { useState, useEffect } from "react";
import axios from "axios";
import { TagsData } from "../types";

const useTags = () => {
  const [tags, setTags] = useState<TagsData>({
    historyTags: [],
    starredTags: [],
  });
  const [selectedTag, setSelectedTag] = useState<string>("");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(
          "http://192.168.11.11:8000/api/tags/list"
        );
        setTags(response.data);
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
