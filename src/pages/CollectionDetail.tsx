import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Lock, Globe, Share2, Settings, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import { PostViewerModal } from "@/components/post/PostViewerModal";
import { AnimatePresence } from "framer-motion";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  user_id: string;
  updated_at: string;
  profiles: {
    username: string;
    display_name: string | null;
  };
}

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    searchParams.get("post")
  );

  const isOwner = user?.id === collection?.user_id;
  const POSTS_PER_PAGE = 30;

  const allPostIds = posts.map((p) => p.id);
  const currentPostIndex = selectedPostId ? allPostIds.indexOf(selectedPostId) : -1;
  const adjacentPostIds = {
    prev: currentPostIndex > 0 ? allPostIds[currentPostIndex - 1] : null,
    next: currentPostIndex < allPostIds.length - 1 ? allPostIds[currentPostIndex + 1] : null,
  };

  useEffect(() => {
    if (id) {
      fetchCollection();
    }
  }, [id]);

  const fetchCollection = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Fetch collection details (only on initial load)
      if (!loadMore) {
        const { data: collectionData, error: collectionError } = await supabase
          .from("collections")
          .select(`
            *,
            profiles:user_id (username, display_name)
          `)
          .eq("id", id)
          .single();

        if (collectionError) throw collectionError;
        setCollection(collectionData);
      }

      // Fetch posts in collection with pagination
      const from = loadMore ? posts.length : 0;
      const to = from + POSTS_PER_PAGE - 1;

      const { data: itemsData, error: itemsError } = await supabase
        .from("collection_items")
        .select(`
          post_id,
          posts (
            id,
            caption,
            created_at,
            post_images (
              id,
              image_url,
              thumbnail_url,
              order_index
            )
          )
        `)
        .eq("collection_id", id)
        .order("added_at", { ascending: false })
        .range(from, to);

      if (itemsError) throw itemsError;

      const newPosts = itemsData?.map((item: any) => item.posts) || [];
      
      if (loadMore) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(newPosts.length === POSTS_PER_PAGE);
    } catch (error: any) {
      console.error("Error fetching collection:", error);
      toast.error("Failed to load collection");
      if (!loadMore) {
        navigate("/feed");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchCollection(true);
    }
  };

  const handleEditCollection = async (data: {
    name: string;
    description: string;
    isPublic: boolean;
  }) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("collections")
        .update({
          name: data.name,
          description: data.description || null,
          is_public: data.isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Collection updated!");
      setShowEditDialog(false);
      fetchCollection(); // Refresh collection data
    } catch (error: any) {
      toast.error(error.message || "Failed to update collection");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: collection?.name,
        text: collection?.description || "Check out this collection!",
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!collection) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Collection Header */}
          <Card className="p-8 mb-8">
            <div className="flex gap-8">
              {/* Cover Image */}
              <div className="w-64 h-64 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                {collection.cover_image_url ? (
                  <img
                    src={collection.cover_image_url}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl">📁</div>
                  </div>
                )}
              </div>

              {/* Collection Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{collection.name}</h1>
                    {collection.description && (
                      <p className="text-muted-foreground text-lg mb-4">
                        {collection.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEditDialog(true)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="font-medium">{posts.length} posts</span>
                  <span className="flex items-center gap-1">
                    {collection.is_public ? (
                      <>
                        <Globe className="w-4 h-4" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Private
                      </>
                    )}
                  </span>
                  <span>
                    By{" "}
                    <Link
                      to={`/profile/${collection.profiles.username}`}
                      className="hover:underline font-medium"
                    >
                      @{collection.profiles.username}
                    </Link>
                  </span>
                  <span>
                    Updated{" "}
                    {formatDistanceToNow(new Date(collection.updated_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                {isOwner
                  ? "Save posts to this collection to see them here"
                  : "This collection is empty"}
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                {posts.map((post: any) => {
                  const firstImage = post.post_images.sort(
                    (a: any, b: any) => a.order_index - b.order_index
                  )[0];
                  const slideCount = post.post_images.length;

                  return (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedPostId(post.id);
                        setSearchParams({ post: post.id }, { replace: false });
                      }}
                      className="relative aspect-square bg-muted overflow-hidden group cursor-pointer"
                    >
                      <img
                        src={firstImage?.thumbnail_url || firstImage?.image_url}
                        alt="Post"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      {slideCount > 1 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          {slideCount}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </Link>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedPostId && (
          <PostViewerModal
            postId={selectedPostId}
            onClose={() => {
              setSelectedPostId(null);
              setSearchParams({}, { replace: false });
            }}
            context="profile"
            onNavigate={(postId) => {
              setSelectedPostId(postId);
              setSearchParams({ post: postId }, { replace: false });
            }}
            adjacentPostIds={adjacentPostIds}
          />
        )}
      </AnimatePresence>

      <EditCollectionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        collection={collection}
        onSubmit={handleEditCollection}
        saving={saving}
      />
    </div>
  );
};

export default CollectionDetail;
