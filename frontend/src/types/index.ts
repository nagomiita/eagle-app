import { FolderInfo, OriginalImage, Tag, ThumbnailImage } from "../api/model";

export interface AppContextType {
  aspectRatioSquare: boolean;
  setAspectRatioSquare: React.Dispatch<React.SetStateAction<boolean>>;
  // From useThumbnailImages
  images: ThumbnailImage[];
  setImages: React.Dispatch<React.SetStateAction<ThumbnailImage[]>>;
  excludeInFolder: boolean;
  setExcludeInFolder: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  columnCount: number;
  setColumnCount: React.Dispatch<React.SetStateAction<number>>;
  fetchImages: (
    selectedTag: string,
    includeSensitive: boolean
  ) => Promise<void>;
  includeSensitive: boolean;
  setIncludeSensitive: React.Dispatch<React.SetStateAction<boolean>>;
  onlyFavorite: boolean;
  setOnlyFavorite: React.Dispatch<React.SetStateAction<boolean>>;
  isShuffle: boolean;
  setIsShuffle: React.Dispatch<React.SetStateAction<boolean>>;
  // From useOriginalImage
  selectedImage: OriginalImage | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<OriginalImage | null>>;
  openModal: (image: number) => Promise<void>;
  closeModal: () => void;

  // From useTags
  tags: Tag[] | null;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;

  // From useFolder
  showFolders: boolean;
  setShowFolders: React.Dispatch<React.SetStateAction<boolean>>;
  folders: FolderInfo[];
  setFolders: React.Dispatch<React.SetStateAction<FolderInfo[]>>;
  fetchFolders: (includeSensitive: boolean) => Promise<void>;
}
