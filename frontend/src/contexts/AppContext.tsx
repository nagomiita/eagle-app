import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { useFolder } from "../hooks/useFolder";
import { useOriginalImage, useThumbnailImages } from "../hooks/useImage";
import { useTags } from "../hooks/useTags";
import { AppContextType } from "../types";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [includeSensitive, setIncludeSensitive] = useState<boolean>(false);
  const thumbnailImagesState = useThumbnailImages();
  const OriginalImageState = useOriginalImage();
  const tagState = useTags();
  const folderState = useFolder();

  useEffect(() => {
    thumbnailImagesState.fetchImages(tagState.selectedTag, includeSensitive);
    folderState.fetchFolders(includeSensitive);
  }, [
    tagState.selectedTag,
    includeSensitive,
    thumbnailImagesState.onlyFavorite,
    thumbnailImagesState.excludeInFolder,
  ]);

  const value: AppContextType = {
    includeSensitive,
    setIncludeSensitive,
    ...thumbnailImagesState,
    ...OriginalImageState,
    ...tagState,
    ...folderState,
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
