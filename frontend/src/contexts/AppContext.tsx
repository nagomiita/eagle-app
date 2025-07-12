import { createContext, ReactNode, useContext, useEffect } from "react";

import { useOriginalImage, useThumbnailImages } from "../hooks/useImage";
import { useTags } from "../hooks/useTags";
import { useFolder } from "../hooks/useFolder";
import { AppContextType } from "../types";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const thumbnailImagesState = useThumbnailImages();
  const OriginalImageState = useOriginalImage();
  const tagState = useTags();
  const folderState = useFolder();

  useEffect(() => {
    thumbnailImagesState.fetchImages(tagState.selectedTag);
    folderState.fetchFolders();
  }, [
    tagState.selectedTag,
    thumbnailImagesState.includeSensitive,
    thumbnailImagesState.onlyFavorite,
  ]);

  const value: AppContextType = {
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
