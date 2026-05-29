import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Check, 
  Loader2, 
  Sliders, 
  FileText, 
  Globe, 
  Truck,
  Sparkles,
  Award
} from 'lucide-react';
import { CollageCanvasConfig } from '../types';

interface PrintPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CollageCanvasConfig;
  onDownloadPDF: () => void;
  onDirectPrint: () => void;
}

export default function PrintPDFModal({
  isOpen,
  onClose,
  config,
  onDownloadPDF,
  onDirectPrint
}: PrintPDFModalProps) {
  const [paperStock, setPaperStock] = useState<'photo-gloss' | 'photo-matte' | 'cardstock'>('photo-gloss');
  const [copies, setCopies] = useState<number>(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'download' | 'online-print'>('download');
  const [isSubmittingService, setIsSubmittingService] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Paper details descriptions
  const paperDetails = {
    'photo-gloss': { name: 'Papel Fotográfico Brillante (250g)', desc: 'Brillo premium y alta fidelidad de color, ideal para fotos de viajes y recuerdos vibrantes.' },
    'photo-matte': { name: 'Papel Fotográfico Mate Satinado (220g)', desc: 'Sin reflejos molestos, textura suave táctil que otorga aspecto artístico sofisticado.' },
    'cardstock': { name: 'Cartulina Artística Especial (300g)', desc: 'Papel extra grueso de textura natural, perfecto para enmarcar o regalar como postal.' },
  };

  const handleOnlineServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingService(true);
    // Simulate high-fidelity network POST submission to local print shop
    setTimeout(() => {
      setIsSubmittingService(false);
      setSubmittedSuccess(true);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="print-modal-overlay">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-gray-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600/20 text-emerald-400 p-2 rounded-xl">
              <Printer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-md text-white">Preparar Impresión en A4</h2>
              <p className="text-xs text-gray-400 font-mono">Orientación: {config.orientation === 'portrait' ? 'Vertical' : 'Horizontal'} (21.0 x 29.7 cm)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 bg-gray-950 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-800 bg-gray-950/40 p-1">
          <button
            onClick={() => {
              setDeliveryMethod('download');
              setSubmittedSuccess(false);
            }}
            className={`flex-1 py-3 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-2 transition ${
              deliveryMethod === 'download' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Guardar PDF / Local
          </button>
          <button
            onClick={() => setDeliveryMethod('online-print')}
            className={`flex-1 py-3 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-2 transition ${
              deliveryMethod === 'online-print' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            Servicio de Imprenta Express
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {deliveryMethod === 'download' ? (
            <div className="space-y-6">
              <p className="text-sm text-gray-300 leading-relaxed">
                Generamos un documento PDF en alta resolución específicamente codificado para encajar perfectamente en hojas físicas de tamaño <b>A4 estándar</b>. Conserva el 100% de la calidad de tus imágenes.
              </p>

              {/* Quality assurance box */}
              <div className="p-4 bg-emerald-650/10 border border-emerald-500/25 rounded-xl flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Garantía Alta Resolución 300 DPI</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    El PDF exportado contendrá las dimensiones óptimas para evitar la pixelación al momento de la impresión física directa en tu impresora.
                  </p>
                </div>
              </div>

              {/* Direct Print Wizard Instructions */}
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Parámetros recomendados para imprimir:
                </h4>
                <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
                  <li><b>Papel:</b> A4 (210 x 297 mm)</li>
                  <li><b>Márgenes:</b> Ninguno (Sin márgenes o "Ajustar a página")</li>
                  <li><b>Escala:</b> 100% o proporcional para evitar recortes automáticos</li>
                  <li><b>Calidad:</b> Foto o Alta Definición para aprovechar tintas</li>
                </ul>
              </div>

              {/* Buttons panel */}
              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onDownloadPDF();
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-650/10"
                >
                  <FileText className="w-4 h-4" />
                  Descargar PDF A4
                </button>
                
                <button
                  onClick={() => {
                    onDirectPrint();
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-650/10"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Directo
                </button>
              </div>
            </div>
          ) : (
            /* Online Integrated Print Service Layout */
            <div className="space-y-6">
              {submittedSuccess ? (
                <div className="text-center py-8 space-y-4 animate-fade-in">
                  <div className="w-14 h-14 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold border border-emerald-500/30">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">¡Pedido enviado con éxito!</h3>
                    <p className="text-xs text-gray-400">
                      Hemos recibido y procesado el PDF del colaje A4 con tu configuración.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-left max-w-sm mx-auto space-y-2">
                    <p className="text-[11px] text-gray-400 flex justify-between">
                      <span>Papel elegido:</span>
                      <span className="text-gray-200 font-semibold">{paperDetails[paperStock].name}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 flex justify-between">
                      <span>Copias físicas:</span>
                      <span className="text-gray-200 font-semibold">{copies}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 flex justify-between">
                      <span>Precio total:</span>
                      <span className="text-emerald-400 font-bold">{(copies * 1.50).toFixed(2)}€ (Envío gratis)</span>
                    </p>
                    <p className="text-[10px] text-rose-300 font-semibold pt-1 border-t border-gray-900 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Llegada estimada en 24/48 horas laborables.
                    </p>
                  </div>

                  <button
                    onClick={() => setSubmittedSuccess(false)}
                    className="py-2.5 px-6 bg-gray-850 hover:bg-gray-800 text-xs font-semibold rounded-xl text-gray-200"
                  >
                    Volver a configurar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleOnlineServiceSubmit} className="space-y-5 animate-fade-in">
                  <p className="text-xs text-gray-400">
                    Conéctate de manera directa con nuestros partners de impresión locales de alta calidad. Te enviamos tu colaje A4 impreso en papel fotográfico profesional directamente a la puerta de tu casa.
                  </p>

                  {/* Stock type swatch */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block">
                      Tipo de Papel Fotográfico
                    </label>
                    <div className="space-y-2">
                      {(Object.keys(paperDetails) as Array<keyof typeof paperDetails>).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPaperStock(key)}
                          className={`w-full p-3.5 rounded-xl border text-left transition flex justify-between items-start ${
                            paperStock === key
                              ? 'border-indigo-500 bg-indigo-600/10 text-white'
                              : 'border-gray-800 bg-gray-950 hover:bg-gray-850 text-gray-400'
                          }`}
                        >
                          <div className="flex-1 pr-4">
                            <span className="text-xs font-bold block text-gray-200">{paperDetails[key].name}</span>
                            <span className="text-[10px] text-gray-400 block mt-1">{paperDetails[key].desc}</span>
                          </div>
                          {paperStock === key && (
                            <div className="bg-indigo-600 text-white p-1 rounded-full flex-shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Copies counter */}
                  <div className="flex items-center justify-between p-3 bg-gray-950 border border-gray-850 rounded-xl">
                    <div>
                      <span className="text-xs font-semibold text-gray-300 block">Número de Copias</span>
                      <span className="text-[10px] text-gray-500 block">Formato A4 por duplicado</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCopies(Math.max(1, copies - 1))}
                        className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 text-lg flex items-center justify-center font-bold hover:bg-gray-850"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-white w-5 text-center">{copies}</span>
                      <button
                        type="button"
                        onClick={() => setCopies(copies + 1)}
                        className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 text-lg flex items-center justify-center font-bold hover:bg-gray-850"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Estimation summary */}
                  <div className="p-4 bg-gray-950 border border-gray-850 rounded-xl space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Costo de Impresión:</span>
                      <span className="text-gray-200">{(copies * 1.50).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Gastos de Envío:</span>
                      <span className="text-emerald-400 font-bold">¡GRATIS!</span>
                    </div>
                    <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-gray-900">
                      <span>Total Estimado:</span>
                      <span className="text-indigo-400">{(copies * 1.50).toFixed(2)} €</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingService}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {isSubmittingService ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transmitiendo archivo PDF A4...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        Enviar PDF a Imprenta Local y Continuar
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
