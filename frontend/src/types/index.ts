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

  // Folders
  folders: FolderInfo[];
  currentFolder: FolderInfo | null;
  folderId: string;
  setFolderId: (id: string) => void;
  handleFolderClick: (folder: FolderInfo) => void;
  handleBackClick: () => void;

  // Images
  images: ImageData[];
  selectedImage: OriginalImageData | null;
  setSelectedImage: (image: OriginalImageData | null) => void;
  isLoading: boolean;
  limit: number;
  setLimit: (limit: number) => void;
  openModal: (image: ImageData) => Promise<void>;
  closeModal: () => void;

  // Tags
  tags: TagsData;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;

  // Layout
  columnCount: number;
  setColumnCount: (count: number) => void;
}

export interface AppProviderProps {
  children: React.ReactNode;
}
