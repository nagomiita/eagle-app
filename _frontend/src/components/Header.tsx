import React from "react";
import { useAppContext } from "../contexts/AppContext";

const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useAppContext();

  return (
    <div className="flex justify-between items-center mb-5">
      <h1 className="text-2xl font-bold">Image Gallery</h1>
      <button
        onClick={toggleDarkMode}
        className={`px-4 py-2 rounded ${
          isDarkMode ? "bg-white text-black" : "bg-gray-800 text-white"
        }`}
      >
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </button>
    </div>
  );
};

export default Header;
