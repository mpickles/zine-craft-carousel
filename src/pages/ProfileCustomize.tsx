import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useProfileBlocks, ProfileBlock } from "@/hooks/useProfileBlocks";
import { ArrowLeft, Eye, Save, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { BlockRenderer } from "@/components/profile/customize/blocks/BlockRenderer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical, Settings, Trash2 } from "lucide-react";

const ProfileCustomize = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { blocks, isLoading, saveBlocks, addBlock, deleteBlock } = useProfileBlocks(user?.id || "");
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (blocks) {
      setLayouts(
        blocks.map((block) => ({
          i: block.id,
          x: block.grid_position.x,
          y: block.grid_position.y,
          w: block.grid_position.w,
          h: block.grid_position.h,
          minW: 4,
          minH: 2,
        }))
      );
    }
  }, [blocks]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayouts(newLayout);
  };

  const handleSave = async () => {
    if (!blocks) return;

    const updatedBlocks = blocks.map((block) => {
      const layout = layouts.find((l) => l.i === block.id);
      if (!layout) return block;

      return {
        ...block,
        grid_position: {
          x: layout.x,
          y: layout.y,
          w: layout.w,
          h: layout.h,
        },
      };
    });

    await saveBlocks.mutateAsync(updatedBlocks);
  };

  const handleAddBlock = async (blockType: string) => {
    const defaultData = getDefaultBlockData(blockType);
    await addBlock.mutateAsync({
      block_type: blockType,
      block_data: defaultData,
      grid_position: { x: 0, y: (blocks?.length || 0) * 4, w: 12, h: 4 },
    });
  };

  const getDefaultBlockData = (blockType: string) => {
    switch (blockType) {
      case "text":
        return { content: "<p>Start typing...</p>", alignment: "left" };
      case "image":
        return { imageUrl: null, caption: "", altText: "" };
      case "latest-posts":
        return { count: 6, layout: "grid", showCaptions: true };
      case "links":
        return { links: [] };
      case "featured-collection":
        return { collectionId: null, postCount: 6 };
      case "embed":
        return { url: "", embedType: "", width: "medium" };
      case "spacer":
        return { height: 48 };
      default:
        return {};
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Top toolbar */}
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/profile/${user?.id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Edit Front Page</h1>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Block
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleAddBlock("text")}>
                  📝 Text Block
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddBlock("image")}>
                  🖼️ Image Block
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddBlock("latest-posts")}>
                  📮 Latest Posts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddBlock("featured-collection")}>
                  📚 Featured Collection
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddBlock("links")}>
                  🔗 Links Block
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddBlock("embed")}>
                  🎬 Embed Block
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddBlock("spacer")}>
                  ⬜ Spacer Block
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              onClick={() => window.open(`/profile/${user?.id}`, "_blank")}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={saveBlocks.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Editor */}
      <div className="container mx-auto py-8 max-w-6xl">
        <GridLayout
          className="layout"
          layout={layouts}
          cols={12}
          rowHeight={60}
          width={1200}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          compactType="vertical"
          preventCollision={false}
          draggableHandle=".drag-handle"
        >
          {blocks?.map((block) => (
            <div
              key={block.id}
              className={`bg-card border-2 rounded-lg overflow-hidden transition-all ${
                selectedBlockId === block.id
                  ? "border-primary shadow-lg"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedBlockId(block.id)}
            >
              {/* Drag handle and controls */}
              <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded p-2">
                <button className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded">
                  <GripVertical className="w-5 h-5" />
                </button>
                <div className="flex gap-1">
                  {block.block_type !== "header" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this block?")) {
                          deleteBlock.mutate(block.id);
                        }
                      }}
                      className="p-1 hover:bg-destructive/10 rounded text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Block content */}
              <div className="p-4 h-full overflow-auto">
                <BlockRenderer
                  block={block}
                  userId={user?.id}
                  isEditMode={true}
                />
              </div>
            </div>
          ))}
        </GridLayout>

        {blocks?.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">
              No blocks yet. Add your first block to get started!
            </p>
            <Button onClick={() => handleAddBlock("text")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Block
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCustomize;
