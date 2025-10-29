import { ProfileTheme } from "@/hooks/useProfileCustomization";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ProfileThemeSettingsProps {
  theme?: ProfileTheme | null;
  onUpdateTheme: (data: Partial<ProfileTheme>) => void;
}

const FONT_HEADING_OPTIONS = [
  "Playfair Display",
  "Space Grotesk",
  "Libre Baskerville",
  "DM Serif Display",
  "Fraunces",
];

const FONT_BODY_OPTIONS = [
  "Inter",
  "Source Sans 3",
  "IBM Plex Sans",
  "Work Sans",
  "Manrope",
];

const COLOR_PALETTES = [
  {
    name: "Warm Editorial",
    primary: "#2C2C2C",
    secondary: "#666666",
    accent: "#D4846A",
  },
  {
    name: "Cool Minimal",
    primary: "#1A1A1A",
    secondary: "#757575",
    accent: "#9FB4A3",
  },
  {
    name: "Bold Statement",
    primary: "#000000",
    secondary: "#4A4A4A",
    accent: "#C83E3E",
  },
  {
    name: "Soft Neutral",
    primary: "#3E4A3B",
    secondary: "#7A7A7A",
    accent: "#C9B8A0",
  },
  {
    name: "Modern Contrast",
    primary: "#0F0F0F",
    secondary: "#5C5C5C",
    accent: "#E8C4A0",
  },
];

export const ProfileThemeSettings = ({
  theme,
  onUpdateTheme,
}: ProfileThemeSettingsProps) => {
  if (!theme) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Theme Settings</h2>

      <div className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Heading Font</Label>
          <Select
            value={theme.font_heading}
            onValueChange={(value) => onUpdateTheme({ font_heading: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_HEADING_OPTIONS.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Body Font</Label>
          <Select
            value={theme.font_body}
            onValueChange={(value) => onUpdateTheme({ font_body: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_BODY_OPTIONS.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            Color Palettes
          </Label>
          <div className="space-y-2">
            {COLOR_PALETTES.map((palette) => (
              <Button
                key={palette.name}
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={() =>
                  onUpdateTheme({
                    color_primary: palette.primary,
                    color_secondary: palette.secondary,
                    color_accent: palette.accent,
                  })
                }
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex gap-1">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: palette.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: palette.secondary }}
                    />
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: palette.accent }}
                    />
                  </div>
                  <span className="text-sm">{palette.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
