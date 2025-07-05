import Header from "./components/Header";
import ImageGrid from "./components/ImageGrid";
import ImageModal from "./components/ImageModal";

function AppView() {
  return (
    <div className={"min-h-screendark bg-gray-900 text-white"}>
      <div className="max-w-8xl mx-auto p-1">
        <Header />
        <ImageGrid />
        <ImageModal />
      </div>
    </div>
  );
}

export default AppView;
