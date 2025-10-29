interface TextBlockProps {
  data: {
    content: string;
    alignment?: string;
    textColor?: string;
  };
}

export const TextBlock = ({ data }: TextBlockProps) => {
  const textAlign = data.alignment || "left";
  const color = data.textColor || "#000000";

  return (
    <div
      className="prose max-w-none"
      style={{
        textAlign: textAlign as any,
        color,
      }}
      dangerouslySetInnerHTML={{ __html: data.content || "" }}
    />
  );
};
