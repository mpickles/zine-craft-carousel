import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, IText, Image as FabricImage, util, Gradient } from 'fabric';
import { ChromePicker, ColorResult } from 'react-color';
import { Type, Undo, Redo, Trash2, AlignLeft, AlignCenter, AlignRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface AdvancedTextEditorProps {
  imageUrl: string;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

export const AdvancedTextEditor = ({ imageUrl, onSave, onClose }: AdvancedTextEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<IText | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: 1080,
      height: 1080,
      backgroundColor: '#f0f0f0',
      preserveObjectStacking: true,
    });

    // Load background image
    FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous',
    }).then((img) => {
      const scale = Math.min(
        fabricCanvas.width / (img.width || 1),
        fabricCanvas.height / (img.height || 1)
      );
      
      img.scale(scale);
      img.set({
        left: fabricCanvas.width / 2,
        top: fabricCanvas.height / 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      
      fabricCanvas.add(img);
      fabricCanvas.sendObjectToBack(img);
      fabricCanvas.renderAll();
      saveToHistory(fabricCanvas);
    });

    // Selection events
    fabricCanvas.on('selection:created', (e) => {
      const selected = e.selected?.[0];
      if (selected instanceof IText) {
        setSelectedObject(selected);
      }
    });
    
    fabricCanvas.on('selection:updated', (e) => {
      const selected = e.selected?.[0];
      if (selected instanceof IText) {
        setSelectedObject(selected);
      }
    });
    
    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    fabricCanvas.on('object:modified', () => {
      saveToHistory(fabricCanvas);
    });

    setCanvas(fabricCanvas);

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeObject = fabricCanvas.getActiveObject();
      if (!activeObject) return;
      
      // Delete key
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeObject instanceof IText && !activeObject.isEditing) {
        fabricCanvas.remove(activeObject);
        saveToHistory(fabricCanvas);
      }
      
      // Arrow keys for nudging
      const nudgeAmount = e.shiftKey ? 10 : 1;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        switch(e.key) {
          case 'ArrowLeft':
            activeObject.set({ left: (activeObject.left || 0) - nudgeAmount });
            break;
          case 'ArrowRight':
            activeObject.set({ left: (activeObject.left || 0) + nudgeAmount });
            break;
          case 'ArrowUp':
            activeObject.set({ top: (activeObject.top || 0) - nudgeAmount });
            break;
          case 'ArrowDown':
            activeObject.set({ top: (activeObject.top || 0) + nudgeAmount });
            break;
        }
        fabricCanvas.renderAll();
      }

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      fabricCanvas.dispose();
    };
  }, [imageUrl]);

  const saveToHistory = useCallback((canvas: FabricCanvas) => {
    const canvasState = JSON.stringify(canvas.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(canvasState);
      return newHistory;
    });
    setHistoryStep(prev => prev + 1);
  }, [historyStep]);

  const undo = useCallback(() => {
    if (!canvas || historyStep <= 0) return;
    const step = historyStep - 1;
    canvas.loadFromJSON(history[step]).then(() => {
      canvas.renderAll();
      setHistoryStep(step);
    });
  }, [canvas, history, historyStep]);

  const redo = useCallback(() => {
    if (!canvas || historyStep >= history.length - 1) return;
    const step = historyStep + 1;
    canvas.loadFromJSON(history[step]).then(() => {
      canvas.renderAll();
      setHistoryStep(step);
    });
  }, [canvas, history, historyStep]);

  const addText = useCallback((preset?: string) => {
    if (!canvas) return;

    const baseStyle = {
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: 'center' as const,
      originY: 'center' as const,
      fontFamily: 'Inter',
      fontSize: 48,
      fill: '#FFFFFF',
      editable: true,
    };

    const presets: Record<string, any> = {
      minimal: {
        fontSize: 32,
        fill: '#FFFFFF',
        fontFamily: 'Inter',
      },
      bold: {
        fontSize: 72,
        fill: '#FFFFFF',
        fontFamily: 'Playfair Display',
        fontWeight: 'bold',
        shadow: 'rgba(0,0,0,0.8) 3px 3px 6px',
      },
      outline: {
        fontSize: 64,
        fill: '#FFFFFF',
        stroke: '#2B231D',
        strokeWidth: 3,
      },
      neon: {
        fontSize: 56,
        fill: '#D4704F',
        shadow: '0 0 10px #D4704F, 0 0 20px #D4704F',
      },
    };

    const style = preset && presets[preset] ? { ...baseStyle, ...presets[preset] } : baseStyle;
    const text = new IText('Click to edit', style);

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveToHistory(canvas);
  }, [canvas, saveToHistory]);

  const updateTextProperty = useCallback((property: string, value: any) => {
    if (!selectedObject || !canvas) return;
    selectedObject.set(property as keyof IText, value);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const alignObject = useCallback((position: string) => {
    if (!selectedObject || !canvas) return;
    
    const objWidth = (selectedObject.width || 0) * (selectedObject.scaleX || 1);
    const objHeight = (selectedObject.height || 0) * (selectedObject.scaleY || 1);

    switch(position) {
      case 'left':
        selectedObject.set({ left: objWidth / 2 });
        break;
      case 'center':
        selectedObject.set({ left: canvas.width / 2 });
        break;
      case 'right':
        selectedObject.set({ left: canvas.width - objWidth / 2 });
        break;
      case 'top':
        selectedObject.set({ top: objHeight / 2 });
        break;
      case 'middle':
        selectedObject.set({ top: canvas.height / 2 });
        break;
      case 'bottom':
        selectedObject.set({ top: canvas.height - objHeight / 2 });
        break;
    }
    canvas.renderAll();
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const bringForward = useCallback(() => {
    if (!selectedObject || !canvas) return;
    canvas.bringObjectForward(selectedObject);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const sendBackward = useCallback(() => {
    if (!selectedObject || !canvas) return;
    canvas.sendObjectBackwards(selectedObject);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const deleteText = useCallback(() => {
    if (!selectedObject || !canvas) return;
    canvas.remove(selectedObject);
    setSelectedObject(null);
    canvas.renderAll();
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleSave = useCallback(() => {
    if (!canvas) return;
    
    canvas.discardActiveObject();
    canvas.renderAll();
    
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    
    onSave(dataUrl);
  }, [canvas, onSave]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur">
      <div className="flex h-full">
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-display font-bold">Add Text Overlay</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={undo} disabled={historyStep <= 0}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={redo} disabled={historyStep >= history.length - 1}>
                <Redo className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center">
            <canvas ref={canvasRef} className="border-2 border-border rounded-lg shadow-lg max-w-full max-h-full" />
          </div>

          {/* Bottom Toolbar */}
          <div className="mt-4 p-4 bg-surface rounded-lg border border-border">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => addText('minimal')}>
                Minimal
              </Button>
              <Button variant="outline" onClick={() => addText('bold')}>
                Bold
              </Button>
              <Button variant="outline" onClick={() => addText('outline')}>
                Outline
              </Button>
              <Button variant="outline" onClick={() => addText('neon')}>
                Accent
              </Button>
              <Button variant="outline" onClick={() => addText()}>
                <Type className="w-4 h-4 mr-2" />
                Custom Text
              </Button>
              
              <Separator orientation="vertical" className="mx-2" />
              
              <Button variant="ghost" size="icon" onClick={() => alignObject('left')} title="Align Left">
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => alignObject('center')} title="Center">
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => alignObject('right')} title="Align Right">
                <AlignRight className="w-4 h-4" />
              </Button>
              
              <Separator orientation="vertical" className="mx-2" />
              
              <Button variant="ghost" size="icon" onClick={bringForward} title="Bring Forward">
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={sendBackward} title="Send Backward">
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-surface border-l border-border p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Text Properties</h3>
          
          {selectedObject ? (
            <div className="space-y-6">
              {/* Font Family */}
              <div>
                <Label>Font</Label>
                <Select 
                  value={selectedObject.fontFamily}
                  onValueChange={(value) => updateTextProperty('fontFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Courier New">Courier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div>
                <Label>Size: {selectedObject.fontSize}px</Label>
                <Slider
                  value={[selectedObject.fontSize || 48]}
                  onValueChange={([value]) => updateTextProperty('fontSize', value)}
                  min={12}
                  max={200}
                  step={1}
                />
              </div>

              {/* Text Alignment */}
              <div>
                <Label>Text Align</Label>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant={selectedObject.textAlign === 'left' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateTextProperty('textAlign', 'left')}
                  >
                    Left
                  </Button>
                  <Button 
                    variant={selectedObject.textAlign === 'center' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateTextProperty('textAlign', 'center')}
                  >
                    Center
                  </Button>
                  <Button 
                    variant={selectedObject.textAlign === 'right' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateTextProperty('textAlign', 'right')}
                  >
                    Right
                  </Button>
                </div>
              </div>

              {/* Text Color */}
              <div>
                <Label className="mb-2 block">Text Color</Label>
                <ChromePicker 
                  color={selectedObject.fill as string}
                  onChange={(color: ColorResult) => updateTextProperty('fill', color.hex)}
                  disableAlpha={false}
                />
              </div>

              {/* Line Height */}
              <div>
                <Label>Line Height: {(selectedObject.lineHeight || 1).toFixed(1)}</Label>
                <Slider
                  value={[selectedObject.lineHeight || 1]}
                  onValueChange={([value]) => updateTextProperty('lineHeight', value)}
                  min={0.5}
                  max={3}
                  step={0.1}
                />
              </div>

              {/* Letter Spacing */}
              <div>
                <Label>Letter Spacing: {selectedObject.charSpacing || 0}</Label>
                <Slider
                  value={[selectedObject.charSpacing || 0]}
                  onValueChange={([value]) => updateTextProperty('charSpacing', value)}
                  min={-50}
                  max={200}
                  step={10}
                />
              </div>

              {/* Opacity */}
              <div>
                <Label>Opacity: {Math.round((selectedObject.opacity || 1) * 100)}%</Label>
                <Slider
                  value={[(selectedObject.opacity || 1) * 100]}
                  onValueChange={([value]) => updateTextProperty('opacity', value / 100)}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              {/* Shadow */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Shadow</Label>
                  <Switch
                    checked={!!selectedObject.shadow}
                    onCheckedChange={(checked) => {
                      updateTextProperty('shadow', checked ? 'rgba(0,0,0,0.5) 3px 3px 6px' : null);
                    }}
                  />
                </div>
              </div>

              {/* Stroke */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Outline</Label>
                  <Switch
                    checked={!!selectedObject.stroke}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateTextProperty('stroke', '#2B231D');
                        updateTextProperty('strokeWidth', 2);
                      } else {
                        updateTextProperty('stroke', null);
                        updateTextProperty('strokeWidth', 0);
                      }
                    }}
                  />
                </div>
                {selectedObject.stroke && (
                  <div className="mt-2">
                    <Label>Outline Width: {selectedObject.strokeWidth || 0}px</Label>
                    <Slider
                      value={[selectedObject.strokeWidth || 0]}
                      onValueChange={([value]) => updateTextProperty('strokeWidth', value)}
                      min={0}
                      max={10}
                      step={1}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Delete Button */}
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={deleteText}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Text
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a text element to edit its properties</p>
              <p className="text-sm mt-2">or add new text using the toolbar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
