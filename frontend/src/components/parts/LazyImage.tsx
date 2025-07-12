import { useInView } from "react-intersection-observer";

const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <div ref={ref} className="aspect-square">
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
