import React, { useState, useEffect } from "react";
import ActionButton from "./ActionButton";

interface ScrollToTopButtonProps {
  /** スクロール量の閾値（px） - この値を超えるとボタンが表示される */
  showAfterScroll?: number;
  /** ボタンの位置 */
  position?: "bottom-right" | "bottom-left" | "bottom-center";
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  showAfterScroll = 200,
  position = "bottom-right",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > showAfterScroll) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, [showAfterScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <ActionButton
      type="scrollToTop"
      position={position}
      onClick={scrollToTop}
    />
  );
};

export default ScrollToTopButton;
