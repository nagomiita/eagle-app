import { ThumbnailImage, OriginalImage, Tag } from "../api/model";

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
  // From useThumbnailImages
  images: ThumbnailImage[];
  setImages: React.Dispatch<React.SetStateAction<ThumbnailImage[]>>;
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
  openModal: (image: string) => Promise<void>;
  closeModal: () => void;

  // From useTags
  tags: Tag[] | null;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
}
