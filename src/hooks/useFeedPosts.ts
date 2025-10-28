import { useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const POSTS_PER_PAGE = 20;

export const useFeedPosts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Real-time subscription for new posts
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("feed-posts-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        () => {
          // Invalidate and refetch feed when new post is created
          queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return useInfiniteQuery({
    queryKey: ["feed-posts", user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) {
        return { posts: [], nextPage: undefined };
      }

      const from = pageParam * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      // Get list of users the current user is following
      const { data: followingData, error: followingError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (followingError) throw followingError;

      const followingIds = followingData.map((f) => f.following_id);

      // If not following anyone, return empty
      if (followingIds.length === 0) {
        return { posts: [], nextPage: undefined };
      }

      // Fetch posts from followed users only
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          ),
          post_images (
            id,
            image_url,
            thumbnail_url,
            caption,
            order_index,
            template
          )
        `
        )
        .in("user_id", followingIds)
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        posts: data || [],
        nextPage: data && data.length === POSTS_PER_PAGE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!user,
  });
};
