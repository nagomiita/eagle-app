import React from "react";
import { SidebarUi } from "./parts/SidebarUi";
import TagOverview from "./TagOverview";
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={onClose}
        />
      )}

      {isOpen && (
        <SidebarUi onClose={onClose}>
          <TagOverview />
        </SidebarUi>
      )}
    </>
  );
};

export default Sidebar;
