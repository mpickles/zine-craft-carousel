import { useState } from "react";
import { MoreVertical, Trash2, Lock, Unlock, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface PostOptionsMenuProps {
  postId: string;
  postUserId: string;
  isPrivate: boolean;
  caption: string | null;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export const PostOptionsMenu = ({
  postId,
  postUserId,
  isPrivate,
  caption,
  onDelete,
  onUpdate,
}: PostOptionsMenuProps) => {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedCaption, setEditedCaption] = useState(caption || "");
  const [isUpdating, setIsUpdating] = useState(false);

  // Only show menu if user is the post owner
  if (!user || user.id !== postUserId) {
    return null;
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;

      toast.success("Post deleted successfully");
      setShowDeleteDialog(false);
      onDelete?.();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleTogglePrivacy = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ is_private: !isPrivate })
        .eq("id", postId);

      if (error) throw error;

      toast.success(`Post is now ${!isPrivate ? "private" : "public"}`);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating privacy:", error);
      toast.error("Failed to update post privacy");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditCaption = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ caption: editedCaption })
        .eq("id", postId);

      if (error) throw error;

      toast.success("Caption updated successfully");
      setShowEditDialog(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating caption:", error);
      toast.error("Failed to update caption");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Caption
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleTogglePrivacy} disabled={isUpdating}>
            {isPrivate ? (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Make Public
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Make Private
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Caption Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Caption</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              placeholder="Write a caption..."
              className="min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleEditCaption} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
