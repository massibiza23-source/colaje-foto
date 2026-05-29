import React, { useRef, useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Smile, 
  Move, 
  RefreshCw, 
  Type, 
  Sparkles, 
  Grid,
  FileImage,
  Layers,
  Heart,
  Star,
  MapPin,
  Camera
} from 'lucide-react';
import { 
  CollageCanvasConfig, 
  CollageItem, 
  CollageTemplate, 
  TextBox, 
  DecoSticker 
} from '../types';

interface CollageCanvasProps {
  config: CollageCanvasConfig;
  activeTemplate: CollageTemplate;
  items: CollageItem[];
  setItems: React.Dispatch<React.SetStateAction<CollageItem[]>>;
  texts: TextBox[];
  setTexts: React.Dispatch<React.SetStateAction<TextBox[]>>;
  stickers: DecoSticker[];
  setStickers: React.Dispatch<React.SetStateAction<DecoSticker[]>>;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

// Maps our custom filter type to real CSS filter strings
const filterToCss = (filterName: string) => {
  switch (filterName) {
    case 'grayscale': return 'grayscale(100%)';
    case 'sepia': return 'sepia(100%)';
    case 'vintage': return 'sepia(40%) contrast(110%) saturate(80%) hue-rotate(-10deg)';
    case 'warm': return 'saturate(130%) contrast(110%) sepia(10%)';
    case 'cool': return 'saturate(80%) contrast(115%) hue-rotate(15deg) brightness(105%)';
    case 'dramatic': return 'contrast(140%) brightness(90%)';
    case 'retro-fade': return 'contrast(85%) brightness(110%) saturate(85%) sepia(15%)';
    case 'blur': return 'blur(3px)';
    default: return 'none';
  }
};

// Maps slot shape to CSS clipPath strings
const shapeToClipPath = (shape: string | undefined) => {
  if (shape === 'circle') return 'circle(50% at 50% 50%)';
  if (shape === 'oval') return 'ellipse(50% 50% at 50% 50%)';
  if (shape === 'hexagon') return 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
  if (shape === 'star') return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
  if (shape === 'heart') return 'polygon(50% 15%, 63% 0, 81% 0, 100% 15%, 100% 39%, 50% 95%, 0% 39%, 0% 15%, 19% 0, 37% 0)'; // heart polygon mask
  return 'none';
};

interface DragTarget {
  type: 'text' | 'sticker' | 'photo-pan' | 'freeform-item';
  id: string;
  startX: number;
  startY: number;
  originalPropX: number;
  originalPropY: number;
}

export default function CollageCanvas({
  config,
  activeTemplate,
  items,
  setItems,
  texts,
  setTexts,
  stickers,
  setStickers,
  selectedItemId,
  setSelectedItemId,
  canvasRef
}: CollageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragTarget | null>(null);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  // Monitor drop hovers for styling
  const [dragOverCellId, setDragOverCellId] = useState<string | null>(null);

  const isFreeform = activeTemplate.slots.length === 0;

  // Track page size bounds
  const [containerSize, setContainerSize] = useState({ width: 400, height: 565 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      const parent = containerRef.current;
      if (parent) {
        setContainerSize({
          width: parent.clientWidth,
          height: parent.clientHeight
        });
      }
    };
    
    const observer = new ResizeObserver(() => updateSize());
    observer.observe(containerRef.current);
    updateSize();

    return () => observer.disconnect();
  }, [config.orientation]);

