import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import useFolders from "../hooks/useFolders";
import { useOriginalImage } from "../hooks/useOriginalImage";
import useTags from "../hooks/useTags";
import { useThumbnailImages } from "../hooks/useThumbnailImages";
import { AppContextType } from "../types";

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
  }, [
    tagState.selectedTag,
    thumbnailImagesState.includeSensitive,
    thumbnailImagesState.onlyFavorite,
  ]);

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
