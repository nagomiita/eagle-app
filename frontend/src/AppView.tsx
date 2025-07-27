import Header from "./components/Header";
import ImageGallery from "./components/ImageGallery";

function AppView() {
  return (
    <div className={"min-h-screendark bg-gray-900 text-white"}>
      <div className="max-w-8xl mx-auto p-1">
        <div className="sticky top-0 z-50 bg-gray-900">
          <Header />
        </div>
        <div className="p-2">
          <ImageGallery />
        </div>
      </div>
    </div>
  );
}

export default AppView;
