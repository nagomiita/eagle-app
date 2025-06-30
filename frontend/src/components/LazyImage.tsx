import { useInView } from "react-intersection-observer";

const LazyImage = ({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick: () => void;
}) => {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <div ref={ref} className="aspect-square">
      {inView && (
        <img
          src={src}
          alt={alt}
          onClick={onClick}
          className="w-full h-full object-cover cursor-pointer rounded"
        />
      )}
    </div>
  );
};
export default LazyImage;
