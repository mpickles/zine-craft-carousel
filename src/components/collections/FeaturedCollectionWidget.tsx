import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

interface FeaturedCollectionWidgetProps {
  userId: string;
  collectionId?: string;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
}

interface Post {
  id: string;
  post_images: Array<{
    image_url: string;
    thumbnail_url: string | null;
  }>;
}

export const FeaturedCollectionWidget = ({ userId, collectionId }: FeaturedCollectionWidgetProps) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCollection();
  }, [userId, collectionId]);

  const fetchFeaturedCollection = async () => {
    try {
      setLoading(true);

      // If no specific collectionId, get the most recent public collection
      let query = supabase
        .from("collections")
        .select("id, name, description, cover_image_url")
        .eq("user_id", userId)
        .eq("is_public", true);

      if (collectionId) {
        query = query.eq("id", collectionId);
      } else {
        query = query.order("created_at", { ascending: false }).limit(1);
      }

      const { data: collectionData, error: collectionError } = await query.maybeSingle();

      if (collectionError || !collectionData) {
        setLoading(false);
        return;
      }

      setCollection(collectionData);

      // Fetch first 6 posts in collection
      const { data: itemsData, error: itemsError } = await supabase
        .from("collection_items")
        .select(`
          posts (
            id,
            post_images (
              image_url,
              thumbnail_url
            )
          )
        `)
        .eq("collection_id", collectionData.id)
        .order("added_at", { ascending: false })
        .limit(6);

      if (itemsError) throw itemsError;

      setPosts(itemsData?.map((item: any) => item.posts) || []);
    } catch (error) {
      console.error("Error fetching featured collection:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </Card>
    );
  }

  if (!collection) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">{collection.name}</h2>
          {collection.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {collection.description}
            </p>
          )}
        </div>
        <Link
          to={`/collection/${collection.id}`}
          className="text-sm text-primary hover:underline flex items-center"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No posts in this collection yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {posts.map((post) => {
            const firstImage = post.post_images[0];
            return (
              <Link
                key={post.id}
                to={`/post/${post.id}`}
                className="aspect-square bg-muted overflow-hidden rounded-lg group"
              >
                <img
                  src={firstImage?.thumbnail_url || firstImage?.image_url}
                  alt="Post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
};