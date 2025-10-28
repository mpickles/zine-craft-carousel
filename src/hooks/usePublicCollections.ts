import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePublicCollections = () => {
  return useQuery({
    queryKey: ["public-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select(
          `
          id,
          name,
          description,
          cover_image_url,
          is_public,
          updated_at,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `
        )
        .eq("is_public", true)
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get post count for each collection
      const collectionsWithCount = await Promise.all(
        (data || []).map(async (collection) => {
          const { count } = await supabase
            .from("collection_items")
            .select("*", { count: "exact", head: true })
            .eq("collection_id", collection.id);

          return {
            ...collection,
            post_count: count || 0,
          };
        })
      );

      return collectionsWithCount;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
