import { useState } from "react";
import { fetchAllFolders } from "../api/default/default";
import { FolderInfo } from "../api/model";

export const useFolder = () => {
  const [showFolders, setShowFolders] = useState<boolean>(false);
  const [folders, setFolders] = useState<FolderInfo[]>([]);

  const fetchFolders = async (includeSensitive: boolean) => {
    try {
      const folders = await fetchAllFolders({
        include_sensitive: includeSensitive,
      });
      setFolders(folders);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  return {
    showFolders,
    setShowFolders,
    folders,
    setFolders,
    fetchFolders,
  };
};
