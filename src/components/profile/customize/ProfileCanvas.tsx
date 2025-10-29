import { ProfileSection, ProfileBlock, ProfileTheme } from "@/hooks/useProfileCustomization";
import { BlockRenderer } from "./blocks/BlockRenderer";

interface ProfileCanvasProps {
  sections: ProfileSection[];
  blocks: ProfileBlock[];
  theme?: ProfileTheme | null;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  onSelectSection: (id: string) => void;
  onSelectBlock: (id: string) => void;
}

export const ProfileCanvas = ({
  sections,
  blocks,
  theme,
  selectedSectionId,
  selectedBlockId,
  onSelectSection,
  onSelectBlock,
}: ProfileCanvasProps) => {
  const getPaddingClass = (size: string) => {
    switch (size) {
      case "small":
        return "py-8 px-4";
      case "large":
        return "py-20 px-8";
      default:
        return "py-12 px-6";
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto py-8"
      style={{
        fontFamily: theme?.font_body || "Inter",
      }}
    >
      {sections.map((section) => {
        const sectionBlocks = blocks.filter((b) => b.section_id === section.id);

        return (
          <div
            key={section.id}
            className={`transition-all ${
              selectedSectionId === section.id
                ? "ring-2 ring-primary ring-offset-4"
                : "hover:ring-2 hover:ring-primary/50 hover:ring-offset-2"
            } ${getPaddingClass(section.padding_size)}`}
            style={{
              backgroundColor: section.background_color,
              backgroundImage: section.background_image_url
                ? `url(${section.background_image_url})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectSection(section.id);
            }}
          >
            <div className="max-w-3xl mx-auto space-y-6">
              {sectionBlocks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">Empty section - Click to add blocks</p>
                </div>
              ) : (
                sectionBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={`transition-all ${
                      selectedBlockId === block.id
                        ? "ring-2 ring-accent ring-offset-2"
                        : "hover:ring-2 hover:ring-accent/50 hover:ring-offset-1"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBlock(block.id);
                    }}
                  >
                    <BlockRenderer block={block} theme={theme} />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
