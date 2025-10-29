import { ProfileBlock, ProfileTheme } from "@/hooks/useProfileCustomization";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { LinksBlock } from "./LinksBlock";
import { LatestPostsBlock } from "./LatestPostsBlock";
import { FeaturedCollectionBlock } from "./FeaturedCollectionBlock";
import { EmbedBlock } from "./EmbedBlock";
import { SpacerBlock } from "./SpacerBlock";

interface BlockRendererProps {
  block: ProfileBlock;
  theme?: ProfileTheme | null;
  userId?: string;
  isEditMode?: boolean;
}

export const BlockRenderer = ({ block, theme, userId, isEditMode }: BlockRendererProps) => {
  switch (block.block_type) {
    case "text":
      return <TextBlock data={block.block_data} theme={theme} />;
    case "image":
      return <ImageBlock data={block.block_data} />;
    case "links":
      return <LinksBlock data={block.block_data} theme={theme} />;
    case "latest-posts":
      return userId ? <LatestPostsBlock userId={userId} data={block.block_data} /> : null;
    case "featured-collection":
      return <FeaturedCollectionBlock data={block.block_data} />;
    case "embed":
      return <EmbedBlock data={block.block_data} />;
    case "spacer":
      return <SpacerBlock data={block.block_data} isEditMode={isEditMode} />;
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
