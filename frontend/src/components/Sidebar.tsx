import React from "react";
import Controls from "./Controls";
import { SidebarUi } from "./parts/SidebarUi";
import TagOverview from "./TagOverview";
import { useAppContext } from "../contexts/AppContext";
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { showTagOverview } = useAppContext();
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
          {showTagOverview ? <TagOverview /> : <Controls />}
        </SidebarUi>
      )}
    </>
  );
};

export default Sidebar;
