import { ProfileBlock, ProfileTheme } from "@/hooks/useProfileCustomization";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { LinksBlock } from "./LinksBlock";

interface BlockRendererProps {
  block: ProfileBlock;
  theme?: ProfileTheme | null;
}

export const BlockRenderer = ({ block, theme }: BlockRendererProps) => {
  switch (block.block_type) {
    case "text":
      return <TextBlock data={block.block_data} theme={theme} />;
    case "image":
      return <ImageBlock data={block.block_data} />;
    case "links":
      return <LinksBlock data={block.block_data} theme={theme} />;
    default:
      return (
        <div className="p-4 border border-dashed rounded">
          <p className="text-sm text-muted-foreground">
            Unknown block type: {block.block_type}
          </p>
        </div>
      );
  }
};
