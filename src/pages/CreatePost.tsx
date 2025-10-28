import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader } from "@/components/create/ImageUploader";
import { SlideEditor } from "@/components/create/SlideEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export interface Slide {
  id: string;
  file: File;
  preview: string;
  caption: string;
  altText: string;
  template: "image-full" | "image-note" | "quote" | "side-by-side";
  order: number;
}

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [caption, setCaption] = useState("");
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Auto-save draft to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      if (slides.length > 0 || caption) {
        localStorage.setItem(
          "post-draft",
          JSON.stringify({
            caption,
            isAiGenerated,
            isPrivate,
            slideCount: slides.length,
          })
        );
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [slides, caption, isAiGenerated, isPrivate]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("post-draft");
    if (draft) {
      const parsed = JSON.parse(draft);
      setCaption(parsed.caption || "");
      setIsAiGenerated(parsed.isAiGenerated || false);
      setIsPrivate(parsed.isPrivate || false);
    }
  }, []);

  const handlePublish = async () => {
    if (!user) {
      toast.error("Please log in to create posts");
      return;
    }

    if (slides.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setPublishing(true);

    try {
      // Create post record
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          caption: caption || null,
          is_private: isPrivate,
          is_ai_generated: isAiGenerated,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Upload images and create slide records
      const slidePromises = slides.map(async (slide, index) => {
        // Upload image
        const fileExt = slide.file.name.split(".").pop();
        const fileName = `${user.id}/${post.id}/${Date.now()}-${index}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("posts")
          .upload(fileName, slide.file, { upsert: false });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts").getPublicUrl(fileName);

        // Create slide record
        return supabase.from("post_images").insert({
          post_id: post.id,
          image_url: publicUrl,
          order_index: index,
          caption: slide.caption || null,
          alt_text: slide.altText || null,
          template: slide.template,
        });
      });

      await Promise.all(slidePromises);

      // Clear draft
      localStorage.removeItem("post-draft");

      toast.success("Post published!");
      
      // Get user's username to navigate to profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profile?.username) {
        navigate(`/profile/${profile.username}`);
      } else {
        navigate("/feed");
      }
    } catch (error: any) {
      console.error("Error publishing post:", error);
      toast.error(error.message || "Failed to publish post");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Create Post</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>

          {/* Image Upload */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Images</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Add 1-12 images to create your carousel. Drag to reorder.
            </p>
            <ImageUploader slides={slides} onSlidesChange={setSlides} />
          </Card>

          {/* Slide Editor */}
          {slides.length > 0 && (
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Edit Slides</h2>
              <SlideEditor slides={slides} onSlidesChange={setSlides} />
            </Card>
          )}

          {/* Post Settings */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Post Details</h2>

            <div className="space-y-4">
              {/* Main Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption for your post..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={1000}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {caption.length}/1000
                </p>
              </div>

              {/* AI Generated */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ai-generated"
                  checked={isAiGenerated}
                  onCheckedChange={(checked) => setIsAiGenerated(!!checked)}
                />
                <Label
                  htmlFor="ai-generated"
                  className="text-sm font-normal cursor-pointer"
                >
                  This content is AI-generated
                </Label>
              </div>

              {/* Privacy */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="private"
                  checked={isPrivate}
                  onCheckedChange={(checked) => setIsPrivate(!!checked)}
                />
                <Label htmlFor="private" className="text-sm font-normal cursor-pointer">
                  Followers only (private)
                </Label>
              </div>
            </div>
          </Card>

          {/* Publish Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Discard this draft?")) {
                  localStorage.removeItem("post-draft");
                  navigate(-1);
                }
              }}
            >
              Discard
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishing || slides.length === 0}
              size="lg"
            >
              {publishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Post"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePost;
