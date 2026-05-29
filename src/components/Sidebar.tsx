import React, { useRef, useState } from 'react';
import { 
  Compass, 
  Grid, 
  Image as ImageIcon, 
  Type, 
  Activity, 
  Check, 
  Plus, 
  Trash2, 
  Layout, 
  Sliders, 
  Sparkles, 
  Palette, 
  Printer, 
  Download, 
  FileText, 
  RotateCcw,
  ArrowRight,
  RefreshCw,
  Crop,
  Layers,
  StickyNote
} from 'lucide-react';
import { 
  CollageCanvasConfig, 
  CollageItem, 
  CollageTemplate, 
  TextBox, 
  DecoSticker,
  FONT_OPTIONS,
  IMAGE_FILTERS
} from '../types';
import { COLOR_PALETTES, GRADIENT_PALETTES } from '../presets';

interface SidebarProps {
  config: CollageCanvasConfig;
  setConfig: React.Dispatch<React.SetStateAction<CollageCanvasConfig>>;
  activeTemplate: CollageTemplate;
  setActiveTemplate: (template: CollageTemplate) => void;
  templatesList: CollageTemplate[];
  items: CollageItem[];
  setItems: React.Dispatch<React.SetStateAction<CollageItem[]>>;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  texts: TextBox[];
  setTexts: React.Dispatch<React.SetStateAction<TextBox[]>>;
  stickers: DecoSticker[];
  setStickers: React.Dispatch<React.SetStateAction<DecoSticker[]>>;
  onAddText: () => void;
  onAddSticker: (type: 'heart' | 'star' | 'pin' | 'camera' | 'flower' | 'sparkles') => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onDirectPrint: () => void;
  onClearAll: () => void;
  uploadedImages: string[];
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Sidebar({
  config,
  setConfig,
  activeTemplate,
  setActiveTemplate,
  templatesList,
  items,
  setItems,
  selectedItemId,
  setSelectedItemId,
  texts,
  setTexts,
  stickers,
  setStickers,
  onAddText,
  onAddSticker,
  onExportPNG,
  onExportPDF,
  onDirectPrint,
  onClearAll,
  uploadedImages,
  setUploadedImages
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'design' | 'photo' | 'text' | 'deco'>('design');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find the selected item for detailed editing
  const selectedItem = items.find(it => it.id === selectedItemId);

  // Helper to handle general configuration changes
  const updateConfig = (key: keyof CollageCanvasConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Sync orientation changes by switching standard template packages
  const handleOrientationChange = (ori: 'portrait' | 'landscape') => {
    updateConfig('orientation', ori);
    // Find matching template in the opposite orientation
    const opposingTemplate = templatesList.find(t => t.id === activeTemplate.id.replace('-l', '')) || 
                           templatesList.find(t => t.id.startsWith(activeTemplate.id)) ||
                           templatesList[0];
    if (opposingTemplate) {
      setActiveTemplate(opposingTemplate);
    }
  };

  // Sync items loaded as pictures with the Banco de Fotos
  React.useEffect(() => {
    const activeUrls = items.map(it => it.imageUrl).filter(Boolean) as string[];
    if (activeUrls.length > 0) {
      setUploadedImages(prev => {
        const unseen = activeUrls.filter(url => !prev.includes(url));
        if (unseen.length > 0) {
          return [...prev, ...unseen];
        }
        return prev;
      });
    }
  }, [items, setUploadedImages]);

  // Handle file uploads for specific slots/layers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedItemId) return;

    const url = URL.createObjectURL(file);
    // Add to bank
    setUploadedImages(prev => prev.includes(url) ? prev : [...prev, url]);

    setItems(prev => prev.map(item => {
      if (item.id === selectedItemId) {
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
    }));
  };

  // Handle uploading multiple photos at once (Carga Masiva)
  const handleMultiplePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls = Array.from(files).map(file => URL.createObjectURL(file as Blob));
    setUploadedImages(prev => [...prev, ...urls]);

    const isFreeform = activeTemplate.slots.length === 0 || activeTemplate.id.includes('free');

    if (isFreeform) {
      // Add all as floating polaroids on the canvas
      const newItems: CollageItem[] = urls.map((url, i) => {
        const offset = i * 4;
        const newId = `free-${Date.now()}-${i}`;
        return {
          id: newId,
          imageUrl: url,
          scale: 1.0,
          rotation: (Math.random() * 12) - 6, // slight artistic rotation
          offsetX: 0,
          offsetY: 0,
          filter: 'none',
          borderColor: '#FFFFFF',
          borderWidth: 6,
          borderRadius: 4,
          x: Math.max(15, Math.min(85, 30 + Math.random() * 30 + offset)),
          y: Math.max(15, Math.min(85, 33 + Math.random() * 30 + (i % 3) * 5)),
          w: 45,
          h: 40,
          zIndex: items.length + 1 + i
        };
      });

      setItems(prev => [...prev, ...newItems]);
      if (newItems.length > 0) {
        setSelectedItemId(newItems[newItems.length - 1].id);
      }
    } else {
      // In grid layout, fill empty slots first
      const emptySlots = activeTemplate.slots.filter(slot => {
        const boundItem = items.find(it => it.slotId === slot.id);
        return !boundItem || !boundItem.imageUrl;
      });

      let nextItems = [...items];
      let assignedCount = 0;

      // Assign to empty slots
      for (let i = 0; i < urls.length && i < emptySlots.length; i++) {
        const slot = emptySlots[i];
        const url = urls[i];
        assignedCount++;

        const matchIdx = nextItems.findIndex(it => it.slotId === slot.id);
        if (matchIdx >= 0) {
          nextItems[matchIdx] = {
            ...nextItems[matchIdx],
            imageUrl: url,
            scale: 1.0,
            rotation: 0,
            offsetX: 0,
            offsetY: 0
          };
        } else {
          nextItems.push({
            id: `item-${slot.id}-${Date.now()}-${i}`,
            imageUrl: url,
            scale: 1.0,
            rotation: 0,
            offsetX: 0,
            offsetY: 0,
            filter: 'none',
            borderColor: '#FFFFFF',
            borderWidth: 0,
            borderRadius: 0,
            slotId: slot.id,
            zIndex: 1
          });
        }
      }

      setItems(nextItems);
      
      // Auto-select the last assigned item
      if (assignedCount > 0) {
        const lastSlot = emptySlots[assignedCount - 1];
        const lastItem = nextItems.find(it => it.slotId === lastSlot.id);
        if (lastItem) {
          setSelectedItemId(lastItem.id);
        }
      }
    }
  };

  // Assign image selected from the bank
  const handleSelectFromBank = (url: string) => {
    if (selectedItemId) {
      setItems(prev => prev.map(item => {
        if (item.id === selectedItemId) {
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
      }));
    } else {
      const isFreeform = activeTemplate.slots.length === 0 || activeTemplate.id.includes('free');
      if (isFreeform) {
        const newId = `free-${Date.now()}`;
        const newItem: CollageItem = {
          id: newId,
          imageUrl: url,
          scale: 1.0,
          rotation: (Math.random() * 12) - 6,
          offsetX: 0,
          offsetY: 0,
          filter: 'none',
          borderColor: '#FFFFFF',
          borderWidth: 6,
          borderRadius: 4,
          x: 25 + Math.random() * 40,
          y: 25 + Math.random() * 40,
          w: 45,
          h: 40,
          zIndex: items.length + 1
        };
        setItems(prev => [...prev, newItem]);
        setSelectedItemId(newId);
      } else {
        // Find empty slot
        const emptySlot = activeTemplate.slots.find(slot => {
          const bound = items.find(it => it.slotId === slot.id);
          return !bound || !bound.imageUrl;
        });

        if (emptySlot) {
          setItems(prev => {
            const matchIdx = prev.findIndex(it => it.slotId === emptySlot.id);
            if (matchIdx >= 0) {
              return prev.map((item, idx) => idx === matchIdx ? { ...item, imageUrl: url, scale: 1.0, rotation: 0, offsetX: 0, offsetY: 0 } : item);
            } else {
              return [...prev, {
                id: `item-${emptySlot.id}-${Date.now()}`,
                imageUrl: url,
                scale: 1.0,
                rotation: 0,
                offsetX: 0,
                offsetY: 0,
                filter: 'none',
                borderColor: '#FFFFFF',
                borderWidth: 0,
                borderRadius: 0,
                slotId: emptySlot.id,
                zIndex: 1
              }];
            }
          });
          setSelectedItemId(null); // Deselect after assigning
        } else {
          alert("Todas las celdas de la plantilla están llenas. Haz clic en una celda de la hoja para seleccionarla, y haz clic en alguna foto del banco para reemplazarla.");
        }
      }
    }
  };

  const removeImageFromBank = (urlToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedImages(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleAutoFillGrid = () => {
    const emptySlots = activeTemplate.slots.filter(slot => {
      const bound = items.find(it => it.slotId === slot.id);
      return !bound || !bound.imageUrl;
    });
    
    if (emptySlots.length === 0) {
      alert("Todas las celdas ya tienen fotos asignadas.");
      return;
    }

    const availableBankImages = uploadedImages.filter(url => {
      return !items.some(it => it.imageUrl === url);
    });

    const imagesToUse = availableBankImages.length > 0 ? availableBankImages : uploadedImages;

    if (imagesToUse.length === 0) {
      alert("No tienes fotos en el banco para auto-rellenar. ¡Sube un lote con el cargador masivo primero!");
      return;
    }

    let nextItems = [...items];
    let filled = 0;

    for (let i = 0; i < emptySlots.length && i < imagesToUse.length; i++) {
      const slot = emptySlots[i];
      const url = imagesToUse[i];
      filled++;

      const matchIdx = nextItems.findIndex(it => it.slotId === slot.id);
      if (matchIdx >= 0) {
        nextItems[matchIdx] = {
          ...nextItems[matchIdx],
          imageUrl: url,
          scale: 1.0,
          rotation: 0,
          offsetX: 0,
          offsetY: 0
        };
      } else {
        nextItems.push({
          id: `item-${slot.id}-${Date.now()}-${i}`,
          imageUrl: url,
          scale: 1.0,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          filter: 'none',
          borderColor: '#FFFFFF',
          borderWidth: 0,
          borderRadius: 0,
          slotId: slot.id,
          zIndex: 1
        });
      }
    }

    setItems(nextItems);
  };

  const handleUpdateItemProperty = (property: keyof CollageItem, value: any) => {
    if (!selectedItemId) return;
    setItems(prev => prev.map(item => {
      if (item.id === selectedItemId) {
        return { ...item, [property]: value };
      }
      return item;
    }));
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Add random custom photo into Freeform layout
  const handleAddFreeformPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    // Add to bank
    setUploadedImages(prev => prev.includes(url) ? prev : [...prev, url]);

    const newId = `free-${Date.now()}`;
    const newItem: CollageItem = {
      id: newId,
      imageUrl: url,
      scale: 1.0,
      rotation: (Math.random() * 12) - 6, // slight artistic rotation
      offsetX: 0,
      offsetY: 0,
      filter: 'none',
      borderColor: '#FFFFFF',
      borderWidth: 6,
      borderRadius: 4,
      x: 20 + Math.random() * 20,
      y: 20 + Math.random() * 20,
      w: 45,
      h: 40,
      zIndex: items.length + 1
    };
    setItems(prev => [...prev, newItem]);
    setSelectedItemId(newId);
  };

  return (
    <div className="w-full lg:w-96 bg-[#F7F6F2] border-r border-[#1A1A1A]/10 text-[#1A1A1A] flex flex-col h-full overflow-hidden select-none" id="sidebar-panel">
      {/* App Header */}
      <div className="p-5 border-b border-[#1A1A1A]/10 bg-white/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#1A1A1A] p-2 text-white">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif italic text-xl tracking-tight text-[#1A1A1A]">Studio A4</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Impresión Premium</p>
          </div>
        </div>
        <button 
          onClick={onClearAll}
          className="p-2 hover:bg-[#1A1A1A]/5 rounded text-[#1A1A1A]/70 hover:text-red-650 transition"
          title="Reiniciar diseño"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#1A1A1A]/10 bg-white/30 p-1 gap-1">
        <button
          onClick={() => setActiveTab('design')}
          className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider flex flex-col items-center gap-1 transition-all ${
            activeTab === 'design' 
              ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-0.5' 
              : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setActiveTab('photo')}
          className={`relative flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider flex flex-col items-center gap-1 transition-all ${
            activeTab === 'photo' 
              ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-0.5' 
              : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Filtro/Foto</span>
          {selectedItemId && (
            <span className="absolute top-1.5 right-4 w-1.5 h-1.5 bg-red-600 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider flex flex-col items-center gap-1 transition-all ${
            activeTab === 'text' 
              ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-0.5' 
              : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Textos</span>
        </button>
        <button
          onClick={() => setActiveTab('deco')}
          className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider flex flex-col items-center gap-1 transition-all ${
            activeTab === 'deco' 
              ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-0.5' 
              : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stickers</span>
        </button>
      </div>

      {/* Sidebar Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* ================= DESIGN TAB ================= */}
        {activeTab === 'design' && (
          <div className="space-y-6 animate-fade-in">
            {/* Aspect Orientation */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest block opacity-50">
                Orientación de Hoja A4
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOrientationChange('portrait')}
                  className={`py-3 px-4 border flex flex-col items-center gap-1.5 transition text-xs font-semibold rounded-none ${
                    config.orientation === 'portrait'
                      ? 'border-[#1A1A1A] bg-white text-[#1A1A1A] shadow-sm'
                      : 'border-[#1A1A1A]/10 bg-white/40 hover:bg-white text-[#1A1A1A]/50'
                  }`}
                >
                  <div className="w-4 h-6 border border-current rounded-none opacity-85" />
                  Vertical (A4 Portrait)
                </button>
                <button
                  onClick={() => handleOrientationChange('landscape')}
                  className={`py-3 px-4 border flex flex-col items-center gap-1.5 transition text-xs font-semibold rounded-none ${
                    config.orientation === 'landscape'
                      ? 'border-[#1A1A1A] bg-white text-[#1A1A1A] shadow-sm'
                      : 'border-[#1A1A1A]/10 bg-white/40 hover:bg-white text-[#1A1A1A]/50'
                  }`}
                >
                  <div className="w-6 h-4 border border-current rounded-none opacity-85" />
                  Horizontal (A4 Landscape)
                </button>
              </div>
            </div>

            {/* Templates Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold tracking-widest block opacity-50">
                  Plantillas de Colaje
                </label>
                <span className="text-[9px] uppercase tracking-wider font-bold bg-[#1A1A1A] text-white px-2 py-0.5 rounded-none font-sans">
                  {activeTemplate.id.includes('free') ? 'Estilo Libre' : 'Rejilla'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2" id="templates-grid">
                {templatesList.map((temp) => (
                  <button
                    key={temp.id}
                    onClick={() => {
                      setActiveTemplate(temp);
                      setSelectedItemId(null);
                    }}
                    className={`p-3 rounded-none border text-left transition flex flex-col justify-between h-20 ${
                      activeTemplate.id === temp.id
                        ? 'border-[#1A1A1A] bg-white text-[#1A1A1A] font-bold shadow-sm'
                        : 'border-[#1A1A1A]/10 bg-white/40 hover:bg-white text-[#1A1A1A]/60'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <Layout className={`w-3.5 h-3.5 ${activeTemplate.id === temp.id ? 'text-[#1A1A1A]' : 'opacity-40'}`} />
                      {activeTemplate.id === temp.id && (
                        <Check className="w-3 h-3 text-[#1A1A1A]" />
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold truncate w-full opacity-80">{temp.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Customizer Sliders */}
            <div className="space-y-4 bg-white/40 p-4 rounded-none border border-[#1A1A1A]/10">
              <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-60 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#1A1A1A]" /> Parámetros del Formato A4
              </h3>

              {/* Freeform Add Button helper if freeform is active */}
              {activeTemplate.id.includes('free') && (
                <div className="pt-1 pb-3 border-b border-[#1A1A1A]/10">
                  <p className="text-[11px] text-[#1A1A1A]/70 mb-2">
                    En <b className="font-serif italic">Estilo Libre</b>, puedes colocar tantas fotos como quieras y moverlas/rotarlas.
                  </p>
                  <label className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase tracking-widest font-bold py-2.5 px-4 rounded-none cursor-pointer transition shadow-sm">
                    <Plus className="w-4 h-4" />
                    Subir foto flotante
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAddFreeformPhoto} 
                      className="hidden" 
                    />
                  </label>
                </div>
              )}

              {/* Grid margin (Outer Page Padding) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#1A1A1A]/70">
                  <span>Margen de Hoja (A4)</span>
                  <span className="font-mono text-[#1A1A1A] font-bold">{config.margin} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={config.margin}
                  onChange={(e) => updateConfig('margin', parseInt(e.target.value))}
                  className="w-full h-1 bg-[#1A1A1A]/15 appearance-none cursor-pointer accent-[#1A1A1A]"
                />
              </div>

              {/* Grid Gap */}
              {!activeTemplate.id.includes('free') && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#1A1A1A]/70">
                    <span>Espacio entre Fotos (Gaps)</span>
                    <span className="font-mono text-[#1A1A1A] font-bold">{config.gridGap} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={config.gridGap}
                    onChange={(e) => updateConfig('gridGap', parseInt(e.target.value))}
                    className="w-full h-1 bg-[#1A1A1A]/15 appearance-none cursor-pointer accent-[#1A1A1A]"
                  />
                </div>
              )}

              {/* Overall Border Width */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#1A1A1A]/70">
                  <span>Ancho de Borde de Celdas</span>
                  <span className="font-mono text-[#1A1A1A] font-bold">{config.borderWidth} pt</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={config.borderWidth}
                  onChange={(e) => updateConfig('borderWidth', parseInt(e.target.value))}
                  className="w-full h-1 bg-[#1A1A1A]/15 appearance-none cursor-pointer accent-[#1A1A1A]"
                />
              </div>
            </div>

            {/* Colors and backgrounds */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-bold tracking-widest block opacity-50">
                Fondo del Papel / Canvas
              </label>

              {/* Toggle solid vs gradient */}
              <div className="flex bg-white/40 p-1 border border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => updateConfig('gradientEnabled', false)}
                  className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-wider transition ${
                    !config.gradientEnabled ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/60'
                  }`}
                >
                  Sólidos
                </button>
                <button
                  type="button"
                  onClick={() => updateConfig('gradientEnabled', true)}
                  className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-wider transition ${
                    config.gradientEnabled ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/60'
                  }`}
                >
                  Degradados
                </button>
              </div>

              {!config.gradientEnabled ? (
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTES.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        updateConfig('backgroundColor', color.value);
                      }}
                      className={`w-full h-8 border border-[#1A1A1A]/10 shadow-inner flex items-center justify-center transition relative group ${
                        config.backgroundColor === color.value ? 'border-[#1A1A1A] scale-105' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {config.backgroundColor === color.value && (
                        <div className="w-5 h-5 bg-[#1A1A1A] text-white flex items-center justify-center p-0.5 shadow-md">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                  <div className="col-span-6 flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      id="custom-bg-color"
                      value={config.backgroundColor}
                      onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                      className="w-8 h-8 rounded-none cursor-pointer bg-transparent border-0"
                    />
                    <label htmlFor="custom-bg-color" className="text-[11px] text-[#1A1A1A]/60">
                      Color personalizado: <span className="font-mono text-[#1A1A1A] font-semibold ml-1">{config.backgroundColor}</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2" id="gradient-palette-picker">
                  {GRADIENT_PALETTES.map((gradient) => (
                    <button
                      key={gradient.name}
                      onClick={() => {
                        updateConfig('backgroundGradient', gradient.value);
                      }}
                      className={`p-2 rounded-none border text-left transition h-12 relative overflow-hidden flex items-end ${
                        config.backgroundGradient === gradient.value
                          ? 'border-[#1A1A1A] text-[#1A1A1A] font-bold shadow-sm'
                          : 'border-[#1A1A1A]/10 text-[#1A1A1A]/60'
                      }`}
                    >
                      <div 
                        className="absolute inset-0 opacity-50 hover:opacity-75 transition animate-pulse" 
                        style={{ background: gradient.value }}
                      />
                      <span className="text-[9px] uppercase tracking-wider font-bold relative z-10 block bg-white/90 border border-black/10 px-1.5 py-0.5 text-[#1A1A1A]">
                        {gradient.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= PHOTO TAB ================= */}
        {activeTab === 'photo' && (
          <div className="space-y-6 animate-fade-in" id="photo-tab-panel">
            {!selectedItemId ? (
              <div className="space-y-6">
                {/* Cargador Masivo Directo */}
                <div className="bg-white border border-[#1A1A1A]/10 p-5 text-center space-y-4">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center mx-auto text-[#1A1A1A]">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif italic text-base text-[#1A1A1A]">Subir Múltiples Fotos</h4>
                    <p className="text-[11px] text-[#1A1A1A]/60 mt-1.5 max-w-xs mx-auto">
                      Selecciona o arrastra varias fotos a la vez. Se distribuirán en tu colaje A4 automáticamente.
                    </p>
                  </div>
                  
                  <label className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase tracking-widest font-bold py-3 px-4 rounded-none cursor-pointer transition shadow-sm">
                    <Plus className="w-4 h-4" />
                    Seleccionar fotos
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleMultiplePhotosUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Banco de Fotos Cargadas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold tracking-widest block opacity-50">
                      Banco de Fotos ({uploadedImages.length})
                    </label>
                    {uploadedImages.length > 0 && !activeTemplate.id.includes('free') && (
                      <button
                        onClick={handleAutoFillGrid}
                        className="text-[9px] uppercase tracking-wider font-bold text-[#1A1A1A] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Rellena las celdas vacías con fotos de tu banco"
                      >
                        <RefreshCw className="w-3 h-3 animate-spin duration-10000" /> Auto-rellenar
                      </button>
                    )}
                  </div>

                  {uploadedImages.length === 0 ? (
                    <div className="text-center py-8 p-4 bg-white/30 border border-[#1A1A1A]/10 border-dashed text-[#1A1A1A]/60">
                      <p className="text-[11px]">No has cargado imágenes aún.</p>
                      <span className="text-[10px] opacity-75 mt-0.5 block">¡Carga un lote para comenzar a armar tu colaje!</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedImages.map((url, i) => {
                        // Check if this image has already been assigned to any layout cells
                        const isAssigned = items.some(it => it.imageUrl === url);
                        
                        return (
                          <div 
                            key={i}
                            onClick={() => handleSelectFromBank(url)}
                            className="aspect-square bg-[#FAF9F5] border border-[#1A1A1A]/10 relative group cursor-pointer overflow-hidden hover:scale-105 hover:border-[#1A1A1A] transition-all"
                            title="Haz clic para colocar en el lienzo"
                          >
                            <img 
                              src={url} 
                              alt={`bank-img-${i}`} 
                              className="w-full h-full object-cover select-none pointer-events-none"
                            />
                            
                            {/* Hover info label */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-1 text-center">
                              <span className="text-[8px] leading-tight text-white uppercase font-bold tracking-wide">
                                {activeTemplate.id.includes('free') ? 'Añadir' : 'Colocar'}
                              </span>
                            </div>
                            
                            {/* Status Indicators */}
                            {isAssigned && (
                              <div className="absolute top-1 left-1 bg-emerald-700 text-white rounded-full p-0.5 shadow-sm" title="Imagen activa en el colaje">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}

                            {/* Delete single bank photo */}
                            <button
                              onClick={(e) => removeImageFromBank(url, e)}
                              className="absolute top-1 right-1 bg-white/95 text-[#1A1A1A]/50 hover:text-red-700 p-1 hover:bg-white shadow-sm border border-[#1A1A1A]/10 opacity-0 group-hover:opacity-100 transition"
                              title="Quitar del banco de fotos"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {uploadedImages.length > 0 && (
                    <p className="text-[10px] text-[#1A1A1A]/50 italic text-center mt-1">
                      {activeTemplate.id.includes('free') 
                        ? '💡 Haz clic en una foto para agregarla como Polaroid libre' 
                        : '💡 Selecciona una celda del papel, luego toca la foto para rellenarla'}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual slot helper info */}
                <div className="flex items-center justify-between p-3 bg-white border border-[#1A1A1A]/15">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]">
                      Editando: {selectedItemId.startsWith('slot-') ? `Celda ${selectedItemId.replace('slot-', '')}` : 'Foto flotante'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedItemId(null)}
                    className="text-[10px] text-[#1A1A1A]/50 hover:text-[#1A1A1A] uppercase tracking-wider font-bold"
                  >
                    Salir
                  </button>
                </div>

                {/* Upload Action */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest block opacity-50">
                    Imagen de la Celda
                  </label>
                  
                  {selectedItem?.imageUrl ? (
                    <div className="flex items-center gap-2">
                      <div className="relative w-14 h-14 overflow-hidden border border-[#1A1A1A]/20 bg-white">
                        <img 
                          src={selectedItem.imageUrl} 
                          alt="preview" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#1A1A1A] flex items-center gap-1 font-bold">
                          <Check className="w-3.5 h-3.5 animate-pulse text-emerald-700" /> Foto cargada
                        </p>
                        <p className="text-[10px] text-[#1A1A1A]/50 truncate">Sustituye la imagen actual en cualquier momento</p>
                      </div>
                    </div>
                  ) : null}

                  <button
                    onClick={triggerUploadClick}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase font-bold tracking-widest transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {selectedItem?.imageUrl ? 'Cambiar Foto de Celda' : 'Subir Foto'}
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {selectedItem?.imageUrl && (
                  <>
                    {/* Position and Scale Adjustment */}
                    <div className="space-y-4 bg-white/45 p-4 border border-[#1A1A1A]/10">
                      <h4 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                        <Crop className="w-3.5 h-3.5 text-[#1A1A1A]" /> Encuadre y Zoom de Foto
                      </h4>

                      {/* Scale / Zoom */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-[#1A1A1A]/70">
                          <span>Zoom</span>
                          <span className="font-mono text-[#1A1A1A] font-bold">{(selectedItem.scale * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="4"
                          step="0.05"
                          value={selectedItem.scale}
                          onChange={(e) => handleUpdateItemProperty('scale', parseFloat(e.target.value))}
                          className="w-full h-1 bg-[#1A1A1A]/15 appearance-none cursor-pointer accent-[#1A1A1A]"
                        />
                      </div>

                      {/* Rotation */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-[#1A1A1A]/70">
                          <span>Rotación</span>
                          <span className="font-mono text-[#1A1A1A] font-bold">{selectedItem.rotation}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={selectedItem.rotation}
                          onChange={(e) => handleUpdateItemProperty('rotation', parseInt(e.target.value))}
                          className="w-full h-1 bg-[#1A1A1A]/15 appearance-none cursor-pointer accent-[#1A1A1A]"
                        />
                      </div>

                      {/* Offset X - Manual Panning */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-[#1A1A1A]/70">
                          <span>Desplazar Horizontal (Eje X)</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={selectedItem.offsetX}
                          onChange={(e) => handleUpdateItemProperty('offsetX', parseInt(e.target.value))}
                          className="w-full h-1 bg-[#1A1A1A]/15 appearance-none cursor-pointer accent-[#1A1A1A]"
                        />
                      </div>

                      {/* Offset Y - Manual Panning */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-[#1A1A1A]/70">
                          <span>Desplazar Vertical (Eje Y)</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={selectedItem.offsetY}
                          onChange={(e) => handleUpdateItemProperty('offsetY', parseInt(e.target.value))}
                          className="w-full h-1 bg-[#1A1A1A]/15 appearance-none cursor-pointer accent-[#1A1A1A]"
                        />
                      </div>
                    </div>

                    {/* Color Filters Selection */}
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-bold tracking-widest block opacity-50">
                        Filtro de Color Artístico
                      </label>
                      <div className="grid grid-cols-2 gap-2" id="filters-palette">
                        {IMAGE_FILTERS.map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => handleUpdateItemProperty('filter', filter.value)}
                            className={`p-2.5 border text-xs font-semibold text-left transition flex items-center justify-between rounded-none ${
                              selectedItem.filter === filter.value
                                ? 'border-[#1A1A1A] bg-white text-[#1A1A1A] font-bold shadow-sm'
                                : 'border-[#1A1A1A]/10 bg-white/40 hover:bg-white text-[#1A1A1A]/60'
                            }`}
                          >
                            <span>{filter.label}</span>
                            {selectedItem.filter === filter.value && (
                              <Check className="w-3.5 h-3.5 text-[#1A1A1A]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Border & Styling for specific slots inside Freeform */}
                    {selectedItem.id.startsWith('free') && (
                      <div className="space-y-4 bg-white/40 p-4 border border-[#1A1A1A]/10">
                        <h4 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-[#1A1A1A]" /> Capas y Bordes (Libre)
                        </h4>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] text-[#1A1A1A]/60 uppercase tracking-widest block font-bold">Borde de Tarjeta</label>
                          <div className="flex gap-2">
                            {['#FFFFFF', '#FAF6F0', '#000000', '#F9EBEA', '#EBF1ED'].map((col) => (
                              <button
                                key={col}
                                onClick={() => handleUpdateItemProperty('borderColor', col)}
                                className={`w-6 h-6 rounded-none border border-[#1A1A1A]/25 transition ${
                                  selectedItem.borderColor === col ? 'border-2 border-[#1A1A1A] scale-105' : ''
                                }`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Stacking Z-Index trigger */}
                        <div className="flex justify-between items-center bg-white h-10 px-3 border border-[#1A1A1A]/15">
                          <span className="text-xs text-[#1A1A1A]/70 uppercase tracking-wider font-bold">Mover al Frente (Capas)</span>
                          <button
                            onClick={() => handleUpdateItemProperty('zIndex', selectedItem.zIndex + 1)}
                            className="bg-[#1A1A1A] hover:bg-black text-white text-[9px] uppercase tracking-wider font-bold px-3 py-1.5"
                          >
                            ELEVAR CAPA
                          </button>
                        </div>

                        {/* Delete float item */}
                        <button
                          onClick={() => {
                            setItems(prev => prev.filter(it => it.id !== selectedItemId));
                            setSelectedItemId(null);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-700 hover:text-white text-[10px] uppercase font-bold tracking-widest transition"
                        >
                          <Trash2 className="w-4 h-4" /> Eliminar foto libre
                        </button>
                      </div>
                    )}

                    {/* Inline Image Bank substitution inside active editing section */}
                    <div className="border-t border-[#1A1A1A]/10 pt-4 mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-bold tracking-widest block opacity-50">
                          Sustituir con Banco de Fotos ({uploadedImages.length})
                        </label>
                      </div>

                      {uploadedImages.length === 0 ? (
                        <div className="text-center py-4 bg-white/20 border border-[#1A1A1A]/10 border-dashed text-xs text-[#1A1A1A]/50 font-serif italic">
                          No tienes fotos cargadas en el banco aún.
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-1.5">
                          {uploadedImages.map((url, i) => (
                            <div 
                              key={i}
                              onClick={() => handleSelectFromBank(url)}
                              className={`aspect-square relative cursor-pointer overflow-hidden border transition group ${
                                selectedItem?.imageUrl === url 
                                  ? 'border-2 border-[#1A1A1A] scale-105' 
                                  : 'border-[#1A1A1A]/10 hover:border-[#1A1A1A]/55'
                              }`}
                              title="Haz clic para rellenar la celda seleccionada con esta foto"
                            >
                              <img src={url} alt={`swap-bank-img-${i}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-[9px] text-[#1A1A1A]/50 text-center tracking-wide font-medium">
                        Toca cualquier foto de arriba para asignarla instantáneamente a la celda seleccionada.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TEXT TAB ================= */}
        {activeTab === 'text' && (
          <div className="space-y-6 animate-fade-in" id="text-tab-panel">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest block opacity-50">
                Crea tus Leyendas / Textos
              </label>
              <button
                onClick={onAddText}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase font-bold tracking-widest transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Añadir Caja de Texto
              </button>
            </div>

            {texts.length === 0 ? (
              <div className="text-center py-8 px-4 bg-white/40 border border-[#1A1A1A]/10 border-dashed">
                <Type className="w-8 h-8 text-[#1A1A1A]/40 mx-auto mb-2" />
                <h4 className="font-serif italic text-sm text-[#1A1A1A]">Ningún texto añadido</h4>
                <p className="text-[11px] text-[#1A1A1A]/60 mt-1">
                  Añade títulos o notas para conmemorar momentos especiales dentro del colaje. Puedes arrastrarlos donde quieras en la hoja.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold tracking-widest block opacity-50">
                  Textos en la Hoja ({texts.length})
                </label>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {texts.map((tb, idx) => (
                    <div key={tb.id} className="p-4 bg-white border border-[#1A1A1A]/15 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
                        <span className="text-[10px] font-mono text-[#1A1A1A]/60 font-bold uppercase tracking-wider">Caja {idx + 1}</span>
                        <button
                          onClick={() => setTexts(prev => prev.filter(t => t.id !== tb.id))}
                          className="text-[#1A1A1A]/50 hover:text-red-650 p-1 rounded hover:bg-[#1A1A1A]/5 transition"
                          title="Eliminar texto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Text Input */}
                      <input
                        type="text"
                        value={tb.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTexts(prev => prev.map(t => t.id === tb.id ? { ...t, text: val } : t));
                        }}
                        placeholder="Escribe aquí..."
                        className="w-full bg-white text-[#1A1A1A] border border-[#1A1A1A]/15 py-1.5 px-3 text-xs focus:border-[#1A1A1A]/60 outline-none rounded-none font-semibold"
                      />

                      {/* Font Family selector */}
                      <div className="grid grid-cols-2 gap-2 font-semibold">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">Tipografía</span>
                          <select
                            value={tb.fontFamily}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setTexts(prev => prev.map(t => t.id === tb.id ? { ...t, fontFamily: val } : t));
                            }}
                            className="w-full bg-white text-[#1A1A1A] border border-[#1A1A1A]/15 p-1 text-[11px] rounded-none outline-none font-semibold"
                          >
                            {FONT_OPTIONS.map(fo => (
                              <option key={fo.value} value={fo.value}>{fo.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Font size */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">Tamaño</span>
                          <input
                            type="number"
                            min="10"
                            max="100"
                            value={tb.fontSize}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 12;
                              setTexts(prev => prev.map(t => t.id === tb.id ? { ...t, fontSize: val } : t));
                            }}
                            className="w-full bg-white text-[#1A1A1A] border border-[#1A1A1A]/15 p-1 text-[11px] font-mono text-center rounded-none outline-none font-semibold"
                          />
                        </div>
                      </div>

                      {/* Color swatch preset / customized tracker */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                          {['#000000', '#FFFFFF', '#4F46E5', '#EF4444', '#10B981'].map(hex => (
                            <button
                              key={hex}
                              onClick={() => {
                                setTexts(prev => prev.map(t => t.id === tb.id ? { ...t, color: hex } : t));
                              }}
                              className={`w-4 h-4 rounded-none border border-[#1A1A1A]/25 transition ${
                                tb.color === hex ? 'border-2 border-[#1A1A1A]' : ''
                              }`}
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                        {/* Custom color input */}
                        <input
                          type="color"
                          value={tb.color}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTexts(prev => prev.map(t => t.id === tb.id ? { ...t, color: val } : t));
                          }}
                          className="w-5 h-5 bg-transparent border-0 cursor-pointer animate-fade-in"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= DECO TAB ================= */}
        {activeTab === 'deco' && (
          <div className="space-y-6 animate-fade-in" id="deco-tab-panel">
            <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-50">
              Pegatinas y Cinta Papel (Washi Tapes)
            </h3>
            
            <div className="bg-white/40 p-4 border border-[#1A1A1A]/10 space-y-4">
              <p className="text-[11px] text-[#1A1A1A]/70">
                Añade elementos adhesivos divertidos y decorativos sobre tus fotos. Puedes arrastrarlos y rotarlos libremente.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'heart', label: 'Corazón ❤️' },
                  { type: 'star', label: 'Estrella ⭐️' },
                  { type: 'sparkles', label: 'Sparkles ✨' },
                  { type: 'pin', label: 'Alfiler 📌' },
                  { type: 'camera', label: 'Cámara 📷' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => onAddSticker(item.type as any)}
                    className="p-3 bg-white border border-[#1A1A1A]/15 hover:border-[#1A1A1A] flex flex-col items-center justify-center text-center transition hover:scale-105 rounded-none"
                  >
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A] block">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {stickers.length > 0 && (
              <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold tracking-widest block opacity-50">
                  Pegatinas Activas ({stickers.length})
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {stickers.map((st, i) => (
                    <div key={st.id} className="flex justify-between items-center p-3 bg-white border border-[#1A1A1A]/10">
                      <span className="text-[11px] text-[#1A1A1A] uppercase tracking-wider font-bold">
                        {st.type} #{i+1}
                      </span>
                      <div className="flex items-center gap-3 font-semibold">
                        <input
                          type="color"
                          value={st.color}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStickers(prev => prev.map(s => s.id === st.id ? { ...s, color: val } : s));
                          }}
                          className="w-4 h-4 rounded bg-transparent border-0 cursor-pointer"
                        />
                        <button
                          onClick={() => setStickers(prev => prev.filter(s => s.id !== st.id))}
                          className="text-[#1A1A1A]/50 hover:text-red-650"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Options Persistent Dock */}
      <div className="p-4 border-t border-[#1A1A1A]/10 bg-white/50 backdrop-blur-md space-y-3" id="export-actions-panel">
        <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-50 block">
          Exportar e Impresión A4
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {/* PNG High Quality */}
          <button
            onClick={onExportPNG}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-[#F7F6F2] text-[#1A1A1A] border border-[#1A1A1A]/15 text-[10px] uppercase font-bold tracking-widest transition"
            title="Exportar en 300 DPI"
          >
            <Download className="w-3.5 h-3.5 text-[#1A1A1A]" />
            <span>HQ Imagen</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={onExportPDF}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase font-bold tracking-widest transition"
            title="Descargar archivo PDF listo para imprimir en A4"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>Papel PDF</span>
          </button>
        </div>

        {/* Direct print */}
        <button
          onClick={onDirectPrint}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase font-bold tracking-widest transition shadow-sm"
        >
          <Printer className="w-4 h-4" /> Imprimir desde el navegador
        </button>  
        <p className="text-[10px] uppercase tracking-wider font-bold opacity-40 text-center">
          Proporción de papel A4 física (21.0cm x 29.7cm)
        </p>
      </div>
    </div>
  );
}
