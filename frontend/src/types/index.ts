import { ThumbnailImage, OriginalImage, Tag, FolderInfo } from "../api/model";

export interface AppContextType {
  // From useThumbnailImages
  images: ThumbnailImage[];
  setImages: React.Dispatch<React.SetStateAction<ThumbnailImage[]>>;
  excludeInFolder: boolean;
  setExcludeInFolder: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  columnCount: number;
  setColumnCount: React.Dispatch<React.SetStateAction<number>>;
  fetchImages: (selectedTag: string) => Promise<void>;
  includeSensitive: boolean;
  setIncludeSensitive: React.Dispatch<React.SetStateAction<boolean>>;
  onlyFavorite: boolean;
  setOnlyFavorite: React.Dispatch<React.SetStateAction<boolean>>;
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
  fetchFolders: () => Promise<void>;
}
