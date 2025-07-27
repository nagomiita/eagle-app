import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import ThumbnailGrid from "./parts/ThumbnailGrid";
import FolderGrid from "./parts/FolderGrid";
import ImageModal from "./ImageModal";
import FolderImageEditor from "./parts/FolderImageEditor";
import { SectionDivider, SectionHeader } from "./parts/Section";
import { FolderHeader } from "./parts/FolderHeader";
import { LoadingIndicator } from "./parts/LoadingIndicator";

const ImageGrid: React.FC = () => {
  const {
    images,
    setImages,
    folders,
    setFolders,
    isLoading,
    columnCount,
    openModal,
    showFolders,
    selectedTag,
    tags,
    excludeInFolder,
  } = useAppContext();

  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  //選択されたタグをIDから名前に変換
  const selectedTagName = tags?.find(
    (tag) => tag.tag_id === Number(selectedTag)
  )?.tag_name;

  //選択されたフォルダのインデックスを取得する
  const selectedFolderIndex = folders.findIndex(
    (folder) => folder.id === selectedFolderId
  );

  // フォルダクリック時の共通処理
  const handleFolderClick = (id: number) => {
    const folder = folders.find((f) => f.id === id);
    if (folder) {
      setSelectedFolderId(folder.id);
      setIsEditMode(false);
    }
  };

  // フォルダヘッダーのハンドラー
  const handleBackToFolders = () => {
    setSelectedFolderId(null);
    setIsEditMode(false);
  };

  const handleToggleEditMode = () => {
    setIsEditMode(true);
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      {selectedFolderId ? (
        <div>
          <FolderHeader
            folderName={folders[selectedFolderIndex].name}
            isEditMode={isEditMode}
            onBack={handleBackToFolders}
            onToggleEditMode={handleToggleEditMode}
          />

          {isEditMode ? (
            <FolderImageEditor
              folderId={selectedFolderId}
              originalFolderName={folders[selectedFolderIndex].name}
              initialImages={folders[selectedFolderIndex].thumbnail_images}
              onExitEditMode={() => setIsEditMode(false)}
              setFolders={setFolders}
              columnCount={columnCount}
            />
          ) : (
            <div>
              <SectionHeader
                iconType="Folder"
                title="フォルダ内の画像"
                count={folders[selectedFolderIndex].thumbnail_images.length}
                subtitle={`${folders[selectedFolderIndex].name} フォルダの画像一覧`}
              />
              <ThumbnailGrid
                images={folders[selectedFolderIndex].thumbnail_images}
                folders={folders}
                columnCount={columnCount}
                onClick={(id) => openModal(id)}
              />

              {selectedTag && (
                <>
                  <SectionDivider />
                  <SectionHeader
                    iconType="Image"
                    title="タグで絞り込まれた画像"
                    count={images.length}
                    subtitle={`タグ "${selectedTagName}" に一致する画像`}
                  />
                  <ThumbnailGrid
                    images={images}
                    folders={folders}
                    columnCount={columnCount}
                    onClick={(id) => openModal(id)}
                    setFolders={setFolders}
                    setImages={setImages}
                  />
                </>
              )}
            </div>
          )}
        </div>
      ) : showFolders ? (
        <>
          <SectionHeader
            iconType="Folder"
            title="フォルダ一覧"
            count={folders.length}
            subtitle="画像が整理されたフォルダを表示しています"
          />
          <FolderGrid
            folders={folders}
            columnCount={columnCount}
            onClickFolder={handleFolderClick}
          />
        </>
      ) : (
        <div>
          {!selectedTag && excludeInFolder && (
            <>
              <SectionHeader
                iconType="Folder"
                title="フォルダ"
                count={folders.length}
                subtitle="整理された画像コレクション"
              />
              <FolderGrid
                folders={folders}
                columnCount={columnCount}
                onClickFolder={handleFolderClick}
              />
              <SectionDivider />
            </>
          )}

          <SectionHeader
            iconType="Image"
            title={
              !excludeInFolder
                ? "すべての画像"
                : selectedTag
                ? `タグ: ${selectedTagName}`
                : "フォルダ外の画像"
            }
            count={images.length}
            subtitle={
              !excludeInFolder
                ? "ライブラリ内のすべての画像"
                : selectedTag
                ? "タグで絞り込まれた画像一覧"
                : "ライブラリ内のフォルダ外の画像"
            }
          />
          <ThumbnailGrid
            images={images}
            folders={folders}
            columnCount={columnCount}
            onClick={(id) => openModal(id)}
            setFolders={setFolders}
            setImages={setImages}
          />
        </div>
      )}
      {selectedFolderId ? (
        <ImageModal images={folders[selectedFolderIndex].thumbnail_images} />
      ) : (
        <ImageModal images={images} />
      )}
    </>
  );
};

export default ImageGrid;
