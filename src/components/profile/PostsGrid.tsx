import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUserPosts } from "@/hooks/useUserPosts";
import { Button } from "@/components/ui/button";

interface PostsGridProps {
  userId: string;
  isOwnProfile: boolean;
  onCreateClick: () => void;
}

export const PostsGrid = ({ userId, isOwnProfile, onCreateClick }: PostsGridProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useUserPosts(userId);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allPosts.length === 0) {
    return (
      <div className="col-span-3 text-center py-16 bg-muted/30 rounded-lg">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
        {isOwnProfile && (
          <>
            <p className="text-muted-foreground mb-4">
              Share your first post to get started
            </p>
            <Button onClick={onCreateClick}>Create Post</Button>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {allPosts.map((post: any) => {
          const firstImage = post.post_images.sort(
            (a: any, b: any) => a.order_index - b.order_index
          )[0];
          const slideCount = post.post_images.length;

          return (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
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

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="col-span-3 py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </>
  );
};
