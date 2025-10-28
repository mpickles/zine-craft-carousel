import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const POSTS_PER_PAGE = 12;

export const useUserPosts = (userId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: ["user-posts", userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) {
        return { posts: [], nextPage: undefined };
      }

      const from = pageParam * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id,
          caption,
          is_ai_generated,
          created_at,
          post_images (
            id,
            image_url,
            thumbnail_url,
            order_index
          )
        `
        )
        .eq("user_id", userId)
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
    enabled: !!userId,
  });
};
