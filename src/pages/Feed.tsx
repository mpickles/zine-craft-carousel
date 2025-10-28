import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/PostCard";
import { useFeedPosts } from "@/hooks/useFeedPosts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PostViewerModal } from "@/components/post/PostViewerModal";
import { usePostNavigation } from "@/hooks/usePostNavigation";
import { AnimatePresence } from "framer-motion";

const Feed = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const postIdParam = searchParams.get("post");
  const [activePostId, setActivePostId] = useState<string | null>(postIdParam);
  
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeedPosts();
  const observerTarget = useRef<HTMLDivElement>(null);

  const { adjacentPostIds } = usePostNavigation({
    context: "feed",
    currentPostId: activePostId || "",
  });

  // Update activePostId when URL param changes
  useEffect(() => {
    setActivePostId(postIdParam);
  }, [postIdParam]);

  const handleOpenModal = (postId: string) => {
    setActivePostId(postId);
    setSearchParams({ post: postId }, { replace: false });
  };

  const handleCloseModal = () => {
    setActivePostId(null);
    setSearchParams({}, { replace: false });
  };

  const handleNavigatePost = (postId: string) => {
    setActivePostId(postId);
    setSearchParams({ post: postId }, { replace: false });
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Your Feed</h2>

          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && allPosts.length === 0 && (
            <div className="bg-card border border-border rounded-lg p-12 text-center space-y-4">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold">Your feed is empty!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Follow creators to see their posts here
              </p>
              <Button onClick={() => navigate("/explore")} size="lg">
                Explore
              </Button>
            </div>
          )}

          {allPosts.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              {allPosts.map((post: any) => (
                <PostCard key={post.id} post={post} onOpenModal={handleOpenModal} />
              ))}

              {/* Infinite scroll trigger */}
              <div ref={observerTarget} className="py-4">
                {isFetchingNextPage && (
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Post Viewer Modal */}
      <AnimatePresence>
        {activePostId && (
          <PostViewerModal
            postId={activePostId}
            onClose={handleCloseModal}
            context="feed"
            onNavigate={handleNavigatePost}
            adjacentPostIds={adjacentPostIds}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Feed;
