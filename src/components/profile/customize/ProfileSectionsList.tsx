import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, GripVertical } from "lucide-react";
import { ProfileSection } from "@/hooks/useProfileCustomization";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ProfileSectionsListProps {
  sections: ProfileSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onAddSection: (data: Partial<ProfileSection>) => void;
}

export const ProfileSectionsList = ({
  sections,
  selectedSectionId,
  onSelectSection,
  onAddSection,
}: ProfileSectionsListProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddSection = (type: string) => {
    onAddSection({
      section_type: type,
      background_color: "#FFFFFF",
      padding_size: "medium",
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sections</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddSection("content")}
              >
                Empty Section
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddSection("posts")}
              >
                Latest Posts
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddSection("links")}
              >
                Links Section
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {sections.map((section) => (
          <Card
            key={section.id}
            className={`p-3 cursor-pointer transition-colors ${
              selectedSectionId === section.id
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelectSection(section.id)}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {section.is_header ? "Header" : `Section ${section.section_order + 1}`}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {section.section_type}
                  {section.is_header && " (locked)"}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
