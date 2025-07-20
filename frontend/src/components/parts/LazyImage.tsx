import { useInView } from "react-intersection-observer";

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
};

const LazyImage = ({ src, alt, className }: LazyImageProps) => {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <div ref={ref} className="aspect-square">
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover cursor-pointer rounded ${
            className ?? ""
          }`}
        />
      )}
    </div>
  );
};
export default LazyImage;
