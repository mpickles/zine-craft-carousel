import { ProfileSection } from "@/hooks/useProfileCustomization";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SectionEditorProps {
  section: ProfileSection;
  onUpdate: (updates: Partial<ProfileSection>) => void;
  onDelete: () => void;
  onAddBlock: (blockData: { block_type: string; block_data: any }) => void;
}

export const SectionEditor = ({
  section,
  onUpdate,
  onDelete,
  onAddBlock,
}: SectionEditorProps) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Section Settings</h3>
        {!section.is_header && (
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <Input
            type="color"
            value={section.background_color}
            onChange={(e) => onUpdate({ background_color: e.target.value })}
            className="h-10"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Padding Size</Label>
          <RadioGroup
            value={section.padding_size}
            onValueChange={(value) => onUpdate({ padding_size: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="small" />
              <Label htmlFor="small" className="font-normal">Small</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="font-normal">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="large" />
              <Label htmlFor="large" className="font-normal">Large</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Add Block</Label>
          <Select
            onValueChange={(value) => {
              let blockData = {};
              
              if (value === "text") {
                blockData = { content: "<p>New text block</p>", alignment: "left" };
              } else if (value === "image") {
                blockData = { imageUrl: "", altText: "", size: "medium" };
              } else if (value === "links") {
                blockData = { links: [] };
              } else if (value === "latest-posts") {
                blockData = { count: 6, layout: "grid", showCaptions: true };
              } else if (value === "featured-collection") {
                blockData = { collectionId: "", postCount: 6, showName: true, showDescription: true };
              } else if (value === "embed") {
                blockData = { url: "", embedType: "youtube", width: "medium" };
              } else if (value === "spacer") {
                blockData = { height: 48 };
              }
              
              onAddBlock({ block_type: value, block_data: blockData });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose block type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">📝 Text Block</SelectItem>
              <SelectItem value="image">🖼️ Image Block</SelectItem>
              <SelectItem value="latest-posts">📮 Latest Posts</SelectItem>
              <SelectItem value="featured-collection">📚 Featured Collection</SelectItem>
              <SelectItem value="links">🔗 Links Block</SelectItem>
              <SelectItem value="embed">🎬 Embed Block</SelectItem>
              <SelectItem value="spacer">⬜ Spacer Block</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
