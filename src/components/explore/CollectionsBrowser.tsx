import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Lock, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { usePublicCollections } from "@/hooks/usePublicCollections";

export const CollectionsBrowser = () => {
  const { data: collections, isLoading } = usePublicCollections();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl font-semibold mb-2">No public collections yet</h3>
        <p className="text-muted-foreground">
          Public collections will appear here once they are created
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {collections.map((collection) => (
        <Link key={collection.id} to={`/collection/${collection.id}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-150 cursor-pointer">
            {/* Cover Image */}
            <div className="aspect-video bg-muted overflow-hidden">
              {collection.cover_image_url ? (
                <img
                  src={collection.cover_image_url}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-5xl">📁</div>
                </div>
              )}
            </div>

            {/* Collection Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                {collection.name}
              </h3>
              {collection.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {collection.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={collection.profiles.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {collection.profiles.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">@{collection.profiles.username}</span>
                </div>
                <span>{collection.post_count} posts</span>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {collection.is_public ? (
                    <>
                      <Globe className="w-3 h-3" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      Private
                    </>
                  )}
                </span>
                <span>
                  {formatDistanceToNow(new Date(collection.updated_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
