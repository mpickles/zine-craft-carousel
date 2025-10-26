import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
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
        .eq("id", postId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Post not found");

      return data;
    },
  });
};
