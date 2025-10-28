import { useState, useCallback, useRef } from 'react';
import { X, Check, RotateCcw, RotateCw, FlipHorizontal } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { ImageEdits } from '@/types/post';

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (edits: ImageEdits, applyToAll?: boolean) => void;
  imageUrl: string;
  initialEdits: ImageEdits;
  slideCount: number;
}

const ASPECT_RATIOS = [
  { label: '1:1', value: 1 },
  { label: '4:5', value: 4 / 5 },
  { label: '16:9', value: 16 / 9 },
  { label: 'Free', value: null },
];

const FILTERS = [
  { label: 'Original', value: 'original' as const, style: '' },
  { label: 'B&W', value: 'bw' as const, style: 'grayscale(100%)' },
  { label: 'Vintage', value: 'vintage' as const, style: 'sepia(50%) contrast(110%)' },
  { label: 'Vibrant', value: 'vibrant' as const, style: 'saturate(150%) contrast(110%)' },
];

export const ImageEditModal = ({ isOpen, onClose, onSave, imageUrl, initialEdits, slideCount }: ImageEditModalProps) => {
  const [edits, setEdits] = useState<ImageEdits>(initialEdits);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [activeTab, setActiveTab] = useState<'crop' | 'rotate' | 'filter' | 'adjust'>('crop');
  const [applyFilterToAll, setApplyFilterToAll] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
    setEdits((prev) => ({
      ...prev,
      crop: {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
        aspect: prev.crop?.aspect ?? null,
      },
    }));
  }, []);

  const handleRotate = (direction: 'left' | 'right') => {
    setEdits((prev) => ({
      ...prev,
      rotation: direction === 'left' 
        ? (prev.rotation - 90 + 360) % 360 
        : (prev.rotation + 90) % 360,
    }));
  };

  const handleFlip = () => {
    setEdits((prev) => ({ ...prev, flipHorizontal: !prev.flipHorizontal }));
  };

  const handleAspectChange = (aspect: number | null) => {
    setEdits((prev) => ({
      ...prev,
      crop: prev.crop ? { ...prev.crop, aspect } : null,
    }));
  };

  const handleFilterChange = (filter: ImageEdits['filter']) => {
    setEdits((prev) => ({ ...prev, filter }));
  };

  const handleAdjustmentChange = (key: keyof ImageEdits['adjustments'], value: number) => {
    setEdits((prev) => ({
      ...prev,
      adjustments: { ...prev.adjustments, [key]: value },
    }));
  };

  const getImageStyle = () => {
    const filter = FILTERS.find((f) => f.value === edits.filter)?.style || '';
    const { brightness, contrast, saturation } = edits.adjustments;
    const adjustmentFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    const transform = `rotate(${edits.rotation}deg) ${edits.flipHorizontal ? 'scaleX(-1)' : ''}`;
    
    return {
      filter: `${filter} ${adjustmentFilter}`.trim(),
      transform,
    };
  };

  const handleSave = () => {
    onSave(edits, activeTab === 'filter' && applyFilterToAll);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-elevated border-b border-border-light">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold text-text-primary">Edit Image</h2>
        <Button variant="default" size="icon" onClick={handleSave} aria-label="Save">
          <Check className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Image Preview */}
        <div className="flex-1 relative bg-black">
          {activeTab === 'crop' ? (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={edits.crop?.aspect ?? undefined}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              style={{
                containerStyle: { backgroundColor: '#000' },
                cropAreaStyle: { border: '2px solid var(--brand-accent)' },
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
                style={getImageStyle()}
              />
            </div>
          )}
        </div>

        {/* Tools */}
        <div className="bg-bg-elevated border-t border-border-light p-4 space-y-4 max-h-[50vh] overflow-y-auto">
          {/* Tab Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'crop', label: '🖼️ Crop', icon: '🖼️' },
              { id: 'rotate', label: '🔄 Rotate', icon: '🔄' },
              { id: 'filter', label: '✨ Filter', icon: '✨' },
              { id: 'adjust', label: '☀️ Adjust', icon: '☀️' },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="whitespace-nowrap"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Crop Tools */}
          {activeTab === 'crop' && (
            <div className="space-y-3">
              <Label>Aspect Ratio</Label>
              <div className="flex gap-2 flex-wrap">
                {ASPECT_RATIOS.map((ratio) => (
                  <Button
                    key={ratio.label}
                    variant={edits.crop?.aspect === ratio.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAspectChange(ratio.value)}
                  >
                    {ratio.label}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Zoom</Label>
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={1}
                  max={3}
                  step={0.1}
                />
              </div>
            </div>
          )}

          {/* Rotate Tools */}
          {activeTab === 'rotate' && (
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => handleRotate('left')}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Rotate Left
              </Button>
              <Button variant="outline" onClick={() => handleRotate('right')}>
                <RotateCw className="w-4 h-4 mr-2" />
                Rotate Right
              </Button>
              <Button variant="outline" onClick={handleFlip}>
                <FlipHorizontal className="w-4 h-4 mr-2" />
                Flip Horizontal
              </Button>
            </div>
          )}

          {/* Filter Tools */}
          {activeTab === 'filter' && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {FILTERS.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={edits.filter === filter.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
              
              {/* Apply to All Slides - Instagram 2025 Feature */}
              {slideCount > 1 && (
                <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
                  <input
                    type="checkbox"
                    id="apply-filter-all"
                    checked={applyFilterToAll}
                    onChange={(e) => setApplyFilterToAll(e.target.checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="apply-filter-all" className="cursor-pointer">
                    <div className="font-medium">Apply this filter to all {slideCount} slides</div>
                    <div className="text-xs text-text-tertiary mt-1">
                      Save time by applying the same filter to your entire carousel
                    </div>
                  </Label>
                </div>
              )}
            </div>
          )}

          {/* Adjust Tools */}
          {activeTab === 'adjust' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Brightness: {edits.adjustments.brightness}%</Label>
                <Slider
                  value={[edits.adjustments.brightness]}
                  onValueChange={(value) => handleAdjustmentChange('brightness', value[0])}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Contrast: {edits.adjustments.contrast}%</Label>
                <Slider
                  value={[edits.adjustments.contrast]}
                  onValueChange={(value) => handleAdjustmentChange('contrast', value[0])}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Saturation: {edits.adjustments.saturation}%</Label>
                <Slider
                  value={[edits.adjustments.saturation]}
                  onValueChange={(value) => handleAdjustmentChange('saturation', value[0])}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
