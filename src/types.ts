/**
 * Types defining the file collager and all its customizable components.
 */

export type PageOrientation = 'portrait' | 'landscape';

export type ImageFilter =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'vintage'
  | 'warm'
  | 'cool'
  | 'dramatic'
  | 'retro-fade'
  | 'blur';

export interface GridSlot {
  id: string;
  x: number; // 0-100 percentage of the parent canvas
  y: number; // 0-100 percentage of the parent canvas
  w: number; // 0-100 percentage width
  h: number; // 0-100 percentage height
  shape?: 'rect' | 'circle' | 'heart' | 'star' | 'hexagon' | 'oval';
}

export interface CollageTemplate {
  id: string;
  name: string;
  icon: string; // Identifier for preview rendering
  orientation: PageOrientation;
  slots: GridSlot[];
}

export interface CollageItem {
  id: string;
  imageUrl: string | null;
  // Positioning inside its slot
  scale: number; // zoom multiplier (e.g. 1.0 to 3.0)
  rotation: number; // rotation in degrees
  offsetX: number; // percent adjustment within crop frame (-100 to 100)
  offsetY: number; // percent adjustment within crop frame (-100 to 100)
  filter: ImageFilter;
  
  // Custom styling override per item (if applicable)
  borderColor: string;
  borderWidth: number;
  borderRadius: number;

  // Grid bound info
  slotId?: string; // If bound to a grid, reference the slot here

  // Freeform absolute positions (0-100 % of canvas canvas)
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  zIndex: number;
}

export interface TextBox {
  id: string;
  text: string;
  fontFamily: 'font-sans' | 'font-serif' | 'font-mono' | 'font-display' | 'font-handwritten';
  fontSize: number; // 12 to 120
  color: string;
  borderColor?: string;
  backgroundColor?: string; // bg opacity can be controlled
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  align: 'left' | 'center' | 'right';
  x: number; // percentage coordinate 0-100
  y: number; // percentage coordinate 0-100
  rotation: number; // degree
  zIndex: number;
}

export interface WashiTape {
  id: string;
  color: string;
  opacity: number; // 0-1
  width: number; // size on canvas %
  height: number;
  x: number; // percentage coord 0-100
  y: number; // percentage coord 0-100
  rotation: number; // degree
  zIndex: number;
}

export interface DecoSticker {
  id: string;
  type: 'heart' | 'star' | 'pin' | 'camera' | 'flower' | 'sparkles' | 'crown' | 'thumbs-up' | 'smile' | 'date';
  color: string;
  size: number; // percentage size 2 to 20
  x: number; // percentage coord 0-100
  y: number; // percentage coord 0-100
  rotation: number; // degree
  zIndex: number;
}

export interface CollageCanvasConfig {
  orientation: PageOrientation;
  backgroundColor: string;
  backgroundGradient: string; // Tailwind class description or standard linear gradient
  gradientEnabled: boolean;
  borderWidth: number; // overall page border in mm/px
  borderColor: string;
  borderRadius: number; // corner roundings
  margin: number; // page outer margin (padding in mm/px)
  gridGap: number; // grid space between images
  showGridLines: boolean;
  shadowEnabled: boolean;
}

export const FONT_OPTIONS = [
  { value: 'font-sans', label: 'Inter (Sans)' },
  { value: 'font-serif', label: 'Playfair (Serif)' },
  { value: 'font-mono', label: 'JetBrains (Mono)' },
  { value: 'font-display', label: 'Cabinet (Extra bold)' },
  { value: 'font-handwritten', label: 'Gochi Hand (Escrito a mano)' },
];

export const IMAGE_FILTERS = [
  { value: 'none', label: 'Original', style: 'none' },
  { value: 'grayscale', label: 'Byn (Grayscale)', style: 'grayscale(100%)' },
  { value: 'sepia', label: 'Sepia', style: 'sepia(100%)' },
  { value: 'vintage', label: 'Vintage', style: 'sepia(40%) contrast(110%) saturate(80%) hue-rotate(-10deg)' },
  { value: 'warm', label: 'Cálido (Warm)', style: 'saturate(130%) contrast(110%) sepia(10%)' },
  { value: 'cool', label: 'Frío (Cool)', style: 'saturate(80%) contrast(115%) hue-rotate(15deg) brightness(105%)' },
  { value: 'dramatic', label: 'Dramático', style: 'contrast(140%) brightness(90%)' },
  { value: 'retro-fade', label: 'Retro Deslavado', style: 'contrast(85%) brightness(110%) saturate(85%) sepia(15%)' },
  { value: 'blur', label: 'Desenfoque (Blur)', style: 'blur(3px)' },
];
