import React from "react";
import Controls from "./Controls";
import { SidebarUi } from "./ui/SidebarUi";
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
          <Controls />
        </SidebarUi>
      )}
    </>
  );
};

export default Sidebar;
