import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import ThumbnailGrid from "./parts/ThumbnailGrid";
import FolderGrid from "./parts/FolderGrid";
import ImageModal from "./ImageModal";
import FolderImageEditor from "./FolderImageEditor";
import { SectionDivider, SectionHeader } from "./parts/Section";
import { FolderHeader } from "./parts/FolderHeader";
import { LoadingIndicator } from "./parts/LoadingIndicator";
import { deleteFolder, removeImagesFromFolder } from "../api/folders/folders";

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
    aspectRatioSquare,
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

  const handleDeleteFolder = (id: number) => {
    const folder = folders.find((f) => f.id === id);
    if (folder) {
      // 削除の確認ダイアログ
      if (window.confirm(`フォルダ「${folder.name}」を削除しますか？`)) {
        setFolders((prevFolders) => prevFolders.filter((f) => f.id !== id));
        setSelectedFolderId(null);
        deleteFolder(id)
          .then(() => {
            console.log(`Folder ${id} deleted successfully`);
          })
          .catch((error) => {
            console.error("Error deleting folder:", error);
          });
      }
    }
  };
  // フォルダ内の画像を削除する関数
  const handleRemoveFolderImage = async (imageIds: number[]) => {
    if (selectedFolderId !== null) {
      try {
        // APIを呼び出して画像を削除
        await removeImagesFromFolder(selectedFolderId, imageIds);

        // フォルダ内の画像を更新（複数のimageIdsに対応）
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === selectedFolderId
              ? {
                  ...folder,
                  thumbnail_images: folder.thumbnail_images.filter(
                    (img) => !imageIds.includes(img.id) // imageIdsの配列に含まれていない画像のみを残す
                  ),
                }
              : folder
          )
        );
      } catch (error) {
        console.error("Error removing images from folder:", error);
        throw error; // エラーを上位に伝播させる
      }
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
              onRemoveImage={handleRemoveFolderImage}
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
                aspectRatioSquare={aspectRatioSquare}
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
                    aspectRatioSquare={aspectRatioSquare}
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
            onDeleteFolder={handleDeleteFolder}
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
                onDeleteFolder={handleDeleteFolder}
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
            aspectRatioSquare={aspectRatioSquare}
          />
        </div>
      )}
      {selectedFolderId ? (
        <ImageModal
          images={folders[selectedFolderIndex].thumbnail_images}
          setFolders={setFolders}
        />
      ) : (
        <ImageModal images={images} setImages={setImages} />
      )}
    </>
  );
};

export default ImageGrid;
