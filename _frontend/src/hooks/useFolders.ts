import { useState, useEffect } from "react";
import axios from "axios";
import { FolderInfo } from "../types";

const useFolders = () => {
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderInfo | null>(null);
  const [folderId, setFolderId] = useState<string>("");

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await axios.get(
          "http://192.168.11.11:8000/api/folder/list"
        );
        setFolders(response.data);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    fetchFolders();
  }, []);

  const findFolderById = (
    folderList: FolderInfo[],
    id: string
  ): FolderInfo | null => {
    for (const folder of folderList) {
      if (folder.id === id) return folder;
      const found = findFolderById(folder.children, id);
      if (found) return found;
    }
    return null;
  };

  const handleFolderClick = (folder: FolderInfo) => {
    setCurrentFolder(folder);
    setFolderId(folder.id);
  };

  const handleBackClick = () => {
    if (currentFolder && currentFolder.parent) {
      const parentFolder = findFolderById(folders, currentFolder.parent);
      setCurrentFolder(parentFolder);
      setFolderId(parentFolder ? parentFolder.id : "");
    } else {
      setCurrentFolder(null);
      setFolderId("");
    }
  };

  return {
    folders,
    currentFolder,
    folderId,
    setFolderId,
    handleFolderClick,
    handleBackClick,
  };
};

export default useFolders;
