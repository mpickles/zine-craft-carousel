import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExplorePosts } from "@/hooks/useExplorePosts";
import { TrendingUp, Shuffle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PostViewerModal } from "@/components/post/PostViewerModal";
import { usePostNavigation } from "@/hooks/usePostNavigation";
import { AnimatePresence } from "framer-motion";
import { TrendingGrid } from "@/components/explore/TrendingGrid";
import { RandomFeed } from "@/components/explore/RandomFeed";

type ExploreMode = "trending" | "random";

const Explore = () => {
  const [mode, setMode] = useState<ExploreMode>("trending");
  const [searchParams, setSearchParams] = useSearchParams();
  const postIdParam = searchParams.get("post");
  const [activePostId, setActivePostId] = useState<string | null>(postIdParam);
  
  const { data: posts = [], isLoading } = useExplorePosts(mode);

  const { adjacentPostIds } = usePostNavigation({
    context: "explore",
    currentPostId: activePostId || "",
  });

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

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-text-primary mb-3">
            Explore
          </h1>
          <p className="text-base sm:text-lg text-text-secondary font-primary">
            Discover amazing content from creators around the world
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 sm:mb-12 border-b border-border-light">
          <button
            onClick={() => setMode("trending")}
            className={`pb-3 px-6 font-primary text-sm font-medium uppercase tracking-wide transition-all duration-150 ${
              mode === "trending"
                ? "border-b-2 border-brand-accent text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline-block mr-2 mb-0.5" />
            Trending
          </button>
          <button
            onClick={() => setMode("random")}
            className={`pb-3 px-6 font-primary text-sm font-medium uppercase tracking-wide transition-all duration-150 ${
              mode === "random"
                ? "border-b-2 border-brand-accent text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Shuffle className="w-4 h-4 inline-block mr-2 mb-0.5" />
            Random
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton mode={mode} />
        ) : posts.length === 0 ? (
          <EmptyState message={mode === "trending" ? "No trending posts yet" : "No posts to discover yet"} />
        ) : (
          <>
            {mode === "trending" && <TrendingGrid posts={posts} onOpenModal={handleOpenModal} />}
            {mode === "random" && <RandomFeed posts={posts} onOpenModal={handleOpenModal} />}
          </>
        )}
      </main>

      {/* Post Viewer Modal */}
      <AnimatePresence>
        {activePostId && (
          <PostViewerModal
            postId={activePostId}
            onClose={handleCloseModal}
            context="explore"
            onNavigate={handleNavigatePost}
            adjacentPostIds={adjacentPostIds}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const LoadingSkeleton = ({ mode }: { mode: ExploreMode }) => {
  if (mode === "trending") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-square">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="aspect-square w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <Card className="p-12 text-center">
    <p className="text-muted-foreground">{message}</p>
  </Card>
);

export default Explore;
