import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useProfileCustomization } from "@/hooks/useProfileCustomization";
import { ProfileSectionsList } from "@/components/profile/customize/ProfileSectionsList";
import { ProfileCanvas } from "@/components/profile/customize/ProfileCanvas";
import { ProfileThemeSettings } from "@/components/profile/customize/ProfileThemeSettings";
import { SectionEditor } from "@/components/profile/customize/SectionEditor";
import { BlockEditor } from "@/components/profile/customize/BlockEditor";
import { Eye, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileCustomize = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const {
    sections,
    blocks,
    theme,
    isLoading,
    addSection,
    updateSection,
    deleteSection,
    addBlock,
    updateBlock,
    deleteBlock,
    updateTheme,
  } = useProfileCustomization(user?.id || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)]">
          <div className="w-80 border-r p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  const selectedSection = sections?.find((s) => s.id === selectedSectionId);
  const selectedBlock = blocks?.find((b) => b.id === selectedBlockId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Top toolbar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Customize Profile</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(`/profile/${user?.id}`, "_blank")}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={() => navigate(-1)}>
              <Save className="w-4 h-4 mr-2" />
              Done
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Sidebar */}
        <div className="w-80 border-r overflow-y-auto">
          <div className="p-6 space-y-6">
            <ProfileSectionsList
              sections={sections || []}
              selectedSectionId={selectedSectionId}
              onSelectSection={setSelectedSectionId}
              onAddSection={(data) => addSection.mutate(data)}
            />
            
            <ProfileThemeSettings
              theme={theme}
              onUpdateTheme={(data) => updateTheme.mutate(data)}
            />
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 overflow-y-auto bg-muted/20">
          <ProfileCanvas
            sections={sections || []}
            blocks={blocks || []}
            theme={theme}
            selectedSectionId={selectedSectionId}
            selectedBlockId={selectedBlockId}
            onSelectSection={setSelectedSectionId}
            onSelectBlock={setSelectedBlockId}
          />
        </div>

        {/* Right Panel - Contextual Editor */}
        {selectedSection && !selectedBlock && (
          <div className="w-80 border-l overflow-y-auto">
            <SectionEditor
              section={selectedSection}
              onUpdate={(updates) => updateSection.mutate({ id: selectedSection.id, ...updates })}
              onDelete={() => {
                deleteSection.mutate(selectedSection.id);
                setSelectedSectionId(null);
              }}
              onAddBlock={(blockData) => addBlock.mutate({ section_id: selectedSection.id, ...blockData })}
            />
          </div>
        )}

        {selectedBlock && (
          <div className="w-80 border-l overflow-y-auto">
            <BlockEditor
              block={selectedBlock}
              onUpdate={(updates) => updateBlock.mutate({ id: selectedBlock.id, ...updates })}
              onDelete={() => {
                deleteBlock.mutate(selectedBlock.id);
                setSelectedBlockId(null);
              }}
              onClose={() => setSelectedBlockId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCustomize;
