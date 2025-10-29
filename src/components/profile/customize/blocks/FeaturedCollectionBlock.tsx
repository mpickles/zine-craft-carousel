import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface FeaturedCollectionBlockProps {
  data: {
    collectionId: string;
    postCount: number;
    showName: boolean;
    showDescription: boolean;
  };
}

export const FeaturedCollectionBlock = ({ data }: FeaturedCollectionBlockProps) => {
  const navigate = useNavigate();

  const { data: collection, isLoading } = useQuery({
    queryKey: ["featured-collection-block", data.collectionId],
    queryFn: async () => {
      const { data: collectionData, error } = await supabase
        .from("collections")
        .select("*")
        .eq("id", data.collectionId)
        .single();

      if (error) throw error;
      return collectionData;
    },
    enabled: !!data.collectionId,
  });

  const { data: posts } = useQuery({
    queryKey: ["collection-posts", data.collectionId, data.postCount],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from("collection_items")
        .select(
          `
          post_id,
          posts (
            id,
            post_images (
              id,
              image_url,
              thumbnail_url,
              caption,
              order_index
            )
          )
        `
        )
        .eq("collection_id", data.collectionId)
        .order("added_at", { ascending: false })
        .limit(data.postCount);

      if (error) throw error;
      return items?.map((item: any) => item.posts) || [];
    },
    enabled: !!data.collectionId,
  });

  if (isLoading) {
    return <div className="h-48 bg-muted animate-pulse rounded" />;
  }

  if (!collection) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Collection not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.showName && (
        <h3
          className="text-2xl font-bold cursor-pointer hover:underline"
          onClick={() => navigate(`/collection/${collection.id}`)}
        >
          {collection.name}
        </h3>
      )}
      {data.showDescription && collection.description && (
        <p className="text-muted-foreground">{collection.description}</p>
      )}

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {posts.map((post: any) => {
            const firstImage = post.post_images?.[0];
            return (
              <div
                key={post.id}
                className="group cursor-pointer"
                onClick={() => navigate(`?post=${post.id}`)}
              >
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <img
                    src={firstImage?.thumbnail_url || firstImage?.image_url}
                    alt={firstImage?.caption || "Post"}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">This collection is empty</p>
        </Card>
      )}
    </div>
  );
};
