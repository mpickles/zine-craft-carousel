import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  caption: string | null;
  created_at: string;
  is_ai_generated: boolean;
  user_id: string;
  view_count: number;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  post_images: {
    id: string;
    image_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    order_index: number;
    template: string;
  }[];
}

type ExploreMode = "trending" | "new" | "random";

export const useExplorePosts = (mode: ExploreMode = "trending") => {
  return useQuery({
    queryKey: ["explore", mode],
    queryFn: async (): Promise<Post[]> => {
      let query = supabase
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
        .limit(30);

      // Apply different ordering based on mode
      if (mode === "trending") {
        // Sort by view count and recent activity
        query = query.order("view_count", { ascending: false });
      } else if (mode === "new") {
        // Sort by creation date
        query = query.order("created_at", { ascending: false });
      } else if (mode === "random") {
        // Get random posts - we'll randomize after fetching
        query = query.order("created_at", { ascending: false }).limit(50);
      }

      const { data, error } = await query;

      if (error) throw error;

      // For random mode, shuffle the results
      if (mode === "random" && data) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 30);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
