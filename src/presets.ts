import { CollageTemplate, CollageCanvasConfig } from './types';

export const COLOR_PALETTES = [
  // Elegant modern neutrals
  { name: 'Blanco Puro', value: '#FFFFFF' },
  { name: 'Alabastro', value: '#F9F9FB' },
  { name: 'Crema Suave', value: '#FAF6F0' },
  { name: 'Gris Bruma', value: '#F0F2F5' },
  { name: 'Lino Cálido', value: '#F1EFEA' },
  { name: 'Rosa Vintage', value: '#F9EBEA' },
  { name: 'Arena Fina', value: '#EFEBE9' },
  { name: 'Verde Salvia', value: '#EBF1ED' },
  { name: 'Azul Glaciar', value: '#EBF3F5' },
  { name: 'Arcilla', value: '#F5ECE3' },
  { name: 'Negro Profundo', value: '#121212' },
  { name: 'Grafito', value: '#2C3E50' },
];

export const GRADIENT_PALETTES = [
  { name: 'Suave Amanecer', value: 'linear-gradient(135deg, #FADAC1 0%, #FFD1FF 100%)' },
  { name: 'Brisa Marina', value: 'linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)' },
  { name: 'Atardecer Cálido', value: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)' },
  { name: 'Lavanda Dulce', value: 'linear-gradient(135deg, #E9DEF7 0%, #F5F7FA 100%)' },
  { name: 'Eucalipto', value: 'linear-gradient(135deg, #D4FC79 0%, #96E6A1 100%)' },
  { name: 'Polvo Celestial', value: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)' },
  { name: 'Dunas Silenciosas', value: 'linear-gradient(135deg, #FDFBF7 0%, #EFEBE9 100%)' },
  { name: 'Noche Nórdica', value: 'linear-gradient(135deg, #2C3E50 0%, #000000 100%)' },
  { name: 'Menta Fresca', value: 'linear-gradient(135deg, #A8F0DF 0%, #D8FCF4 100%)' },
  { name: 'Rosa Pastel', value: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)' },
];

export const DEFAULT_CONFIG: CollageCanvasConfig = {
  orientation: 'portrait',
  backgroundColor: '#FFFFFF',
  backgroundGradient: 'linear-gradient(135deg, #F9F9FB 0%, #EFEBE9 100%)',
  gradientEnabled: false,
  borderWidth: 8, // mm default
  borderColor: '#FFFFFF',
  borderRadius: 4, // px rounding
  margin: 10, // outer sheet margin
  gridGap: 6, // internal grid gaps
  showGridLines: false,
  shadowEnabled: true,
};

// Templates for Portrait A4 (height is 1.414 times width)
export const PORTRAIT_TEMPLATES: CollageTemplate[] = [
  {
    id: 'single-full',
    name: 'Solo una foto (A4 completo)',
    icon: 'rect-1',
    orientation: 'portrait',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 100, h: 100 }
    ]
  },
  {
    id: 'double-vertical',
    name: 'Doble vertical (Simétrico)',
    icon: 'cols-2',
    orientation: 'portrait',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 50, h: 100 },
      { id: 'slot-2', x: 50, y: 0, w: 50, h: 100 }
    ]
  },
  {
    id: 'double-horizontal',
    name: 'Doble horizontal',
    icon: 'rows-2',
    orientation: 'portrait',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 100, h: 50 },
      { id: 'slot-2', x: 0, y: 50, w: 100, h: 50 }
    ]
  },
  {
    id: 'classic-2x2',
    name: 'Cuadrícula 2x2',
    icon: 'grid-4',
    orientation: 'portrait',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 50, h: 50 },
      { id: 'slot-2', x: 50, y: 0, w: 50, h: 50 },
      { id: 'slot-3', x: 0, y: 50, w: 50, h: 50 },
      { id: 'slot-4', x: 50, y: 50, w: 50, h: 50 }
    ]
  },
  {
    id: 'modern-mosaic',
    name: 'Mosaico Asimétrico (Grande Izq)',
    icon: 'mosaic-l',
    orientation: 'portrait',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 50, h: 100 },
      { id: 'slot-2', x: 50, y: 0, w: 50, h: 50 },
      { id: 'slot-3', x: 50, y: 50, w: 50, h: 50 }
    ]
  },
  {
    id: 'triptych-vertical',
    name: 'Tríptico en columnas',
    icon: 'cols-3',
    orientation: 'portrait',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 33.33, h: 100 },
      { id: 'slot-2', x: 33.33, y: 0, w: 33.33, h: 100 },
      { id: 'slot-3', x: 66.66, y: 0, w: 33.33, h: 100 }
    ]
  },
  {
    id: 'triptych-horizontal',
    name: 'Tríptico en filas',
    icon: 'rows-3',
    orientation: 'portrait',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 100, h: 33.33 },
      { id: 'slot-2', x: 0, y: 33.33, w: 100, h: 33.33 },
      { id: 'slot-3', x: 0, y: 66.66, w: 100, h: 33.33 }
    ]
  },
  {
    id: 'bento-grid-5',
    name: 'Cuadrícula Bento (5 fotos)',
    icon: 'bento',
    orientation: 'portrait',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 60, h: 60 },
      { id: 'slot-2', x: 60, y: 0, w: 40, h: 30 },
      { id: 'slot-3', x: 60, y: 30, w: 40, h: 30 },
      { id: 'slot-4', x: 0, y: 60, w: 40, h: 40 },
      { id: 'slot-5', x: 40, y: 60, w: 60, h: 40 }
    ]
  },
  {
    id: 'creative-shapes-3',
    name: 'Formas Geométricas',
    icon: 'shapes-3',
    orientation: 'portrait',
    slots: [
      { id: 'slot-1', x: 5, y: 5, w: 90, h: 40, shape: 'oval' },
      { id: 'slot-2', x: 5, y: 50, w: 42, h: 45, shape: 'circle' },
      { id: 'slot-3', x: 53, y: 50, w: 42, h: 45, shape: 'hexagon' }
    ]
  },
  {
    id: 'heart-collage-3',
    name: 'Foco en Círculo',
    icon: 'circle-focus',
    orientation: 'portrait',
    slots: [
      { id: 'slot-1', x: 10, y: 15, w: 80, h: 50, shape: 'circle' },
      { id: 'slot-2', x: 5, y: 70, w: 42, h: 25, shape: 'rect' },
      { id: 'slot-3', x: 53, y: 70, w: 42, h: 25, shape: 'rect' }
    ]
  },
  {
    id: 'freeform',
    name: '✨ Estilo Libre (Scrapbook)',
    icon: 'free',
    orientation: 'portrait',
    slots: [] // Handled customly in freeform drag and drops
  }
];

