import { useEffect, useRef, useState } from "react";

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  srcSet?: {
    webp?: string;
    avif?: string;
    jpeg?: string;
  };
  eager?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className = "",
  sizes = "100vw",
  srcSet,
  eager = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(eager);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (eager) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [eager]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <picture>
      {isInView && srcSet?.avif && (
        <source type="image/avif" srcSet={srcSet.avif} sizes={sizes} />
      )}
      {isInView && srcSet?.webp && (
        <source type="image/webp" srcSet={srcSet.webp} sizes={sizes} />
      )}
      {isInView && srcSet?.jpeg && (
        <source type="image/jpeg" srcSet={srcSet.jpeg} sizes={sizes} />
      )}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        className={`${className} ${
          isLoaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
        loading={eager ? "eager" : "lazy"}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          ...(hasError ? { display: "none" } : {}),
        }}
      />
    </picture>
  );
}
