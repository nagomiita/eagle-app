import { useState, useEffect } from "react";
import axios from "axios";
import { TagsData } from "../types";
import { API_BASE_URL } from "../config";

const useTags = () => {
  const [tags, setTags] = useState<TagsData>({
    historyTags: [],
    starredTags: [],
  });
  const [selectedTag, setSelectedTag] = useState<string>("");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tags/list`);
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
