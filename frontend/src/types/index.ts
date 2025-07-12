import { ThumbnailImage, OriginalImage, Tag } from "../api/model";

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
  openModal: (image: number) => Promise<void>;
  closeModal: () => void;

  // From useTags
  tags: Tag[] | null;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  showTagOverview: boolean;
  setShowTagOverview: React.Dispatch<React.SetStateAction<boolean>>;
}
