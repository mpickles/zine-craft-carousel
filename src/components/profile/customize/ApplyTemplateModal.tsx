import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PROFILE_TEMPLATES, TemplateConfig } from "@/lib/profileTemplates";
import { AlertCircle } from "lucide-react";

interface ApplyTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTemplate: (template: TemplateConfig) => void;
}

export const ApplyTemplateModal = ({
  open,
  onOpenChange,
  onApplyTemplate,
}: ApplyTemplateModalProps) => {
  const handleApply = (template: TemplateConfig) => {
    if (confirm("Replace current layout? This will delete your existing sections (except header).")) {
      onApplyTemplate(template);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Starting from a template gives you a pre-built layout.</p>
              <p className="text-muted-foreground">
                You can customize everything after applying. This will replace your current layout.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {PROFILE_TEMPLATES.map((template) => (
              <Card key={template.id} className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Includes:</div>
                  <div className="space-y-1">
                    <div className="bg-muted/50 p-2 rounded text-xs">
                      Header (username + bio)
                    </div>
                    {template.sections.map((section, idx) => (
                      <div key={idx} className="bg-muted/50 p-2 rounded text-xs">
                        {section.blocks.map((block, blockIdx) => (
                          <div key={blockIdx}>
                            {block.block_type === "latest-posts" && "Latest Posts"}
                            {block.block_type === "featured-collection" && "Featured Collection"}
                            {block.block_type === "text" && "Text Block"}
                            {block.block_type === "links" && "Social Links"}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleApply(template)}
                >
                  Use This Template
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
