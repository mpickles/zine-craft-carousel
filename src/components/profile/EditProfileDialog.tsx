import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Upload, X, Link as LinkIcon } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_private: boolean;
}

interface ProfileLink {
  label: string;
  url: string;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

export const EditProfileDialog = ({
  open,
  onOpenChange,
  profile,
  onProfileUpdate,
}: EditProfileDialogProps) => {
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [links, setLinks] = useState<ProfileLink[]>([{ label: "", url: "" }]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const addLink = () => {
    if (links.length < 5) {
      setLinks([...links, { label: "", url: "" }]);
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("posts")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("posts")
        .getPublicUrl(filePath);

      // Generate optimized avatar URL (200x200)
      const optimizedUrl = `${publicUrl}?width=200&height=200&quality=80&format=webp`;
      setAvatarUrl(optimizedUrl);
      toast.success("Avatar uploaded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName || null,
          bio: bio || null,
          avatar_url: avatarUrl || null,
        })
        .eq("id", profile.id);

      if (error) throw error;

      onProfileUpdate({
        ...profile,
        display_name: displayName || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and avatar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {getInitials(displayName || profile.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
              <Label htmlFor="avatar-upload">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Avatar"}
                  </span>
                </Button>
              </Label>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/500
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Links (up to 5)</Label>
              {links.length < 5 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addLink}
                >
                  <LinkIcon className="w-4 h-4 mr-1" />
                  Add Link
                </Button>
              )}
            </div>
            {links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateLink(index, "label", e.target.value)}
                  maxLength={20}
                />
                <Input
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updateLink(index, "url", e.target.value)}
                  type="url"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLink(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Username (read-only) */}
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={`@${profile.username}`} disabled />
            <p className="text-xs text-muted-foreground">
              Username cannot be changed
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
