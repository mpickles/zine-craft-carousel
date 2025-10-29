import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface LinksBlockProps {
  data: {
    links: Array<{
      label: string;
      url: string;
      icon?: string;
    }>;
  };
}

export const LinksBlock = ({ data }: LinksBlockProps) => {
  if (!data.links || data.links.length === 0) {
    return (
      <div className="p-8 border border-dashed rounded text-center">
        <p className="text-sm text-muted-foreground">No links added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.links.map((link, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full justify-between h-auto py-3"
          asChild
        >
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            <span>{link.label}</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      ))}
    </div>
  );
};
