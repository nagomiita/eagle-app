import { useAppContext } from "./contexts/AppContext";
import Header from "./components/Header";
import FolderList from "./components/FolderList";
import Controls from "./components/Controls";
import ImageGrid from "./components/ImageGrid";
import ImageModal from "./components/ImageModal";

function AppView() {
  const { isDarkMode } = useAppContext();

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto p-5">
        <Header />
        <FolderList />
        <Controls />
        <ImageGrid />
        <ImageModal />
      </div>
    </div>
  );
}

export default AppView;
