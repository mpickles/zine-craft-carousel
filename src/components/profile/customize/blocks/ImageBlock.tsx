interface ImageBlockProps {
  data: {
    imageUrl: string;
    altText: string;
    caption?: string;
    size?: string;
    borderRadius?: number;
  };
}

export const ImageBlock = ({ data }: ImageBlockProps) => {
  if (!data.imageUrl) {
    return (
      <div className="p-8 border border-dashed rounded text-center">
        <p className="text-sm text-muted-foreground">No image selected</p>
      </div>
    );
  }

  const sizeClass =
    data.size === "small"
      ? "max-w-sm"
      : data.size === "large"
      ? "max-w-4xl"
      : "max-w-2xl";

  return (
    <figure className={`${sizeClass} mx-auto`}>
      <img
        src={data.imageUrl}
        alt={data.altText || ""}
        className="w-full h-auto"
        style={{
          borderRadius: data.borderRadius ? `${data.borderRadius}px` : "8px",
        }}
      />
      {data.caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
};