  // Handle Drag Move for moving text boxes, stickers, floating elements, or panning photo insides
  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current || !containerRef.current) return;
    
    const drag = dragRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    // Convert pixels to relative values based on dimensions
    const pctDx = (dx / rect.width) * 100;
    const pctDy = (dy / rect.height) * 100;

    if (drag.type === 'text') {
      const newX = Math.max(0, Math.min(100, drag.originalPropX + pctDx));
      const newY = Math.max(0, Math.min(100, drag.originalPropY + pctDy));
      setTexts(prev => prev.map(t => t.id === drag.id ? { ...t, x: newX, y: newY } : t));
    } else if (drag.type === 'sticker') {
      const newX = Math.max(0, Math.min(100, drag.originalPropX + pctDx));
      const newY = Math.max(0, Math.min(100, drag.originalPropY + pctDy));
      setStickers(prev => prev.map(s => s.id === drag.id ? { ...s, x: newX, y: newY } : s));
    } else if (drag.type === 'freeform-item') {
      const newX = Math.max(0, Math.min(100, drag.originalPropX + pctDx));
      const newY = Math.max(0, Math.min(100, drag.originalPropY + pctDy));
      setItems(prev => prev.map(it => it.id === drag.id ? { ...it, x: newX, y: newY } : it));
    } else if (drag.type === 'photo-pan') {
      // Photo Pan moves opposite or standard tracking, mapped to percentage offsets
      // We scale panning by zoom to match movement naturally
      const item = items.find(it => it.id === drag.id);
      if (!item) return;
      const zoomFactor = Math.max(1, item.scale);
      const newOffsetX = Math.max(-100, Math.min(100, drag.originalPropX + (pctDx * 2 / zoomFactor)));
      const newOffsetY = Math.max(-100, Math.min(100, drag.originalPropY + (pctDy * 2 / zoomFactor)));
      setItems(prev => prev.map(it => it.id === drag.id ? { ...it, offsetX: newOffsetX, offsetY: newOffsetY } : it));
    }
  };

  const handleGlobalMouseUp = () => {
    dragRef.current = null;
  };

  // Click on background or empty spaces clears selector
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedItemId(null);
    }
  };

  // Handle file uploads triggered by clicking a cell
  const handleCellFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, slotId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setItems(prev => {
      const matchIndex = prev.findIndex(it => it.slotId === slotId);
      if (matchIndex >= 0) {
        // Update existing item in slot
        return prev.map((item, idx) => {
          if (idx === matchIndex) {
            return {
              ...item,
              imageUrl: url,
              scale: 1.0,
              rotation: 0,
              offsetX: 0,
              offsetY: 0
            };
          }
          return item;
        });
      } else {
        // Create new item for this slot
        const newItem: CollageItem = {
          id: `item-${slotId}-${Date.now()}`,
          imageUrl: url,
          scale: 1.0,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          filter: 'none',
          borderColor: '#FFFFFF',
          borderWidth: 0,
          borderRadius: 0,
          slotId: slotId,
          zIndex: 1
        };
        return [...prev, newItem];
      }
    });

    // Automatically select the newly configured cell for editing
    setSelectedItemId(`item-${slotId}-${Date.now()}`);
  };

  // Trigger HTML upload clicking on cell
  const handleCellClick = (slotId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const existing = items.find(it => it.slotId === slotId);
    if (existing) {
      setSelectedItemId(existing.id);
    } else {
      // Find files input and trigger it
      fileInputsRef.current[slotId]?.click();
    }
  };

  // Drag and drop events for drop uploading of local files
  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOverCellId(slotId);
  };

  const handleDragLeave = () => {
    setDragOverCellId(null);
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOverCellId(null);

    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const url = URL.createObjectURL(file);
    
    setItems(prev => {
      const matchIndex = prev.findIndex(it => it.slotId === slotId);
      if (matchIndex >= 0) {
        return prev.map((item, idx) => idx === matchIndex ? { ...item, imageUrl: url, scale: 1.0, rotation: 0, offsetX: 0, offsetY: 0 } : item);
      } else {
        const newItem: CollageItem = {
          id: `item-${slotId}-${Date.now()}`,
          imageUrl: url,
          scale: 1.0,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          filter: 'none',
          borderColor: '#FFFFFF',
          borderWidth: 0,
          borderRadius: 0,
          slotId: slotId,
          zIndex: 1
        };
        return [...prev, newItem];
      }
    });

    // select cell
    setSelectedItemId(`item-${slotId}-${Date.now()}`);
  };

  // Render Sticker vector representations in HTML overlays
  const renderStickerIcon = (type: string, color: string) => {
    const sStyle = { color: color, fill: color };
    if (type === 'heart') return <Heart className="w-full h-full drop-shadow-md transition" style={sStyle} />;
    if (type === 'star') return <Star className="w-full h-full drop-shadow-md transition" style={sStyle} />;
    if (type === 'pin') return <MapPin className="w-full h-full drop-shadow-md text-red-500 fill-red-500" />;
    if (type === 'camera') return <Camera className="w-full h-full drop-shadow-md transition" style={{ color: color }} />;
    return <Sparkles className="w-full h-full drop-shadow-md text-yellow-400 fill-yellow-400" />;
  };

  return (
    <div 
      className="flex-1 bg-[#EEECDF] p-6 md:p-10 flex items-center justify-center overflow-auto outline-none select-none relative"
      onMouseMove={handleGlobalMouseMove}
      onMouseUp={handleGlobalMouseUp}
      onMouseLeave={handleGlobalMouseUp}
      onClick={handleBackgroundClick}
      id="collage-workbench"
    >
      {/* Invisible Canvas used ONLY for rendering high-res and trigger PDF saving */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Interactive WYSIWYG sheet wrapper simulating physical A4 proportions (1:1.4142) */}
      <div 
        ref={containerRef}
        className={`relative bg-white shadow-2xl transition-all duration-300 pointer-events-auto rounded-${config.borderRadius}`}
        style={{
          // Set exact physical A4 proportion 210mm x 297mm
          width: config.orientation === 'portrait' ? '100%' : 'auto',
          height: config.orientation === 'portrait' ? 'auto' : '100%',
          maxWidth: config.orientation === 'portrait' ? '540px' : '760px',
          maxHeight: config.orientation === 'portrait' ? '760px' : '540px',
          aspectRatio: config.orientation === 'portrait' ? '1 / 1.4142' : '1.4142 / 1',
          background: config.gradientEnabled ? config.backgroundGradient : config.backgroundColor,
          padding: `${config.margin * 1.5}px`, // scaling factor
          boxShadow: config.shadowEnabled ? '0 30px 60px -15px rgba(26,26,26,0.35)' : 'none',
        }}
        id="a4-sheet-container"
      >
        {/* Active layout guidelines indicator (hidden during high res drawing) */}
        {config.showGridLines && (
          <div className="absolute inset-0 border border-[#1A1A1A]/20 pointer-events-none z-40">
            <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-[#1A1A1A]/10" />
            <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-[#1A1A1A]/10" />
          </div>
        )}

        {/* 1. GRID TEMPLATE SLOT CHANNELS */}
        {!isFreeform ? (
          <div className="w-full h-full relative" style={{ gap: `${config.gridGap}px` }}>
            {activeTemplate.slots.map((slot, index) => {
              const boundItem = items.find(it => it.slotId === slot.id);
              const customFilter = boundItem?.filter || 'none';
              const customClip = shapeToClipPath(slot.shape);

              // Boundary layout coordinates in percentages
              const slotStyle: React.CSSProperties = {
                position: 'absolute',
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                width: `${slot.w}%`,
                height: `${slot.h}%`,
                padding: `${config.gridGap / 2}px`, // simulated inner margin gap
              };

              const innerStyle: React.CSSProperties = {
                width: '100%',
                height: '100%',
                backgroundColor: boundItem?.imageUrl ? 'transparent' : '#FAF9F5',
                clipPath: customClip,
                border: selectedItemId === boundItem?.id ? '2px solid #1A1A1A' : '1px solid rgba(26, 26, 26, 0.12)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              };

              const isHov = dragOverCellId === slot.id;

              return (
                <div key={slot.id} style={slotStyle} id={`slot-wrapper-${slot.id}`}>
                  <div
                    style={innerStyle}
                    onClick={(e) => handleCellClick(slot.id, e)}
                    onDragOver={(e) => handleDragOver(e, slot.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, slot.id)}
                    className={`group shadow-sm relative flex items-center justify-center ${
                      isHov ? 'ring-2 ring-[#1A1A1A] bg-[#F3F0E8]' : ''
                    }`}
                  >
                    {/* Render Image with CSS Transforms */}
                    {boundItem?.imageUrl ? (
                      <div className="w-full h-full relative" style={{ overflow: 'hidden', clipPath: customClip }}>
                        <div
                          className="w-full h-full flex items-center justify-center cursor-move"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setSelectedItemId(boundItem.id);
                            dragRef.current = {
                              type: 'photo-pan',
                              id: boundItem.id,
                              startX: e.clientX,
                              startY: e.clientY,
                              originalPropX: boundItem.offsetX,
                              originalPropY: boundItem.offsetY
                            };
                          }}
                        >
                          <img
                            src={boundItem.imageUrl}
                            alt="Collage frame"
                            className="max-w-none absolute select-none pointer-events-none"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transform: `
                                scale(${boundItem.scale})
                                rotate(${boundItem.rotation}deg)
                                translate(${boundItem.offsetX}%, ${boundItem.offsetY}%)
                              `,
                              filter: filterToCss(customFilter),
                              transition: dragRef.current?.id === boundItem.id ? 'none' : 'transform 0.15s ease-out'
                            }}
                          />
                        </div>

                        {/* Direct hover quick selection handle */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition pointer-events-none flex items-center justify-center">
                          <span className="hidden group-hover:inline-block bg-[#1A1A1A] text-[9px] uppercase tracking-wider text-white px-2.5 py-1 font-bold">
                            EDITAR
                          </span>
                        </div>
                      </div>
                    ) : (
                      // EMPTY SLOT PLACEHOLDER WITH FLAT VECTOR ART COMPATIBILITY (Rendered via CSS styles)
                      <div className="flex flex-col items-center justify-center text-center p-4 h-full w-full bg-[#FAF9F5] hover:bg-[#F3F0E8] transition duration-300">
                        <div className="border border-[#1A1A1A]/20 p-2 text-[#1A1A1A] bg-white group-hover:border-[#1A1A1A] transition duration-300">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-bold text-[#1A1A1A] mt-2.5 uppercase tracking-widest block transition">
                          Añadir Foto
                        </span>
                        <span className="font-serif italic text-[10px] text-[#1A1A1A]/40 mt-1">Celda {index + 1} ({slot.shape === 'rect' ? 'Rectángulo' : slot.shape})</span>
                      </div>
                    )}

                    {/* Secret Native File Inputs */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => {
                        fileInputsRef.current[slot.id] = el;
                      }}
                      onChange={(e) => handleCellFileInputChange(e, slot.id)}
                      className="hidden"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // 2. FREEFORM COLLAGE DESKTOP (SCRAPBOOK MODE)
          <div className="w-full h-full relative" id="scrapbook-canvas" onClick={handleBackgroundClick}>
            {items.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#1A1A1A]/20 bg-white/40">
                <Layers className="w-8 h-8 text-[#1A1A1A]/40 mb-2 stroke-1" />
                <h4 className="font-serif italic text-[#1A1A1A] text-sm">Escenario de Arte Libre</h4>
                <p className="text-[11px] text-[#1A1A1A]/60 max-w-xs mt-1">
                  Usa el menú lateral para añadir fotos flotantes. Muévelas, rótalas y apílalas libremente sobre el papel.
                </p>
              </div>
            ) : (
              // Map cards front-to-back
              items.map((it) => {
                const isItemSel = selectedItemId === it.id;
                const filterStyle = filterToCss(it.filter);

                const itemStyle: React.CSSProperties = {
                  position: 'absolute',
                  left: `${it.x}%`,
                  top: `${it.y}%`,
                  width: `${it.w}%`,
                  height: `${it.h}%`,
                  zIndex: it.zIndex,
                  transform: 'translate(-50%, -50%)', // center on (x,y)
                };

                return (
                  <div
                    key={it.id}
                    style={itemStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(it.id);
                    }}
                    onMouseDown={(e) => {
                      // Grab frame for dragging entire element
                      e.stopPropagation();
                      setSelectedItemId(it.id);
                      dragRef.current = {
                        type: 'freeform-item',
                        id: it.id,
                        startX: e.clientX,
                        startY: e.clientY,
                        originalPropX: it.x || 0,
                        originalPropY: it.y || 0
                      };
                    }}
                    className={`bg-white p-3 shadow-md rounded-none border border-[#1A1A1A]/10 cursor-move select-none flex flex-col ${
                      isItemSel ? 'ring-2 ring-[#1A1A1A] ring-offset-2' : 'hover:scale-[1.01]'
                    } transition-all duration-100`}
                  >
                    {/* Inner Photo container (simulating polaroid white backing frames) */}
                    <div className="flex-1 w-full bg-[#FAF9F5] rounded-none relative overflow-hidden flex items-center justify-center border border-[#1A1A1A]/10 min-h-0">
                      {it.imageUrl ? (
                        <img
                          src={it.imageUrl}
                          alt="scrapbook layer"
                          className="absolute pointer-events-none max-w-none"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: filterStyle,
                            transform: `scale(${it.scale}) rotate(${it.rotation}deg) translate(${it.offsetX}%, ${it.offsetY}%)`
                          }}
                        />
                      ) : (
                        <FileImage className="w-8 h-8 text-[#1A1A1A]/20 pointer-events-none" />
                      )}
                    </div>
                    {/* Polaroid lower writing space */}
                    <div className="h-6 mt-1.5 flex items-center justify-center text-[8px] text-[#1A1A1A]/40 font-mono tracking-wider font-bold">
                      MEMORIES
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 3. ABSOLUTE INTERACTIVE TEXT BOXES OVERLAYS */}
        {texts.map((tb) => {
          const isTextSel = selectedItemId === tb.id;
          let fontClass = 'font-sans';
          if (tb.fontFamily === 'font-serif') fontClass = 'font-serif';
          else if (tb.fontFamily === 'font-mono') fontClass = 'font-mono';
          else if (tb.fontFamily === 'font-display') fontClass = 'font-black tracking-tight uppercase';
          else if (tb.fontFamily === 'font-handwritten') fontClass = 'font-cursive text-lg';

          // Dynamic class according to alignment
          const alignClass = tb.align === 'center' ? 'text-center' : tb.align === 'right' ? 'text-right' : 'text-left';

          return (
            <div
              key={tb.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedItemId(tb.id);
                dragRef.current = {
                  type: 'text',
                  id: tb.id,
                  startX: e.clientX,
                  startY: e.clientY,
                  originalPropX: tb.x,
                  originalPropY: tb.y
                };
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItemId(tb.id);
              }}
              style={{
                position: 'absolute',
                left: `${tb.x}%`,
                top: `${tb.y}%`,
                transform: `translate(-50%, -50%) rotate(${tb.rotation}deg)`,
                color: tb.color,
                fontSize: `${tb.fontSize * 0.4}px`, // visual preview ratio
                fontFamily: 'inherit',
                zIndex: tb.zIndex || 50,
                cursor: 'move',
              }}
              className={`p-1.5 select-none font-semibold leading-normal ${fontClass} ${alignClass} ${
                isTextSel ? 'border border-dashed border-[#1A1A1A] bg-white/50' : 'hover:bg-[#1A1A1A]/5'
              }`}
            >
              {tb.text || 'Edítame en el panel'}
            </div>
          );
        })}

        {/* 4. ABSOLUTE DECORATIVE STICKERS OVERLAYS */}
        {stickers.map((st) => {
          const isStickerSel = selectedItemId === st.id;
          const relativeSize = `${st.size * 5}px`; // visual scalar

          return (
            <div
              key={st.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedItemId(st.id);
                dragRef.current = {
                  type: 'sticker',
                  id: st.id,
                  startX: e.clientX,
                  startY: e.clientY,
                  originalPropX: st.x,
                  originalPropY: st.y
                };
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItemId(st.id);
              }}
              style={{
                position: 'absolute',
                left: `${st.x}%`,
                top: `${st.y}%`,
                width: relativeSize,
                height: relativeSize,
                transform: `translate(-50%, -50%) rotate(${st.rotation}deg)`,
                zIndex: st.zIndex || 60,
                cursor: 'move'
              }}
              className={`p-1 select-none flex items-center justify-center flex-shrink-0 ${
                isStickerSel ? 'border border-dashed border-[#1A1A1A] bg-white/55' : 'hover:scale-105 transition-transform'
              }`}
            >
              {renderStickerIcon(st.type, st.color)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
