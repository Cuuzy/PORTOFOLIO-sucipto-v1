import { useEffect, useRef, useState } from "react";

export interface ImageSource {
  webp?: string;
  avif?: string;
  jpeg?: string;
}

export interface ResponsiveImageProps {
  baseFileName: string;
  alt: string;
  className?: string;
  sizes?: string;
  eager?: boolean;
  aspectRatio?: string;
  variants?: {
    [key: string]: ImageSource;
  };
  onLoad?: () => void;
  onError?: () => void;
}

export function ResponsiveImage({
  baseFileName,
  alt,
  className = "",
  sizes = "100vw",
  eager = false,
  aspectRatio,
  variants,
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(eager);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        rootMargin: "100px",
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
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

  const buildSrcSet = (format: "webp" | "avif" | "jpeg") => {
    if (!variants) return undefined;

    const widths = {
      xs: 320,
      sm: 640,
      md: 1024,
      lg: 1920,
      xl: 3840,
    };

    return Object.entries(variants)
      .filter(([key]) => key !== "original")
      .map(([key, sources]) => {
        const url = sources[format];
        const width = widths[key as keyof typeof widths];
        return url && width ? `${url} ${width}w` : null;
      })
      .filter(Boolean)
      .join(", ");
  };

  const defaultSrc =
    variants?.original?.webp || variants?.original?.jpeg || "";

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      )}
      {isInView && (
        <picture>
          {variants && (
            <>
              <source
                type="image/avif"
                srcSet={buildSrcSet("avif")}
                sizes={sizes}
              />
              <source
                type="image/webp"
                srcSet={buildSrcSet("webp")}
                sizes={sizes}
              />
              <source
                type="image/jpeg"
                srcSet={buildSrcSet("jpeg")}
                sizes={sizes}
              />
            </>
          )}
          <img
            src={defaultSrc}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading={eager ? "eager" : "lazy"}
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <span className="text-gray-400 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
}
