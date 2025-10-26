import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Feed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Your Feed</h2>
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Your feed is empty. Start following creators to see their posts here.
            </p>
            <Button onClick={() => navigate("/explore")}>Explore</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feed;
