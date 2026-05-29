import { CollageCanvasConfig, CollageItem, TextBox, DecoSticker, IMAGE_FILTERS } from './types';

/**
 * Helper to load an image asynchronously.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Error cargando imagen: ' + src));
    img.src = src;
  });
}

/**
 * Draws a beautiful flat-vector landscape illustration in empty slots as aesthetic placeholder.
 */
export function drawPlaceholderArt(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  slotIndex: number
) {
  ctx.save();
  // Clip to the slot bounds
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();

  // Distinct palettes based on slotIndex for visual richness
  const palettes = [
    { sky: '#EBF3F5', sun: '#FDA085', hill1: '#A8DADC', hill2: '#457B9D', ground: '#1D3557' },
    { sky: '#FAF6F0', sun: '#F4A261', hill1: '#E9C46A', hill2: '#F4A261', ground: '#264653' },
    { sky: '#F9EBEA', sun: '#FFB7B2', hill1: '#FFDAC1', hill2: '#E2F0CB', ground: '#B5E2FA' },
    { sky: '#EEBEE03', sun: '#FFCAD4', hill1: '#D8E2DC', hill2: '#FFE5D9', ground: '#9C89B8' },
  ];
  const p = palettes[slotIndex % palettes.length];

  // Draw sky
  ctx.fillStyle = p.sky;
  ctx.fillRect(0, 0, w, h);

  // Draw sun
  ctx.beginPath();
  const sunRadius = Math.min(w, h) * 0.18;
  ctx.arc(w * 0.65, h * 0.35, sunRadius, 0, Math.PI * 2);
  ctx.fillStyle = p.sun;
  ctx.fill();

  // Draw background mountain
  ctx.beginPath();
  ctx.moveTo(-10, h * 0.7);
  ctx.quadraticCurveTo(w * 0.3, h * 0.4, w * 0.7, h * 0.75);
  ctx.lineTo(w + 10, h * 0.75);
  ctx.lineTo(w + 10, h + 10);
  ctx.lineTo(-10, h + 10);
  ctx.closePath();
  ctx.fillStyle = p.hill1;
  ctx.fill();

  // Draw secondary mountain
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.8);
  ctx.quadraticCurveTo(w * 0.65, h * 0.55, w + 10, h * 0.7);
  ctx.lineTo(w + 10, h + 10);
  ctx.lineTo(w * 0.3, h + 10);
  ctx.closePath();
  ctx.fillStyle = p.hill2;
  ctx.fill();

  // Draw foreground ground/hills
  ctx.beginPath();
  ctx.moveTo(-10, h * 0.82);
  ctx.quadraticCurveTo(w * 0.4, h * 0.65, w + 10, h * 0.85);
  ctx.lineTo(w + 10, h + 10);
  ctx.lineTo(-10, h + 10);
  ctx.closePath();
  ctx.fillStyle = p.ground;
  ctx.fill();

  // Draw some tiny organic bird V-shapes
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = Math.max(1.5, Math.min(w, h) * 0.005);
  ctx.beginPath();
  const birdX = w * 0.25;
  const birdY = h * 0.25;
  const birdS = Math.min(w, h) * 0.03;
  ctx.moveTo(birdX - birdS, birdY);
  ctx.quadraticCurveTo(birdX - birdS/2, birdY - birdS/2, birdX, birdY);
  ctx.quadraticCurveTo(birdX + birdS/2, birdY - birdS/2, birdX + birdS, birdY);
  ctx.stroke();

  // Draw "Añadir foto" UI text inside placeholder
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.font = `bold ${Math.max(12, Math.min(w, h) * 0.065)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ Haz clic para foto', w / 2, h / 2 + Math.min(w, h) * 0.1);

  ctx.restore();
}

/**
 * Helper to build custom clip paths
 */
export function clipPathToShape(
  ctx: CanvasRenderingContext2D,
  shape: string | undefined,
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (shape === 'circle') {
    ctx.beginPath();
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
  } else if (shape === 'oval') {
    ctx.beginPath();
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.clip();
  } else if (shape === 'hexagon') {
    ctx.beginPath();
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rw = w / 2;
    const rh = h / 2;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = cx + rw * Math.cos(angle);
      const py = cy + rh * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.clip();
  } else if (shape === 'star') {
    ctx.beginPath();
    const cx = x + w / 2;
    const cy = y + h / 2;
    const spikes = 5;
    const outerRadius = Math.min(w, h) / 2;
    const innerRadius = outerRadius * 0.4;
    let rot = (Math.PI / 2) * 3;
    let px = cx;
    let py = cy;
    const step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      px = cx + Math.cos(rot) * outerRadius;
      py = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(px, py);
      rot += step;

      px = cx + Math.cos(rot) * innerRadius;
      py = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(px, py);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.clip();
  } else if (shape === 'heart') {
    ctx.beginPath();
    const cx = x + w / 2;
    const cy = y + h * 0.35;
    const size = Math.min(w, h) * 0.9;
    
    // Draw heart path
    ctx.moveTo(cx, cy);
    // top right arc
    ctx.bezierCurveTo(cx + size/4, cy - size/3, cx + size/2, cy - size/10, cx + size/2, cy + size/5);
    // down to bottom tip
    ctx.bezierCurveTo(cx + size/2, cy + size/2, cx + size/6, cy + size*0.7, cx, y + h - size*0.05);
    // down left side
    ctx.bezierCurveTo(cx - size/6, cy + size*0.7, cx - size/2, cy + size/2, cx - size/2, cy + size/5);
    // top left arc
    ctx.bezierCurveTo(cx - size/2, cy - size/10, cx - size/4, cy - size/3, cx, cy);
    ctx.closePath();
    ctx.clip();
  } else {
    // Standard rectangle - just clip to bounding rect
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
  }
}

/**
 * Main export function drawing to high quality canvas.
 */
export async function renderCollage(
  canvas: HTMLCanvasElement,
  config: CollageCanvasConfig,
  items: CollageItem[],
  texts: TextBox[],
  stickers: DecoSticker[],
  templateSlots: any[], // grid template slots
  isHighRes: boolean = false
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Calculate dimensions (Portrait vs Landscape)
  // A4 ratio 1:1.4142. Standard 300 DPI: Portrait is 2480x3508px, Preview scale displays 500x707px
  let width = 600;
  let height = 848; // default preview size

  if (isHighRes) {
    width = config.orientation === 'portrait' ? 2480 : 3508;
    height = config.orientation === 'portrait' ? 3508 : 2480;
  } else {
    width = config.orientation === 'portrait' ? 600 : 848;
    height = config.orientation === 'portrait' ? 848 : 600;
  }

  canvas.width = width;
  canvas.height = height;

  // Enable high-fidelity settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Scale constants based on drawing size vs reference preview size
  const scaleMultiplier = width / 600;

  // 2. Draw Page Background
  ctx.save();
  if (config.gradientEnabled && config.backgroundGradient) {
    // Parse linear-gradient styles simple or create standard canvas gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (config.backgroundGradient.includes('#')) {
      // Find all hex codes in string
      const hexMatches = config.backgroundGradient.match(/#[0-9A-Fa-f]{6}/g);
      if (hexMatches && hexMatches.length >= 2) {
        grad.addColorStop(0, hexMatches[0]);
        grad.addColorStop(1, hexMatches[hexMatches.length - 1]);
      } else {
        // Fallbacks
        grad.addColorStop(0, '#E0C3FC');
        grad.addColorStop(1, '#8EC5FC');
      }
    } else {
      grad.addColorStop(0, '#FAF6F0');
      grad.addColorStop(1, '#EFEBE9');
    }
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = config.backgroundColor || '#FFFFFF';
  }
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // 3. Draw outer page margin inside
  // Translate coordinate system inside outer margin
  const marginPx = config.margin * scaleMultiplier * 1.5; // mm-ish scale to px
  const activeW = width - marginPx * 2;
  const activeH = height - marginPx * 2;

  // Let's load all images in parallel
  const loadedImages: Record<string, HTMLImageElement> = {};
  const imageLoadPromises = items
    .filter((item) => item.imageUrl)
    .map(async (item) => {
      try {
        const loaded = await loadImage(item.imageUrl!);
        loadedImages[item.id] = loaded;
      } catch (err) {
        console.error('No se pudo cargar la imagen del item: ' + item.id, err);
      }
    });

  await Promise.all(imageLoadPromises);

  // 4. Draw collage components (Grid Slots or Freeform)
  const isFreeform = templateSlots.length === 0;

  if (!isFreeform) {
    // RENDER PRESET GRID
    // Incorporate gridGap (mm turned into px)
    const gapPx = config.gridGap * scaleMultiplier * 1.2;

    for (let i = 0; i < templateSlots.length; i++) {
      const slot = templateSlots[i];
      
      // Calculate scaled coordinate positions of this slot within active area
      // gridGap is applied as margin around slot bounds
      const xPct = slot.x / 100;
      const yPct = slot.y / 100;
      const wPct = slot.w / 100;
      const hPct = slot.h / 100;

      // Slot absolute rectangle on canvas
      let slotX = marginPx + xPct * activeW;
      let slotY = marginPx + yPct * activeH;
      let slotWidth = wPct * activeW;
      let slotHeight = hPct * activeH;

      // Subtract gaps
      slotX += gapPx / 2;
      slotY += gapPx / 2;
      slotWidth -= gapPx;
      slotHeight -= gapPx;

      // Find item bound to this slot
      const boundItem = items.find((it) => it.slotId === slot.id);

      ctx.save();

      // Shape clipping
      clipPathToShape(ctx, slot.shape, slotX, slotY, slotWidth, slotHeight);

      // Draw slot background representation
      ctx.fillStyle = '#E5E7EB'; // Slate placeholder grey
      ctx.fillRect(slotX, slotY, slotWidth, slotHeight);

      if (boundItem && boundItem.imageUrl && loadedImages[boundItem.id]) {
        // Draw the image with fit & transform offsets
        const img = loadedImages[boundItem.id];
        ctx.save();
        
        // Secondary clip inside image parameters in case shapes overlap
        clipPathToShape(ctx, slot.shape, slotX, slotY, slotWidth, slotHeight);

        // Apply filters
        const activeFilter = IMAGE_FILTERS.find((f) => f.value === boundItem.filter);
        if (activeFilter && activeFilter.style !== 'none') {
          ctx.filter = activeFilter.style;
        } else {
          ctx.filter = 'none';
        }

        // Calculate filling scale (Cover scale)
        const imgAspect = img.width / img.height;
        const slotAspect = slotWidth / slotHeight;
        let coverScale = 1;

        if (imgAspect > slotAspect) {
          // Image is wider
          coverScale = slotHeight / img.height;
        } else {
          // Image is taller
          coverScale = slotWidth / img.width;
        }

        const finalScale = coverScale * boundItem.scale;

        // Position transformations
        const centerX = slotX + slotWidth / 2;
        const centerY = slotY + slotHeight / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate((boundItem.rotation * Math.PI) / 180);

        // Apply manual pan offset (relative to slot shape size)
        const panX = (boundItem.offsetX / 100) * slotWidth;
        const panY = (boundItem.offsetY / 100) * slotHeight;
        ctx.translate(panX, panY);

        // Draw image centered
        const drawW = img.width * finalScale;
        const drawH = img.height * finalScale;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

        ctx.restore(); // restores image transformations & filters
      } else {
        // Draw gorgeous custom illustration fallback
        drawPlaceholderArt(ctx, slotWidth, slotHeight, i);
        // Translate visual coordinates for printing text label
        ctx.save();
        ctx.translate(slotX, slotY);
        ctx.restore();
      }

      ctx.restore(); // restores slot clip

      // Draw Slot Borders (Outside Clip)
      ctx.save();
      const bColor = boundItem?.borderColor || config.borderColor || '#FFFFFF';
      const bWidth = (boundItem?.borderWidth !== undefined ? boundItem.borderWidth : config.borderWidth) * scaleMultiplier * 0.45;
      
      if (bWidth > 0) {
        ctx.strokeStyle = bColor;
        ctx.lineWidth = bWidth;
        
        // Border path matching shapes trace
        if (slot.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(slotX + slotWidth / 2, slotY + slotHeight / 2, Math.min(slotWidth, slotHeight) / 2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (slot.shape === 'oval') {
          ctx.beginPath();
          ctx.ellipse(slotX + slotWidth / 2, slotY + slotHeight / 2, slotWidth / 2, slotHeight / 2, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (slot.shape === 'hexagon') {
          ctx.beginPath();
          const cx = slotX + slotWidth / 2;
          const cy = slotY + slotHeight / 2;
          for (let k = 0; k < 6; k++) {
            const angle = (Math.PI / 3) * k - Math.PI / 6;
            const px = cx + (slotWidth / 2) * Math.cos(angle);
            const py = cy + (slotHeight / 2) * Math.sin(angle);
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        } else if (slot.shape === 'star') {
          ctx.beginPath();
          const cx = slotX + slotWidth / 2;
          const cy = slotY + slotHeight / 2;
          const spikes = 5;
          const r1 = Math.min(slotWidth, slotHeight) / 2;
          const r2 = r1 * 0.4;
          let rot = (Math.PI / 2) * 3;
          ctx.moveTo(cx, cy - r1);
          for (let k = 0; k < spikes; k++) {
            ctx.lineTo(cx + Math.cos(rot) * r1, cy + Math.sin(rot) * r1);
            rot += Math.PI / spikes;
            ctx.lineTo(cx + Math.cos(rot) * r2, cy + Math.sin(rot) * r2);
            rot += Math.PI / spikes;
          }
          ctx.closePath();
          ctx.stroke();
        } else if (slot.shape === 'heart') {
          ctx.beginPath();
          const cx = slotX + slotWidth / 2;
          const cy = slotY + slotHeight * 0.35;
          const size = Math.min(slotWidth, slotHeight) * 0.9;
          ctx.moveTo(cx, cy);
          ctx.bezierCurveTo(cx + size/4, cy - size/3, cx + size/2, cy - size/10, cx + size/2, cy + size/5);
          ctx.bezierCurveTo(cx + size/2, cy + size/2, cx + size/6, cy + size*0.7, cx, slotY + slotHeight - size*0.05);
          ctx.bezierCurveTo(cx - size/6, cy + size*0.7, cx - size/2, cy + size/2, cx - size/2, cy + size/5);
          ctx.bezierCurveTo(cx - size/2, cy - size/10, cx - size/4, cy - size/3, cx, cy);
          ctx.closePath();
          ctx.stroke();
        } else {
          // Simple rectangle border
          ctx.strokeRect(slotX, slotY, slotWidth, slotHeight);
        }
      }
      ctx.restore();
    }
  } else {
    // RENDER FREEFORM ELEMENTS
    // Sorted by zIndex to draw back-to-front
    const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);

    for (let it of sortedItems) {
      const itX = marginPx + ((it.x || 10) / 100) * activeW;
      const itY = marginPx + ((it.y || 10) / 100) * activeH;
      const itW = ((it.w || 30) / 100) * activeW;
      const itH = ((it.h || 30) / 100) * activeH;

      ctx.save();

      // Shadow overlay if enabled
      if (config.shadowEnabled) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 10 * scaleMultiplier;
        ctx.shadowOffsetX = 4 * scaleMultiplier;
        ctx.shadowOffsetY = 4 * scaleMultiplier;
      }

      // Border and general layout clip path (usually rectangular Polaroid style)
      ctx.beginPath();
      ctx.rect(itX, itY, itW, itH);
      
      // Draw background frame (Polaroid/Postcard backing)
      ctx.fillStyle = it.borderColor || '#FFFFFF';
      ctx.fillRect(itX, itY, itW, itH);
      ctx.restore();

      // Draw inside image
      ctx.save();
      // Visual photo area (sub-rectangle with margins to simulate a gorgeous Polaroid or framed photo)
      // Standard Polaroid template: 5% left/right, 5% top, 15% bottom padding
      const leftPad = itW * 0.06;
      const topPad = itH * 0.06;
      const rightPad = itW * 0.06;
      const bottomPad = itH * 0.15; // lower space for writings!

      const photoX = itX + leftPad;
      const photoY = itY + topPad;
      const photoW = itW - leftPad - rightPad;
      const photoH = itH - topPad - bottomPad;

      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();

      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(photoX, photoY, photoW, photoH);

      if (it.imageUrl && loadedImages[it.id]) {
        const img = loadedImages[it.id];
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoW, photoH);
        ctx.clip();

        // Filters
        const activeFilter = IMAGE_FILTERS.find((f) => f.value === it.filter);
        if (activeFilter && activeFilter.style !== 'none') {
          ctx.filter = activeFilter.style;
        }

        // Render Cover
        const imgAspect = img.width / img.height;
        const photoAspect = photoW / photoH;
        let coverScale = 1;

        if (imgAspect > photoAspect) {
          coverScale = photoH / img.height;
        } else {
          coverScale = photoW / img.width;
        }

        const finalScale = coverScale * it.scale;
        const cenX = photoX + photoW / 2;
        const cenY = photoY + photoH / 2;

        ctx.translate(cenX, cenY);
        ctx.rotate((it.rotation * Math.PI) / 180);
        
        const panX = (it.offsetX / 100) * photoW;
        const panY = (it.offsetY / 100) * photoH;
        ctx.translate(panX, panY);

        const dW = img.width * finalScale;
        const dH = img.height * finalScale;
        ctx.drawImage(img, -dW / 2, -dH / 2, dW, dH);
        ctx.restore();
      } else {
        // Draw miniature illustration placeholder
        drawPlaceholderArt(ctx, photoW, photoH, 0);
      }
      ctx.restore();

      // Border outline around photo
      if (it.borderWidth > 0) {
        ctx.save();
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = it.borderWidth * scaleMultiplier * 0.3;
        ctx.strokeRect(photoX, photoY, photoW, photoH);
        ctx.restore();
      }
    }
  }

  // 5. Draw Stickers (DecoSticker)
  for (let sticker of stickers) {
    const sX = marginPx + (sticker.x / 100) * activeW;
    const sY = marginPx + (sticker.y / 100) * activeH;
    const sSize = (sticker.size / 100) * Math.min(activeW, activeH);

    ctx.save();
    ctx.translate(sX, sY);
    ctx.rotate((sticker.rotation * Math.PI) / 180);

    ctx.fillStyle = sticker.color || '#F43F5E';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3 * scaleMultiplier;

    // Vector drawing according to sticker.type
    ctx.beginPath();
    if (sticker.type === 'heart') {
      // Draw Heart
      const size = sSize;
      ctx.moveTo(0, -size / 4);
      ctx.bezierCurveTo(size / 3, -size * 0.6, size * 0.75, -size / 4, size * 0.75, size / 8);
      ctx.bezierCurveTo(size * 0.75, size * 0.45, size / 4, size * 0.75, 0, size * 0.95);
      ctx.bezierCurveTo(-size / 4, size * 0.75, -size * 0.75, size * 0.45, -size * 0.75, size / 8);
      ctx.bezierCurveTo(-size * 0.75, -size / 4, -size / 3, -size * 0.6, 0, -size / 4);
    } else if (sticker.type === 'star') {
      // Draw Star
      const spikes = 5;
      const r1 = sSize / 1.2;
      const r2 = r1 * 0.45;
      let rot = (Math.PI / 2) * 3;
      ctx.moveTo(0, -r1);
      for (let k = 0; k < spikes; k++) {
        ctx.lineTo(Math.cos(rot) * r1, Math.sin(rot) * r1);
        rot += Math.PI / spikes;
        ctx.lineTo(Math.cos(rot) * r2, Math.sin(rot) * r2);
        rot += Math.PI / spikes;
      }
    } else if (sticker.type === 'sparkles') {
      // Gorgeous 4-pointed star sparkles
      const size = sSize;
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(0, 0, size, 0);
      ctx.quadraticCurveTo(0, 0, 0, size);
      ctx.quadraticCurveTo(0, 0, -size, 0);
      ctx.quadraticCurveTo(0, 0, 0, -size);
    } else if (sticker.type === 'pin') {
      // Map PIN / pushpin style
      const size = sSize;
      ctx.arc(0, -size / 3, size / 3, 0, Math.PI * 2);
      ctx.fillStyle = sticker.color || '#EF4444';
      ctx.fill();
      ctx.stroke();
      
      // Pin stem
      ctx.beginPath();
      ctx.lineWidth = 4 * scaleMultiplier;
      ctx.strokeStyle = '#D1D5DB';
      ctx.moveTo(0, 0);
      ctx.lineTo(-size / 2, size / 2);
      ctx.stroke();
    } else if (sticker.type === 'camera') {
      const size = sSize * 0.8;
      ctx.rect(-size, -size/2, size*2, size);
      ctx.arc(0, 0, size/3, 0, Math.PI * 2);
    } else {
      // Fallback simple circle base
      ctx.arc(0, 0, sSize / 2, 0, Math.PI * 2);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 6. Draw Text Boxes (TextBox)
  for (let text of texts) {
    const tX = marginPx + (text.x / 100) * activeW;
    const tY = marginPx + (text.y / 100) * activeH;

    ctx.save();
    ctx.translate(tX, tY);
    ctx.rotate((text.rotation * Math.PI) / 180);

    // Dynamic Font Styling
    let fontName = 'sans-serif';
    if (text.fontFamily === 'font-serif') fontName = 'Playfair Display, Georgia, serif';
    else if (text.fontFamily === 'font-mono') fontName = 'JetBrains Mono, monospace';
    else if (text.fontFamily === 'font-display') fontName = 'Impact, Cabinet Grotesk, Arial Black, sans-serif';
    else if (text.fontFamily === 'font-handwritten') fontName = 'Gochi Hand, Comic Sans MS, cursive';

    const calculatedFontSize = text.fontSize * scaleMultiplier * 0.35; // scale down slightly for text point mapping
    const fontStyleString = `${text.fontStyle} ${text.fontWeight} ${calculatedFontSize}px ${fontName}`;
    ctx.font = fontStyleString;
    ctx.fillStyle = text.color;
    ctx.textAlign = text.align;
    ctx.textBaseline = 'middle';

    // Quick text width computation for padding background
    const metrics = ctx.measureText(text.text);
    const textW = metrics.width;
    const textH = calculatedFontSize;

    // Optional background highlight
    if (text.backgroundColor) {
      ctx.fillStyle = text.backgroundColor;
      let padX = 12 * scaleMultiplier;
      let padY = 6 * scaleMultiplier;
      let bgX = 0;
      if (text.align === 'center') bgX = -textW / 2 - padX;
      else if (text.align === 'right') bgX = -textW - padX;
      else bgX = -padX;

      ctx.fillRect(bgX, -textH / 2 - padY, textW + padX * 2, textH + padY * 2);
    }

    ctx.fillStyle = text.color;
    ctx.fillText(text.text, 0, 0);
    ctx.restore();
  }
}
