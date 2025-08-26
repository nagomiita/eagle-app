import { useInView } from "react-intersection-observer";

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
  aspectRatioSquare?: boolean;
};

const LazyImage = ({
  src,
  alt,
  className,
  aspectRatioSquare = true,
}: LazyImageProps) => {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <div
      ref={ref}
      className={
        aspectRatioSquare ? `aspect-square ${className ?? ""}` : className ?? ""
      }
    >
      {inView && (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover cursor-pointer rounded"
        />
      )}
    </div>
  );
};
export default LazyImage;
