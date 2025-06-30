import { Item, OriginalImage, Tags } from "../api/model";

export interface ImageData {
  id: string;
  thumbnail: string | null;
}

export interface OriginalImageData {
  id: string;
  image: string | null;
  error?: string;
}

export interface TagsData {
  historyTags: string[];
  starredTags: string[];
}

export interface FolderInfo {
  id: string;
  name: string;
  children: FolderInfo[];
  parent: string | null;
  folder_image: [string, string];
}

export interface AppContextType {
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
  includeSensitive: boolean;
  setIncludeSensitive: React.Dispatch<React.SetStateAction<boolean>>;
  onlyFavorite: boolean;
  setOnlyFavorite: React.Dispatch<React.SetStateAction<boolean>>;
  // From useOriginalImage
  selectedImage: OriginalImage | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<OriginalImage | null>>;
  openModal: (image: Item) => Promise<void>;
  closeModal: () => void;

  // From useTags
  tags: Tags[] | null;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
}
