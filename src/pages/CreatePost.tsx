import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CarouselBuilder } from "@/components/create/CarouselBuilder";
import { PublishPage } from "@/components/create/PublishPage";
import type { Slide, PostDraft, TaggedUser } from "@/types/post";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const CreatePost = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Page state
  const [currentPage, setCurrentPage] = useState<'builder' | 'publish'>('builder');
  
  // Post data
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
  const [location, setLocation] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<TaggedUser[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [captionModalOpen, setCaptionModalOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // LocalStorage for draft persistence
  const DRAFT_KEY = 'zine_post_draft';
  
  const saveDraft = () => {
    // Don't save imageFile (File objects can't be serialized)
    // Only save metadata - images will be lost on page refresh
    const draftMetadata: PostDraft = {
      tags,
      isAIGenerated,
      visibility,
      location,
      taggedUsers,
      lastSaved: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftMetadata));
  };
  
  const loadDraft = (): PostDraft | null => {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };
  
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
  };
  
  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [slides, currentSlideIndex, tags, isAIGenerated, visibility, location, taggedUsers]);
  
  // Load draft metadata on mount (images can't be persisted)
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      // Only restore metadata (tags, settings, location, tagged users)
      // Images are lost on page refresh - that's expected behavior
      if (draft.tags) setTags(draft.tags);
      if (draft.isAIGenerated !== undefined) setIsAIGenerated(draft.isAIGenerated);
      if (draft.visibility) setVisibility(draft.visibility);
      if (draft.location) setLocation(draft.location);
      if (draft.taggedUsers) setTaggedUsers(draft.taggedUsers);
    }
  }, []);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to publish posts",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Upload images to Supabase Storage
      const uploadedSlides = await Promise.all(
        slides.map(async (slide) => {
          const fileName = `${Date.now()}-${slide.imageFile.name}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("posts")
            .upload(filePath, slide.imageFile);

          if (uploadError) {
            throw new Error(`Failed to upload ${slide.imageFile.name}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from("posts")
            .getPublicUrl(filePath);

          return {
            ...slide,
            uploadedUrl: publicUrl,
          };
        })
      );

      // Create post
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          caption: uploadedSlides[0].caption,
          is_private: visibility === 'followers',
          is_ai_generated: isAIGenerated,
          location: location.trim() || null,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Create post_images records
      const imageRecords = uploadedSlides.map((slide) => ({
        post_id: post.id,
        image_url: slide.uploadedUrl!,
        thumbnail_url: slide.uploadedUrl!, // In production, generate actual thumbnails
        caption: slide.caption,
        alt_text: slide.altText || null,
        order_index: slide.order,
        template: 'image-full', // Default template for new carousel posts
        fit_mode: slide.fitMode || 'contain',
        original_width: slide.originalWidth || null,
        original_height: slide.originalHeight || null,
        crop_data: slide.cropData ? JSON.parse(JSON.stringify(slide.cropData)) : null,
      }));

      const { error: imagesError } = await supabase
        .from("post_images")
        .insert(imageRecords);

      if (imagesError) throw imagesError;

      // Insert tagged users if any
      if (taggedUsers.length > 0) {
        const taggedUserRecords = taggedUsers.map((user) => ({
          post_id: post.id,
          user_id: user.id,
        }));

        const { error: taggedUsersError } = await supabase
          .from("post_tagged_users")
          .insert(taggedUserRecords);

        if (taggedUsersError) console.error("Error tagging users:", taggedUsersError);
      }

      // Clear draft
      clearDraft();

      toast({
        title: "Success!",
        description: "Your post has been published",
      });

      navigate(`/post/${post.id}`);
    } catch (error: any) {
      console.error("Error publishing post:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to publish post. Your draft is saved.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancel = () => {
    if (slides.length > 0) {
      setCancelDialogOpen(true);
    } else {
      navigate(-1);
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    navigate(-1);
  };

  return (
    <>
      {currentPage === 'builder' ? (
        <CarouselBuilder
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          onSlidesChange={setSlides}
          onCurrentSlideChange={setCurrentSlideIndex}
          onNext={() => setCurrentPage('publish')}
          onCancel={handleCancel}
          editModalOpen={editModalOpen}
          captionModalOpen={captionModalOpen}
          setEditModalOpen={setEditModalOpen}
          setCaptionModalOpen={setCaptionModalOpen}
        />
      ) : (
        <PublishPage
          slides={slides}
          tags={tags}
          isAIGenerated={isAIGenerated}
          visibility={visibility}
          location={location}
          taggedUsers={taggedUsers}
          onTagsChange={setTags}
          onAIGeneratedChange={setIsAIGenerated}
          onVisibilityChange={setVisibility}
          onLocationChange={setLocation}
          onTaggedUsersChange={setTaggedUsers}
          onBack={() => setCurrentPage('builder')}
          onPublish={handlePublish}
          isPublishing={isPublishing}
        />
      )}

      {/* Discard Draft Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard draft?</DialogTitle>
            <DialogDescription>
              Your draft will be saved automatically. You can resume editing later, or discard it permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Continue Editing
            </Button>
            <Button variant="destructive" onClick={handleDiscardDraft}>
              Discard Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePost;
