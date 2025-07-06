import Header from "./components/Header";
import ImageGallery from "./components/ImageGallery";

function AppView() {
  return (
    <div className={"min-h-screendark bg-gray-900 text-white"}>
      <div className="max-w-8xl mx-auto p-1">
        <Header />
        <ImageGallery />
      </div>
    </div>
  );
}

export default AppView;
