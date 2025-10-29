import { ProfileBlock } from "@/hooks/useProfileBlocks";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { LinksBlock } from "./LinksBlock";
import { LatestPostsBlock } from "./LatestPostsBlock";
import { FeaturedCollectionBlock } from "./FeaturedCollectionBlock";
import { EmbedBlock } from "./EmbedBlock";
import { SpacerBlock } from "./SpacerBlock";

interface BlockRendererProps {
  block: ProfileBlock;
  userId?: string;
  isEditMode?: boolean;
}

export const BlockRenderer = ({ block, userId, isEditMode }: BlockRendererProps) => {
  // Header block has special rendering
  if (block.block_type === "header") {
    return (
      <div className="text-center space-y-4 py-8">
        {block.block_data.avatarUrl && (
          <img
            src={block.block_data.avatarUrl}
            alt={block.block_data.displayName}
            className="w-24 h-24 rounded-full mx-auto object-cover"
          />
        )}
        <h1 className="text-3xl font-bold">{block.block_data.displayName}</h1>
        {block.block_data.bio && (
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {block.block_data.bio}
          </p>
        )}
      </div>
    );
  }

  switch (block.block_type) {
    case "text":
      return <TextBlock data={block.block_data} />;
    case "image":
      return <ImageBlock data={block.block_data} />;
    case "links":
      return <LinksBlock data={block.block_data} />;
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
