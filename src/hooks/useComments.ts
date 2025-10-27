import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  post_id: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useComments = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Real-time subscription for new comments
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          // Fetch the full comment with profile data
          const { data: newComment } = await supabase
            .from("comments")
            .select(
              `
              *,
              profiles:user_id (
                username,
                display_name,
                avatar_url
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (newComment) {
            queryClient.setQueryData<Comment[]>(["comments", postId], (old = []) => [
              ...old,
              newComment,
            ]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          const { data: updatedComment } = await supabase
            .from("comments")
            .select(
              `
              *,
              profiles:user_id (
                username,
                display_name,
                avatar_url
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (updatedComment) {
            queryClient.setQueryData<Comment[]>(["comments", postId], (old = []) =>
              old.map((c) => (c.id === updatedComment.id ? updatedComment : c))
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          queryClient.setQueryData<Comment[]>(["comments", postId], (old = []) =>
            old.filter((c) => c.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  // Post comment mutation
  const postComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Must be logged in to comment");

      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content,
      });

      if (error) throw error;
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post comment");
    },
  });

  // Update comment mutation
  const updateComment = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("comments")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update comment");
    },
  });

  // Delete comment mutation
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  return {
    comments,
    isLoading,
    postComment: postComment.mutate,
    updateComment: updateComment.mutate,
    deleteComment: deleteComment.mutate,
  };
};