// Templates for Landscape A4 (width is 1.414 times height)
export const LANDSCAPE_TEMPLATES: CollageTemplate[] = [
  {
    id: 'single-full-l',
    name: 'Solo una foto (A4 completo)',
    icon: 'rect-1',
    orientation: 'landscape',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 100, h: 100 }
    ]
  },
  {
    id: 'double-horizontal-l',
    name: 'Doble horizontal (Filas)',
    icon: 'rows-2',
    orientation: 'landscape',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 100, h: 50 },
      { id: 'slot-2', x: 0, y: 50, w: 100, h: 50 }
    ]
  },
  {
    id: 'double-vertical-l',
    name: 'Doble vertical (Columnas)',
    icon: 'cols-2',
    orientation: 'landscape',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 50, h: 100 },
      { id: 'slot-2', x: 50, y: 0, w: 50, h: 100 }
    ]
  },
  {
    id: 'classic-2x2-l',
    name: 'Cuadrícula 2x2',
    icon: 'grid-4',
    orientation: 'landscape',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 50, h: 50 },
      { id: 'slot-2', x: 50, y: 0, w: 50, h: 50 },
      { id: 'slot-3', x: 0, y: 50, w: 50, h: 50 },
      { id: 'slot-4', x: 50, y: 50, w: 50, h: 50 }
    ]
  },
  {
    id: 'modern-mosaic-l',
    name: 'Mosaico Horizontal (Grande Abajo)',
    icon: 'mosaic-h',
    orientation: 'landscape',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 50, h: 50 },
      { id: 'slot-2', x: 50, y: 0, w: 50, h: 50 },
      { id: 'slot-3', x: 0, y: 50, w: 100, h: 50 }
    ]
  },
  {
    id: 'cinema-triptych-l',
    name: 'Tríptico en columnas',
    icon: 'cols-3',
    orientation: 'landscape',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 33.33, h: 100 },
      { id: 'slot-2', x: 33.33, y: 0, w: 33.33, h: 100 },
      { id: 'slot-3', x: 66.66, y: 0, w: 33.33, h: 100 }
    ]
  },
  {
    id: 'bento-grid-5-l',
    name: 'Cuadrícula Bento (5 fotos)',
    icon: 'bento',
    orientation: 'landscape',
    slots: [
      { id: 'slot-1', x: 0, y: 0, w: 40, h: 100 },
      { id: 'slot-2', x: 40, y: 0, w: 30, h: 50 },
      { id: 'slot-3', x: 70, y: 0, w: 30, h: 50 },
      { id: 'slot-4', x: 40, y: 50, w: 30, h: 50 },
      { id: 'slot-5', x: 70, y: 50, w: 30, h: 50 }
    ]
  },
  {
    id: 'sweet-oval-landscape',
    name: 'Óvalo Central con Laterales',
    icon: 'shapes-oval-h',
    orientation: 'landscape',
    slots: [
      { id: 'slot-1', x: 5, y: 5, w: 25, h: 90, shape: 'rect' },
      { id: 'slot-2', x: 32.5, y: 5, w: 35, h: 90, shape: 'oval' },
      { id: 'slot-3', x: 70, y: 5, w: 25, h: 90, shape: 'rect' }
    ]
  },
  {
    id: 'freeform-l',
    name: '✨ Estilo Libre (Scrapbook)',
    icon: 'free',
    orientation: 'landscape',
    slots: [] // Handled customly in freeform drag and drops
  }
];
