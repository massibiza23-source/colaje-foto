import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { 
  Printer, 
  HelpCircle, 
  FileText, 
  Sparkles,
  RefreshCw,
  Share2,
  Check,
  AlertCircle
} from 'lucide-react';

import { 
  CollageCanvasConfig, 
  CollageItem, 
  TextBox, 
  DecoSticker, 
  CollageTemplate 
} from './types';
import { 
  DEFAULT_CONFIG, 
  PORTRAIT_TEMPLATES, 
  LANDSCAPE_TEMPLATES 
} from './presets';
import { renderCollage } from './canvasExporter';

import Sidebar from './components/Sidebar';
import CollageCanvas from './components/CollageCanvas';
import PrintPDFModal from './components/PrintPDFModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [config, setConfig] = useState<CollageCanvasConfig>(DEFAULT_CONFIG);
  const [activeTemplate, setActiveTemplate] = useState<CollageTemplate>(PORTRAIT_TEMPLATES[3]); // Default 2x2 Portrait
  const [items, setItems] = useState<CollageItem[]>([]);
  const [texts, setTexts] = useState<TextBox[]>([]);
  const [stickers, setStickers] = useState<DecoSticker[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Status alerts
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'info'; text: string } | null>({
    type: 'info',
    text: '👋 ¡Bienvenido! Selecciona cualquier espacio para subir fotos y diseñar tu colaje A4.'
  });

  // Automatically dismiss alerts after some seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Adjust active templates when orientation switches
  useEffect(() => {
    const isPortrait = config.orientation === 'portrait';
    const currentTemplates = isPortrait ? PORTRAIT_TEMPLATES : LANDSCAPE_TEMPLATES;
    
    // Find matching template based on index or default
    const match = currentTemplates.find(t => t.id.replace('-l', '') === activeTemplate.id.replace('-l', '')) 
                  || currentTemplates[3];
    
    setActiveTemplate(match);
    // When switching templates, clear select highlights
    setSelectedItemId(null);
  }, [config.orientation]);

  // Sync default empty collage list structure on template change
  useEffect(() => {
    // Clear previously grid-bound items but keep freeform items
    setItems(prev => {
      const freeformItems = prev.filter(it => it.id.startsWith('free'));
      
      // Map slots to items
      const slotItems: CollageItem[] = activeTemplate.slots.map(slot => {
        // Find existing image item if they already uploaded one in a slot
        const existing = prev.find(it => it.slotId === slot.id);
        if (existing) {
          return {
            ...existing,
            slotId: slot.id // re-bind safely
          };
        }
        return {
          id: `item-${slot.id}-${Date.now()}`,
          imageUrl: null,
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
        };
      });

      return [...slotItems, ...freeformItems];
    });
  }, [activeTemplate]);

  // Add caption Text Box
  const handleAddText = () => {
    const newId = `text-${Date.now()}`;
    const newTextBox: TextBox = {
      id: newId,
      text: '✍️ Nota del Colaje',
      fontFamily: 'font-handwritten',
      fontSize: 28,
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      align: 'center',
      x: 50, // center percentages
      y: 85, // base polaroid area
      rotation: (Math.random() * 8) - 4, // slight charming rotation
      zIndex: 10 + texts.length
    };
    setTexts(prev => [...prev, newTextBox]);
    setSelectedItemId(newId);
    setAlertMessage({
      type: 'success',
      text: '📝 Texto añadido. Arrástralo libremente en la hoja.'
    });
  };

  // Add decorative vector Sticker
  const handleAddSticker = (type: 'heart' | 'star' | 'pin' | 'camera' | 'flower' | 'sparkles') => {
    const newId = `sticker-${Date.now()}`;
    const newSticker: DecoSticker = {
      id: newId,
      type: type,
      color: type === 'heart' ? '#EF4444' : type === 'star' ? '#F59E0B' : '#6366F1',
      size: 6,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      rotation: (Math.random() * 20) - 10,
      zIndex: 20 + stickers.length
    };
    setStickers(prev => [...prev, newSticker]);
    setSelectedItemId(newId);
    setAlertMessage({
      type: 'success',
      text: '✨ Detalles de pegatina añadidos. ¡Acomódalos sobre las fotos!'
    });
  };

  // Reset entire page layout safely
  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que deseas reiniciar tu diseño? Se borrarán las fotos y textos.')) {
      setItems([]);
      setTexts([]);
      setStickers([]);
      setSelectedItemId(null);
      setConfig(DEFAULT_CONFIG);
      setActiveTemplate(PORTRAIT_TEMPLATES[3]);
      setAlertMessage({
        type: 'info',
        text: '🧹 Lienzo restablecido a los valores iniciales.'
      });
    }
  };

  // Render high-res drawing and trigger Image Download
  const handleExportPNG = async () => {
    if (!canvasRef.current) return;
    try {
      setAlertMessage({ type: 'info', text: '🎨 Generando imagen en alta resolución (300 DPI)...' });
      
      // Render collage with isHighRes = true
      await renderCollage(
        canvasRef.current,
        config,
        items,
        texts,
        stickers,
        activeTemplate.slots,
        true // isHighRes
      );

      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `colaje-a4-${config.orientation}-${Date.now()}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Confetti celebration!
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 }
      });

      setAlertMessage({ type: 'success', text: '🎉 ¡Imagen descargada con éxito!' });
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: 'info', text: '⚠️ Hubo un problema al exportar la imagen.' });
    }
  };

  // Generate A4-ready PDF
  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    try {
      setAlertMessage({ type: 'info', text: '📄 Compilando PDF en tamaño A4 imprenta...' });

      // Ensure canvas is drawn at full high-res specs
      await renderCollage(
        canvasRef.current,
        config,
        items,
        texts,
        stickers,
        activeTemplate.slots,
        true // High resolution
      );

      // Create raw data URL
      const imgData = canvasRef.current.toDataURL('image/jpeg', 0.95);

      // Setup jsPDF paper sizes precisely (A4 at 1:1 format)
      // A4 portrait is 210 x 297 mm
      const doc = new jsPDF({
        orientation: config.orientation,
        unit: 'mm',
        format: 'a4'
      });

      const widthMM = config.orientation === 'portrait' ? 210 : 297;
      const heightMM = config.orientation === 'portrait' ? 297 : 210;

      doc.addImage(imgData, 'JPEG', 0, 0, widthMM, heightMM);
      doc.save(`colaje-a4-impresion-${Date.now()}.pdf`);

      // Celebrate
      confetti({
        particleCount: 160,
        spread: 120,
        colors: ['#10B981', '#3B82F6', '#F59E0B']
      });

      setAlertMessage({ type: 'success', text: '🎉 ¡Documento PDF listo para imprimir descargado!' });
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: 'info', text: '⚠️ Error generando la codificación PDF.' });
    }
  };

  // Direct print popup triggers standard high quality window
  const handleDirectPrint = async () => {
    if (!canvasRef.current) return;
    try {
      setAlertMessage({ type: 'info', text: '🖨️ Generando cola de impresión...' });

      await renderCollage(
        canvasRef.current,
        config,
        items,
        texts,
        stickers,
        activeTemplate.slots,
        true // high resolution
      );

      const url = canvasRef.current.toDataURL('image/png');
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Imprimir Colaje A4</title>
              <style>
                body {
                  margin: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background-color: #ffffff;
                }
                img {
                  width: 100%;
                  max-width: 100vw;
                  height: auto;
                  page-break-inside: avoid;
                }
                @page {
                  size: A4 ${config.orientation};
                  margin: 0;
                }
                @media print {
                  html, body {
                    width: 210mm;
                    height: 297mm;
                  }
                  img {
                    width: 210mm;
                    height: 297mm;
                  }
                }
              </style>
            </head>
            <body>
              <img src="${url}" onload="window.print(); window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        alert('Por favor habilite las ventanas emergentes (popups) para realizar la impresión directa de fotos.');
      }
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: 'info', text: '⚠️ Error al abrir el diálogo de impresión.' });
    }
  };

  // Filter templates list based on current orientation
  const currentTemplatesList = config.orientation === 'portrait' ? PORTRAIT_TEMPLATES : LANDSCAPE_TEMPLATES;

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-gray-950 overflow-hidden font-sans text-gray-100" id="app-root-container">
      
      {/* ⚠️ Alerts Banner */}
      {alertMessage && (
        <div 
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl backdrop-blur-md border ${
            alertMessage.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' 
              : 'bg-indigo-950/90 text-indigo-300 border-indigo-500/40'
          } animate-slide-in`}
          id="custom-toast-notification"
        >
          {alertMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-xs font-semibold tracking-wide">{alertMessage.text}</span>
          <button 
            type="button" 
            onClick={() => setAlertMessage(null)}
            className="text-[10px] ml-2 opacity-50 hover:opacity-100 font-bold uppercase"
          >
            cerrar
          </button>
        </div>
      )}

      {/* 1. SIDEBAR CONTROLS DASHBOARD */}
      <Sidebar
        config={config}
        setConfig={setConfig}
        activeTemplate={activeTemplate}
        setActiveTemplate={setActiveTemplate}
        templatesList={currentTemplatesList}
        items={items}
        setItems={setItems}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
        texts={texts}
        setTexts={setTexts}
        stickers={stickers}
        setStickers={setStickers}
        onAddText={handleAddText}
        onAddSticker={handleAddSticker}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onDirectPrint={() => setIsPrintModalOpen(true)}
        onClearAll={handleClearAll}
        uploadedImages={uploadedImages}
        setUploadedImages={setUploadedImages}
      />

      {/* 2. WYSIWYG CANVAS PREVIEW WORKSPACE */}
      <CollageCanvas
        config={config}
        activeTemplate={activeTemplate}
        items={items}
        setItems={setItems}
        texts={texts}
        setTexts={setTexts}
        stickers={stickers}
        setStickers={setStickers}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
        canvasRef={canvasRef}
      />

      {/* 3. PHYSICAL SHEET AND DELIVERY PRINT SETTINGS MODAL */}
      <PrintPDFModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        config={config}
        onDownloadPDF={handleExportPDF}
        onDirectPrint={handleDirectPrint}
      />
    </div>
  );
}
