import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface FrontPageProps {
  userId: string;
  template?: "minimal" | "magazine" | "portfolio";
  bio?: string;
  links?: Array<{ label: string; url: string }>;
}

export const FrontPage = ({ 
  userId, 
  template = "minimal", 
  bio, 
  links 
}: FrontPageProps) => {
  return (
    <div className="space-y-6">
      {/* Bio Section */}
      {bio && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="whitespace-pre-wrap text-muted-foreground">{bio}</p>
        </Card>
      )}

      {/* Links */}
      {links && links.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Links</h2>
          <div className="flex flex-wrap gap-2">
            {links.map((link, idx) => (
              <Button key={idx} variant="outline" size="sm" asChild>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {link.label}
                </a>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Latest Posts placeholder */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Latest Posts</h2>
        <p className="text-muted-foreground text-center py-8">
          Recent posts will appear here
        </p>
      </Card>
    </div>
  );
};
