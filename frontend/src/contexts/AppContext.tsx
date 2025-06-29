import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Item, OriginalImage } from "../api/model";
import useFolders from "../hooks/useFolders";
import { useOriginalImage } from "../hooks/useOriginalImage";
import useTags from "../hooks/useTags";
import { useThumbnailImages } from "../hooks/useThumbnailImages";
import { FolderInfo, TagsData } from "../types";
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

  // From useThumbnailImages
  images: Item[];
  setImages: React.Dispatch<React.SetStateAction<Item[]>>;
  isLoading: boolean;
  columnCount: number;
  setColumnCount: React.Dispatch<React.SetStateAction<number>>;
  fetchImages: (selectedTag: string) => Promise<void>;
  // From useOriginalImage
  selectedImage: OriginalImage | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<OriginalImage | null>>;
  openModal: (image: Item) => Promise<void>;
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
  const thumbnailImagesState = useThumbnailImages();
  const OriginalImageState = useOriginalImage();
  const tagState = useTags();

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    thumbnailImagesState.fetchImages(tagState.selectedTag);
  }, [tagState.selectedTag]);

  const value: AppContextType = {
    isDarkMode,
    toggleDarkMode,
    ...folderState,
    ...thumbnailImagesState,
    ...OriginalImageState,
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
