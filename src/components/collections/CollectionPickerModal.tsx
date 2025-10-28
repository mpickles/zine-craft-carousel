import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CreateCollectionDialog } from "./CreateCollectionDialog";

interface Collection {
  id: string;
  name: string;
  post_count: number;
  contains_post: boolean;
}

interface CollectionPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onSaveStatusChange?: (isSaved: boolean) => void;
}

export const CollectionPickerModal = ({
  open,
  onOpenChange,
  postId,
  onSaveStatusChange,
}: CollectionPickerModalProps) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchCollections();
    }
  }, [open, user, postId]);

  const fetchCollections = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get all user's collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select(`
          id,
          name,
          collection_items (count)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (collectionsError) throw collectionsError;

      // Check which collections contain this post
      const { data: itemsData, error: itemsError } = await supabase
        .from("collection_items")
        .select("collection_id")
        .eq("post_id", postId);

      if (itemsError) throw itemsError;

      const containingCollections = new Set(itemsData?.map((item) => item.collection_id));

      const collectionsWithStatus = collectionsData?.map((col: any) => ({
        id: col.id,
        name: col.name,
        post_count: col.collection_items?.[0]?.count || 0,
        contains_post: containingCollections.has(col.id),
      })) || [];

      setCollections(collectionsWithStatus);
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = async (collectionId: string, currentlyContains: boolean) => {
    if (!user) return;

    try {
      if (currentlyContains) {
        // Remove from collection
        const { error } = await supabase
          .from("collection_items")
          .delete()
          .eq("collection_id", collectionId)
          .eq("post_id", postId);

        if (error) throw error;
        toast.success("Removed from collection");
      } else {
        // Add to collection
        const { error } = await supabase
          .from("collection_items")
          .insert({
            collection_id: collectionId,
            post_id: postId,
          });

        if (error) throw error;
        toast.success("Added to collection");
      }

      // Update local state
      setCollections((prev) =>
        prev.map((col) =>
          col.id === collectionId
            ? { ...col, contains_post: !currentlyContains }
            : col
        )
      );

      // Update save status in parent
      const hasAnySave = collections.some(
        (col) => col.id === collectionId ? !currentlyContains : col.contains_post
      );
      onSaveStatusChange?.(hasAnySave);
    } catch (error: any) {
      toast.error(error.message || "Failed to update collection");
    }
  };

  const handleCreateCollection = async (name: string, description: string, isPublic: boolean) => {
    if (!user) return;

    try {
      setSaving(true);

      // Create collection
      const { data: newCollection, error: createError } = await supabase
        .from("collections")
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          is_public: isPublic,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Auto-add current post to new collection
      const { error: addError } = await supabase
        .from("collection_items")
        .insert({
          collection_id: newCollection.id,
          post_id: postId,
        });

      if (addError) throw addError;

      toast.success("Collection created!");
      setShowCreateDialog(false);
      fetchCollections(); // Refresh list
    } catch (error: any) {
      toast.error(error.message || "Failed to create collection");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save to Collection</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* New Collection Button */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Button>

            {/* Collections List */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No collections yet</p>
                <p className="text-sm">Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleCollection(collection.id, collection.contains_post)}
                  >
                    <Checkbox
                      checked={collection.contains_post}
                      onCheckedChange={() =>
                        toggleCollection(collection.id, collection.contains_post)
                      }
                    />
                    <div className="flex-1">
                      <p className="font-medium">{collection.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {collection.post_count} {collection.post_count === 1 ? "post" : "posts"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateCollectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateCollection}
        saving={saving}
      />
    </>
  );
};
