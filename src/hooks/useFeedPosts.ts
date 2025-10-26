import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const POSTS_PER_PAGE = 10;

export const useFeedPosts = () => {
  return useInfiniteQuery({
    queryKey: ["feed-posts"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

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
  });
};
