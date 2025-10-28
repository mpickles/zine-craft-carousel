import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  post_count: number;
}

interface CollectionsGridProps {
  userId: string;
  isOwnProfile: boolean;
  onCreateClick?: () => void;
}

export const CollectionsGrid = ({ userId, isOwnProfile, onCreateClick }: CollectionsGridProps) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, [userId]);

  const fetchCollections = async () => {
    try {
      setLoading(true);

      // Get collections with post counts
      const { data, error } = await supabase
        .from("collections")
        .select(`
          id,
          name,
          description,
          cover_image_url,
          is_public,
          collection_items (count)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const collectionsWithCounts = data?.map((col: any) => ({
        ...col,
        post_count: col.collection_items?.[0]?.count || 0,
        collection_items: undefined,
      })) || [];

      setCollections(collectionsWithCounts);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-[3/2] rounded-lg" />
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="col-span-3 text-center py-16 bg-muted/30 rounded-lg">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
        {isOwnProfile && (
          <>
            <p className="text-muted-foreground mb-4">
              Create collections to organize your posts
            </p>
            <Button onClick={onCreateClick}>
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {isOwnProfile && (
        <Card
          className="aspect-[3/2] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors border-dashed"
          onClick={onCreateClick}
        >
          <Plus className="w-8 h-8 mb-2 text-muted-foreground" />
          <span className="text-sm font-medium">New Collection</span>
        </Card>
      )}

      {collections.map((collection) => (
        <Link key={collection.id} to={`/collection/${collection.id}`}>
          <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
            <div className="aspect-[3/2] bg-muted relative">
              {collection.cover_image_url ? (
                <img
                  src={collection.cover_image_url}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-4xl">📁</div>
                </div>
              )}
              {!collection.is_public && (
                <div className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full">
                  <Lock className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm mb-1 truncate">
                {collection.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {collection.post_count} {collection.post_count === 1 ? "post" : "posts"}
              </p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
