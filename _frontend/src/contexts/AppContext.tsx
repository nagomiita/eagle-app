import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import useFolders from "../hooks/useFolders";
import useImages from "../hooks/useImages";
import useTags from "../hooks/useTags";
import { FolderInfo, ImageData, OriginalImageData, TagsData } from "../types";

interface AppContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // From useFolders
  folders: FolderInfo[];
  currentFolder: FolderInfo | null;
  folderId: string;
  setFolderId: (id: string) => void;
  handleFolderClick: (folder: FolderInfo) => void;
  handleBackClick: () => void;

  // From useImages
  images: ImageData[];
  setImages: React.Dispatch<React.SetStateAction<ImageData[]>>;
  selectedImage: OriginalImageData | null;
  setSelectedImage: React.Dispatch<
    React.SetStateAction<OriginalImageData | null>
  >;
  isLoading: boolean;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  columnCount: number;
  setColumnCount: React.Dispatch<React.SetStateAction<number>>;
  fetchImages: (folderId: string, selectedTag: string) => Promise<void>;
  openModal: (image: ImageData) => Promise<void>;
  closeModal: () => void;

  // From useTags
  tags: TagsData;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const folderState = useFolders();
  const imageState = useImages();
  const tagState = useTags();

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    imageState.fetchImages(folderState.folderId, tagState.selectedTag);
  }, [folderState.folderId, tagState.selectedTag, imageState.limit]);

  const value: AppContextType = {
    isDarkMode,
    toggleDarkMode,
    ...folderState,
    ...imageState,
    ...tagState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
