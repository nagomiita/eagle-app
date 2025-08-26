import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

interface FolderHeaderProps {
  folderName: string;
  isEditMode: boolean;
  onBack: () => void;
  onToggleEditMode: () => void;
}

export const FolderHeader: React.FC<FolderHeaderProps> = ({
  folderName,
  isEditMode,
  onBack,
  onToggleEditMode,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <button
        onClick={onBack}
        className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-all"
        title="フォルダー一覧へ戻る"
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </button>
      <h2 className="text-lg font-bold text-white">📁 {folderName}</h2>
    </div>
    {!isEditMode && (
      <button
        onClick={onToggleEditMode}
        className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
      >
        ✏️ フォルダ編集
      </button>
    )}
  </div>
);
