import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface LatestPostsBlockProps {
  userId: string;
  data: {
    count: number;
    layout: "grid" | "list";
    showCaptions: boolean;
  };
}

export const LatestPostsBlock = ({ userId, data }: LatestPostsBlockProps) => {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useQuery({
    queryKey: ["latest-posts-block", userId, data.count],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select(
          `
          id,
          caption,
          post_images (
            id,
            image_url,
            thumbnail_url,
            caption,
            order_index
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(data.count);

      if (error) throw error;
      return postsData || [];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: data.count }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">No posts yet.</p>
      </Card>
    );
  }

  const gridCols = data.layout === "grid" ? "grid-cols-3" : "grid-cols-1";

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {posts.map((post: any) => {
        const firstImage = post.post_images?.[0];
        const imageCount = post.post_images?.length || 0;

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
              {imageCount > 1 && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  1/{imageCount}
                </div>
              )}
            </div>
            {data.showCaptions && firstImage?.caption && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {firstImage.caption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
