interface SpacerBlockProps {
  data: {
    height: number;
  };
  isEditMode?: boolean;
}

export const SpacerBlock = ({ data, isEditMode }: SpacerBlockProps) => {
  if (isEditMode) {
    return (
      <div
        className="border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center"
        style={{ height: `${data.height}px` }}
      >
        <span className="text-xs text-muted-foreground">Spacer ({data.height}px)</span>
      </div>
    );
  }

  return <div style={{ height: `${data.height}px` }} />;
};
