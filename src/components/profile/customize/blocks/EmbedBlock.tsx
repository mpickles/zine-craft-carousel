interface EmbedBlockProps {
  data: {
    url: string;
    embedType: string;
    width: "small" | "medium" | "large" | "full";
  };
}

export const EmbedBlock = ({ data }: EmbedBlockProps) => {
  const getEmbedUrl = (url: string, type: string) => {
    try {
      if (type === "youtube") {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      if (type === "vimeo") {
        const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
        return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
      }
      if (type === "spotify") {
        const match = url.match(/spotify\.com\/(track|album|playlist)\/([^?]+)/);
        return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : null;
      }
      if (type === "codepen") {
        const match = url.match(/codepen\.io\/([^\/]+)\/pen\/([^\/]+)/);
        return match ? `https://codepen.io/${match[1]}/embed/${match[2]}` : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const embedUrl = getEmbedUrl(data.url, data.embedType);

  if (!embedUrl) {
    return (
      <div className="p-4 border border-dashed rounded text-center">
        <p className="text-sm text-muted-foreground">
          Unable to embed this URL.{" "}
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View on {data.embedType}
          </a>
        </p>
      </div>
    );
  }

  const widthClass =
    data.width === "small"
      ? "max-w-md"
      : data.width === "medium"
      ? "max-w-2xl"
      : data.width === "large"
      ? "max-w-4xl"
      : "max-w-full";

  return (
    <div className={`${widthClass} mx-auto`}>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      </div>
    </div>
  );
};
