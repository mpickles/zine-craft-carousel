import { ProfileBlock } from "@/hooks/useProfileCustomization";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, X, Plus } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [localData, setLocalData] = useState(block.block_data);

  // Fetch user's collections for featured collection block
  const { data: collections } = useQuery({
    queryKey: ["user-collections", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("collections")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && block.block_type === "featured-collection",
  });

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

      case "latest-posts":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Number of posts to show</Label>
              <RadioGroup
                value={String(localData.count || 6)}
                onValueChange={(value) =>
                  setLocalData({ ...localData, count: parseInt(value) })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="count-3" />
                  <Label htmlFor="count-3" className="font-normal">3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6" id="count-6" />
                  <Label htmlFor="count-6" className="font-normal">6</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="9" id="count-9" />
                  <Label htmlFor="count-9" className="font-normal">9</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Layout</Label>
              <RadioGroup
                value={localData.layout || "grid"}
                onValueChange={(value) =>
                  setLocalData({ ...localData, layout: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="grid" id="layout-grid" />
                  <Label htmlFor="layout-grid" className="font-normal">Grid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="list" id="layout-list" />
                  <Label htmlFor="layout-list" className="font-normal">List</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-captions"
                checked={localData.showCaptions ?? true}
                onChange={(e) =>
                  setLocalData({ ...localData, showCaptions: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="show-captions" className="font-normal">Show captions</Label>
            </div>
          </div>
        );

      case "featured-collection":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Select collection</Label>
              <Select
                value={localData.collectionId || ""}
                onValueChange={(value) =>
                  setLocalData({ ...localData, collectionId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a collection..." />
                </SelectTrigger>
                <SelectContent>
                  {collections && collections.length > 0 ? (
                    collections.map((col: any) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No collections found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Number of posts to preview</Label>
              <RadioGroup
                value={String(localData.postCount || 6)}
                onValueChange={(value) =>
                  setLocalData({ ...localData, postCount: parseInt(value) })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="post-count-3" />
                  <Label htmlFor="post-count-3" className="font-normal">3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6" id="post-count-6" />
                  <Label htmlFor="post-count-6" className="font-normal">6</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="9" id="post-count-9" />
                  <Label htmlFor="post-count-9" className="font-normal">9</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-name"
                  checked={localData.showName ?? true}
                  onChange={(e) =>
                    setLocalData({ ...localData, showName: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="show-name" className="font-normal">Show collection name</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-description"
                  checked={localData.showDescription ?? true}
                  onChange={(e) =>
                    setLocalData({ ...localData, showDescription: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="show-description" className="font-normal">Show description</Label>
              </div>
            </div>
          </div>
        );

      case "embed":
        const detectEmbedType = (url: string) => {
          if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
          if (url.includes("vimeo.com")) return "vimeo";
          if (url.includes("spotify.com")) return "spotify";
          if (url.includes("soundcloud.com")) return "soundcloud";
          if (url.includes("codepen.io")) return "codepen";
          return "unknown";
        };

        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Paste URL</Label>
              <Input
                value={localData.url || ""}
                onChange={(e) => {
                  const url = e.target.value;
                  const embedType = detectEmbedType(url);
                  setLocalData({ ...localData, url, embedType });
                }}
                placeholder="https://youtube.com/watch?v=..."
              />
              {localData.embedType && localData.embedType !== "unknown" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Detected: {localData.embedType.charAt(0).toUpperCase() + localData.embedType.slice(1)}
                </p>
              )}
              {localData.embedType === "unknown" && localData.url && (
                <p className="text-xs text-destructive mt-1">
                  Unsupported URL. Supported: YouTube, Vimeo, Spotify, SoundCloud, CodePen
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Width</Label>
              <RadioGroup
                value={localData.width || "medium"}
                onValueChange={(value) =>
                  setLocalData({ ...localData, width: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="width-small" />
                  <Label htmlFor="width-small" className="font-normal">Small</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="width-medium" />
                  <Label htmlFor="width-medium" className="font-normal">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="width-large" />
                  <Label htmlFor="width-large" className="font-normal">Large</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="width-full" />
                  <Label htmlFor="width-full" className="font-normal">Full-width</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case "spacer":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Height</Label>
              <RadioGroup
                value={String(localData.height || 48)}
                onValueChange={(value) =>
                  setLocalData({ ...localData, height: parseInt(value) })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="24" id="height-24" />
                  <Label htmlFor="height-24" className="font-normal">Small (24px)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="48" id="height-48" />
                  <Label htmlFor="height-48" className="font-normal">Medium (48px)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="96" id="height-96" />
                  <Label htmlFor="height-96" className="font-normal">Large (96px)</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Custom height (px)</Label>
              <Input
                type="number"
                value={localData.height || 48}
                onChange={(e) =>
                  setLocalData({ ...localData, height: parseInt(e.target.value) || 48 })
                }
                min={1}
                max={500}
              />
            </div>
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
