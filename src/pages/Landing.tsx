import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, FolderOpen, TrendingUp } from "lucide-react";
const Landing = () => {
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Zine</h1>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
          Social media without
          <span className="block text-primary mt-2">Bounds
        </span>
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A platform for creators who are tired of algorithm chaos. Share your work,
          build your space, connect with your audience.
        </p>
        <Link to="/signup">
          <Button size="lg" className="text-lg px-8 py-6">
            Get Started Free
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard icon={<Sparkles className="w-8 h-8" />} title="Per-Slide Captions" description="Add captions to each slide in your carousel. Perfect for tutorials and storytelling." />
          <FeatureCard icon={<Heart className="w-8 h-8" />} title="Customizable Profiles" description="Your space, your rules. Choose templates and themes that match your style." />
          <FeatureCard icon={<FolderOpen className="w-8 h-8" />} title="Collections" description="Organize and curate posts into collections. Share your favorite finds." />
          <FeatureCard icon={<TrendingUp className="w-8 h-8" />} title="No Algorithm" description="Reverse-chronological feed. Your followers see 100% of your posts." />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Your work matters more than your follower count
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Join creators who value authenticity over engagement bait.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Zine. Built for creators.</p>
        </div>
      </footer>
    </div>;
};
const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return <div className="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2 text-card-foreground">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>;
};
export default Landing;