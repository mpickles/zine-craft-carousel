import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LikeData {
  count: number;
  isLiked: boolean;
}

export const useLikes = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch like count and user's like status
  const { data, isLoading } = useQuery({
    queryKey: ["likes", postId],
    queryFn: async (): Promise<LikeData> => {
      // Get total like count
      const { count, error: countError } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      if (countError) throw countError;

      // Check if current user has liked
      let isLiked = false;
      if (user) {
        const { data: likeData } = await supabase
          .from("likes")
          .select("user_id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();

        isLiked = !!likeData;
      }

      return { count: count || 0, isLiked };
    },
  });

  // Toggle like mutation
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in to like");

      const currentData = data || { count: 0, isLiked: false };

      if (currentData.isLiked) {
        // Unlike
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
      }
    },
    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["likes", postId] });

      const previousData = queryClient.getQueryData<LikeData>(["likes", postId]);

      if (previousData) {
        queryClient.setQueryData<LikeData>(["likes", postId], {
          count: previousData.isLiked ? previousData.count - 1 : previousData.count + 1,
          isLiked: !previousData.isLiked,
        });
      }

      return { previousData };
    },
    onError: (error: any, _, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["likes", postId], context.previousData);
      }
      toast.error(error.message || "Failed to update like");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["likes", postId] });
    },
  });

  return {
    likeCount: data?.count || 0,
    isLiked: data?.isLiked || false,
    isLoading,
    toggleLike: toggleLike.mutate,
  };
};
