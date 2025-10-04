import { useEffect, useMemo, useState } from "react";
import { OriginalImage } from "../api/model";

interface UseImageTransformProps {
  selectedImage:  OriginalImage | null; // 画像が変更されたときのリセット用
}

export const useImageTransform = ({ selectedImage }: UseImageTransformProps) => {
  const [isFlippedH, setIsFlippedH] = useState(false); // 水平反転状態を管理
  const [isFlippedV, setIsFlippedV] = useState(false); // 垂直反転状態を管理
  const [rotationDegree, setRotationDegree] = useState(0); // 回転角度を管理

  // 画像が変更されたときに反転・回転状態をリセット
  useEffect(() => {
    setIsFlippedH(false);
    setIsFlippedV(false);
    setRotationDegree(0);
  }, [selectedImage]);

  // 反転機能のハンドラー
  const handleFlipHorizontal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsFlippedH((prev) => !prev);
  };

  const handleFlipVertical = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsFlippedV((prev) => !prev);
  };

  // 回転機能のハンドラー
  const handleRotateRight = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setRotationDegree((prev) => (prev + 90) % 360);
  };

  const handleRotateLeft = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setRotationDegree((prev) => (prev - 90 + 360) % 360);
  };

  // 変形をリセットする機能
  const handleResetTransform = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsFlippedH(false);
    setIsFlippedV(false);
    setRotationDegree(0);
  };

  // 画像の変形スタイルを計算（touchStateの移動は含まない）
  const calculateImageTransform = (dragX = 0, dragY = 0) => {
    const transforms = [];
    
    // スワイプによる移動
    if (dragX !== 0 || dragY !== 0) {
      transforms.push(`translate(${dragX}px, ${dragY}px)`);
    }
    
    // 回転
    if (rotationDegree !== 0) {
      transforms.push(`rotate(${rotationDegree}deg)`);
    }
    
    // 反転
    const scaleX = isFlippedH ? -1 : 1;
    const scaleY = isFlippedV ? -1 : 1;
    if (scaleX !== 1 || scaleY !== 1) {
      transforms.push(`scale(${scaleX}, ${scaleY})`);
    }
    
    return transforms.length > 0 ? transforms.join(' ') : 'none';
  };

  // 何らかの変形が適用されているかどうか
  const hasTransform = useMemo(() => {
    return isFlippedH || isFlippedV || rotationDegree !== 0;
  }, [isFlippedH, isFlippedV, rotationDegree]);

  // キーボードショートカット用の処理関数
  const handleKeyboardTransform = (key: string) => {
    switch (key) {
      case "f":
      case "F":
        setIsFlippedH((prev) => !prev);
        break;
      case "v":
      case "V":
        setIsFlippedV((prev) => !prev);
        break;
      case "r":
      case "R":
        setRotationDegree((prev) => (prev + 90) % 360);
        break;
      case "l":
      case "L":
        setRotationDegree((prev) => (prev - 90 + 360) % 360);
        break;
      case "0":
        setIsFlippedH(false);
        setIsFlippedV(false);
        setRotationDegree(0);
        break;
    }
  };

  return {
    // 状態
    isFlippedH,
    isFlippedV,
    rotationDegree,
    hasTransform,
    
    // ハンドラー
    handleFlipHorizontal,
    handleFlipVertical,
    handleRotateRight,
    handleRotateLeft,
    handleResetTransform,
    handleKeyboardTransform,
    
    // ユーティリティ
    calculateImageTransform,
  };
};