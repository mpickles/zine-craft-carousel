import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: "square" | "video" | "auto";
}

export const OptimizedImage = ({
  src,
  alt,
  fallbackSrc,
  aspectRatio = "auto",
  className = "",
  ...props
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  }[aspectRatio];

  if (hasError) {
    return (
      <div
        className={`bg-muted flex items-center justify-center ${aspectClass} ${className}`}
      >
        <div className="text-center p-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${aspectClass} ${className}`}>
      {isLoading && (
        <Skeleton className={`absolute inset-0 ${aspectClass}`} />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (fallbackSrc && src !== fallbackSrc) {
            setHasError(false);
            setIsLoading(true);
            // Try fallback
            const img = new Image();
            img.src = fallbackSrc;
            img.onload = () => setIsLoading(false);
            img.onerror = () => setHasError(true);
          } else {
            setHasError(true);
            setIsLoading(false);
          }
        }}
        className={`${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300 ${className}`}
        {...props}
      />
    </div>
  );
};
