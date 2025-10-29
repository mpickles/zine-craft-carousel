import { ProfileTheme } from "@/hooks/useProfileCustomization";

interface TextBlockProps {
  data: {
    content: string;
    alignment?: string;
    textColor?: string;
  };
  theme?: ProfileTheme | null;
}

export const TextBlock = ({ data, theme }: TextBlockProps) => {
  const textAlign = data.alignment || "left";
  const color = data.textColor || theme?.color_primary || "#000000";

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
