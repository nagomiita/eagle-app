import React from "react";
import {
  HeartIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/solid";

type ActionType = "favorite" | "delete" | "options";
type PositionType = "bottom-right" | "bottom-left" | "top-right" | "top-left";

interface ActionButtonProps {
  type: ActionType;
  isActive?: boolean;
  position?: PositionType;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  type,
  isActive = false,
  position = "bottom-right",
  onClick,
}) => {
  const positionClassMap: Record<PositionType, string> = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  const positionClass = positionClassMap[position];
  const baseClass =
    "absolute rounded-full p-3 shadow-lg z-50 transition-colors";

  const bgClass =
    type === "favorite"
      ? isActive
        ? "bg-pink-500 hover:bg-pink-600"
        : "bg-gray-500 hover:bg-gray-600"
      : type === "delete"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-gray-800 hover:bg-gray-700";

  const icon =
    type === "favorite" ? (
      <HeartIcon
        className={`h-6 w-6 transition-colors ${
          isActive ? "text-white" : "text-gray-200"
        }`}
      />
    ) : type === "delete" ? (
      <TrashIcon className="h-6 w-6 text-white" />
    ) : (
      <AdjustmentsHorizontalIcon className="h-6 w-6 text-white" />
    );

  // 削除ボタンを非アクティブにするかどうか
  const isDisabled = type === "delete" && isActive;

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${positionClass} ${bgClass} ${
        isDisabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={isDisabled}
    >
      {icon}
    </button>
  );
};

export default ActionButton;
