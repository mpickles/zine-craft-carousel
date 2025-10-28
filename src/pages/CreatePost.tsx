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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // IndexedDB setup
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("PostDraftsDB", 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("drafts")) {
          db.createObjectStore("drafts", { keyPath: "id" });
        }
      };
    });
  };

  // Auto-save draft to IndexedDB
  useEffect(() => {
    const interval = setInterval(async () => {
      if (slides.length > 0 || caption) {
        try {
          const db = await openDB();
          const tx = db.transaction("drafts", "readwrite");
          const store = tx.objectStore("drafts");
          
          await store.put({
            id: "current-draft",
            caption,
            isAiGenerated,
            isPrivate,
            slideCount: slides.length,
            timestamp: Date.now(),
          });
        } catch (error) {
          console.error("Failed to save draft:", error);
        }
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [slides, caption, isAiGenerated, isPrivate]);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const db = await openDB();
        const tx = db.transaction("drafts", "readonly");
        const store = tx.objectStore("drafts");
        const request = store.get("current-draft");
        
        request.onsuccess = () => {
          const draft = request.result;
          if (draft) {
            setCaption(draft.caption || "");
            setIsAiGenerated(draft.isAiGenerated || false);
            setIsPrivate(draft.isPrivate || false);
          }
        };
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    };
    
    loadDraft();
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

    // Validate all slides have alt text (accessibility requirement)
    const missingAltText = slides.some((slide) => !slide.altText?.trim());
    if (missingAltText) {
      toast.error("All images must have alt text for accessibility");
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

      toast.loading(`Uploading ${slides.length} image${slides.length > 1 ? 's' : ''}...`, { id: 'upload-progress' });

      // Upload images and create slide records with progress tracking
      const slidePromises = slides.map(async (slide, index) => {
        // Upload image
        const fileExt = slide.file.name.split(".").pop();
        const fileName = `${user.id}/${post.id}/${Date.now()}-${index}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(fileName, slide.file, { 
            upsert: false,
            contentType: slide.file.type
          });

        if (uploadError) throw uploadError;

        // Get base public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("posts").getPublicUrl(fileName);

        // Generate optimized URLs with Supabase transformations
        // Full slide: 1200px width, 85% quality, WebP format
        const fullImageUrl = `${publicUrl}?width=1200&quality=85&format=webp`;
        
        // Thumbnail: 400x400px, 80% quality, WebP format
        const thumbnailUrl = `${publicUrl}?width=400&height=400&quality=80&format=webp`;

        // Create slide record with both URLs
        return supabase.from("post_images").insert({
          post_id: post.id,
          image_url: fullImageUrl,
          thumbnail_url: thumbnailUrl,
          order_index: index,
          caption: slide.caption || null,
          alt_text: slide.altText || null,
          template: slide.template,
        });
      });

      await Promise.all(slidePromises);
      
      toast.dismiss('upload-progress');

      // Clear draft from IndexedDB
      try {
        const db = await openDB();
        const tx = db.transaction("drafts", "readwrite");
        const store = tx.objectStore("drafts");
        await store.delete("current-draft");
      } catch (error) {
        console.error("Failed to clear draft:", error);
      }

      toast.success("Post published!");
      
      // Redirect to post viewer
      navigate(`/post/${post.id}`);
    } catch (error: any) {
      console.error("Error publishing post:", error);
      
      // User-friendly error messages
      let errorMessage = "Failed to publish post";
      
      if (error.message?.includes("storage")) {
        errorMessage = "Failed to upload images. Please check your internet connection and try again.";
      } else if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message?.includes("size")) {
        errorMessage = "One or more images are too large. Please use smaller images.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
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
            <ImageUploader 
              slides={slides} 
              onSlidesChange={setSlides}
              currentSlideIndex={currentSlideIndex}
              onSlideSelect={setCurrentSlideIndex}
            />
          </Card>

          {/* Slide Editor */}
          {slides.length > 0 && (
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Edit Slide Details</h2>
              <SlideEditor 
                slides={slides} 
                currentSlideIndex={currentSlideIndex}
                onSlidesChange={setSlides}
                onSlideIndexChange={setCurrentSlideIndex}
              />
            </Card>
          )}

          {/* Post Settings */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Post Details</h2>

            <div className="space-y-4">
              {/* Main Caption */}
              <div className="space-y-2">
              <Label htmlFor="caption">Overall caption (optional)</Label>
              <Textarea
                id="caption"
                placeholder="Add a caption for your post..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground text-right">
                {caption.length}/500
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
              onClick={async () => {
                if (confirm("Discard this draft?")) {
                  try {
                    const db = await openDB();
                    const tx = db.transaction("drafts", "readwrite");
                    const store = tx.objectStore("drafts");
                    await store.delete("current-draft");
                  } catch (error) {
                    console.error("Failed to clear draft:", error);
                  }
                  navigate(-1);
                }
              }}
            >
              Discard
            </Button>
            <div className="flex flex-col items-end gap-2">
              {slides.length > 0 && slides.some(s => !s.altText?.trim()) && (
                <p className="text-xs text-muted-foreground">
                  All images need alt text before publishing
                </p>
              )}
              <Button
                onClick={handlePublish}
                disabled={publishing || slides.length === 0 || slides.some(s => !s.altText?.trim())}
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
        </div>
      </main>
    </div>
  );
};

export default CreatePost;
