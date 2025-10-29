import { ProfileBlock } from "@/hooks/useProfileCustomization";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, X, Plus } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

interface BlockEditorProps {
  block: ProfileBlock;
  onUpdate: (updates: Partial<ProfileBlock>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const BlockEditor = ({
  block,
  onUpdate,
  onDelete,
  onClose,
}: BlockEditorProps) => {
  const [localData, setLocalData] = useState(block.block_data);

  const handleSave = () => {
    onUpdate({ block_data: localData });
  };

  const renderEditor = () => {
    switch (block.block_type) {
      case "text":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Content</Label>
              <Textarea
                value={localData.content || ""}
                onChange={(e) =>
                  setLocalData({ ...localData, content: e.target.value })
                }
                placeholder="Enter text content..."
                rows={6}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Alignment</Label>
              <RadioGroup
                value={localData.alignment || "left"}
                onValueChange={(value) =>
                  setLocalData({ ...localData, alignment: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="left" id="left" />
                  <Label htmlFor="left" className="font-normal">Left</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="center" id="center" />
                  <Label htmlFor="center" className="font-normal">Center</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="right" id="right" />
                  <Label htmlFor="right" className="font-normal">Right</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Image URL</Label>
              <Input
                value={localData.imageUrl || ""}
                onChange={(e) =>
                  setLocalData({ ...localData, imageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Alt Text</Label>
              <Input
                value={localData.altText || ""}
                onChange={(e) =>
                  setLocalData({ ...localData, altText: e.target.value })
                }
                placeholder="Describe the image..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Caption (optional)</Label>
              <Input
                value={localData.caption || ""}
                onChange={(e) =>
                  setLocalData({ ...localData, caption: e.target.value })
                }
                placeholder="Image caption..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Size</Label>
              <RadioGroup
                value={localData.size || "medium"}
                onValueChange={(value) =>
                  setLocalData({ ...localData, size: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="size-small" />
                  <Label htmlFor="size-small" className="font-normal">Small</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="size-medium" />
                  <Label htmlFor="size-medium" className="font-normal">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="size-large" />
                  <Label htmlFor="size-large" className="font-normal">Large</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case "links":
        const links = localData.links || [];
        return (
          <div className="space-y-4">
            <Label className="text-xs text-muted-foreground">Links</Label>
            {links.map((link: any, index: number) => (
              <div key={index} className="space-y-2 p-3 border rounded">
                <Input
                  value={link.label || ""}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index] = { ...link, label: e.target.value };
                    setLocalData({ ...localData, links: newLinks });
                  }}
                  placeholder="Link label"
                />
                <Input
                  value={link.url || ""}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index] = { ...link, url: e.target.value };
                    setLocalData({ ...localData, links: newLinks });
                  }}
                  placeholder="https://..."
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newLinks = links.filter((_: any, i: number) => i !== index);
                    setLocalData({ ...localData, links: newLinks });
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setLocalData({
                  ...localData,
                  links: [...links, { label: "", url: "", icon: "link" }],
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>
        );

      default:
        return <p className="text-sm text-muted-foreground">Unknown block type</p>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">{block.block_type} Block</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {renderEditor()}

      <Button className="w-full" onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
};
