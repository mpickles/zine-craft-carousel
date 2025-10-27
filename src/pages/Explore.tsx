import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostCard } from "@/components/feed/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExplorePosts } from "@/hooks/useExplorePosts";
import { TrendingUp, Clock, Shuffle } from "lucide-react";

type ExploreMode = "trending" | "new" | "random";

const Explore = () => {
  const [mode, setMode] = useState<ExploreMode>("trending");
  const { data: posts = [], isLoading } = useExplorePosts(mode);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Explore</h1>
            <p className="text-muted-foreground">
              Discover amazing content from creators around the world
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={mode} onValueChange={(value) => setMode(value as ExploreMode)}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="trending" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="new" className="gap-2">
                <Clock className="w-4 h-4" />
                New
              </TabsTrigger>
              <TabsTrigger value="random" className="gap-2">
                <Shuffle className="w-4 h-4" />
                Random
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-6">
              {isLoading ? (
                <LoadingSkeleton />
              ) : posts.length === 0 ? (
                <EmptyState message="No trending posts yet" />
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </TabsContent>

            <TabsContent value="new" className="space-y-6">
              {isLoading ? (
                <LoadingSkeleton />
              ) : posts.length === 0 ? (
                <EmptyState message="No new posts yet" />
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </TabsContent>

            <TabsContent value="random" className="space-y-6">
              {isLoading ? (
                <LoadingSkeleton />
              ) : posts.length === 0 ? (
                <EmptyState message="No posts to discover yet" />
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

const LoadingSkeleton = () => (
  <>
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
          <div className="flex gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8 ml-auto" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    ))}
  </>
);

const EmptyState = ({ message }: { message: string }) => (
  <Card className="p-12 text-center">
    <p className="text-muted-foreground">{message}</p>
  </Card>
);

export default Explore;
