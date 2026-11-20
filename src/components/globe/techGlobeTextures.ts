import * as THREE from 'three';
import { GlobeSkillNode } from '../../utils/techGlobeLogic';

export interface PlanetTextureSet {
  albedoMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

/**
 * Deterministic pseudo-noise for procedural continental tech-cluster landmasses
 * on the equirectangular planet surface (zero external image files / 404s).
 */
function continentField(lonRad: number, latRad: number): number {
  const x = Math.cos(latRad) * Math.cos(lonRad);
  const y = Math.sin(latRad);
  const z = Math.cos(latRad) * Math.sin(lonRad);

  const n1 = Math.sin(x * 3.1 + z * 2.4) * Math.cos(y * 2.8 - x * 1.3);
  const n2 = Math.sin(z * 5.2 - y * 4.1) * Math.cos(x * 4.3 + z * 2.1) * 0.5;
  const n3 = Math.cos((x + y + z) * 7.5) * 0.22;
  return n1 + n2 + n3;
}

/**
 * Generates paired albedo (SRGB) and bump (linear) equirectangular textures
 * for the futuristic technological planet core.
 */
export function createPlanetSurfaceTextures(maxAnisotropy: number): PlanetTextureSet {
  const width = 1024;
  const height = 512;

  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = width;
  albedoCanvas.height = height;
  const ctx = albedoCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Deep midnight cobalt oceanic base gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0E1C36');
  oceanGrad.addColorStop(0.18, '#09142A');
  oceanGrad.addColorStop(0.5, '#0C1A34');
  oceanGrad.addColorStop(0.82, '#09142A');
  oceanGrad.addColorStop(1, '#0E1C36');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  bCtx.fillStyle = '#383838';
  bCtx.fillRect(0, 0, width, height);

  // Subtle continental tech-dot matrix clusters
  const stepX = 8;
  const stepY = 8;
  for (let py = stepY; py < height - stepY; py += stepY) {
    const v = py / height;
    const latRad = (0.5 - v) * Math.PI;
    // Skip very dense polar distortion
    if (Math.abs(latRad) > Math.PI * 0.44) continue;

    for (let px = 0; px < width; px += stepX) {
      const u = px / width;
      const lonRad = (u - 0.5) * Math.PI * 2;
      const val = continentField(lonRad, latRad);

      if (val > 0.24) {
        const intensity = Math.min(1, (val - 0.24) * 1.45);
        // Subtle elevated slate-blue tectonic plate fill
        ctx.fillStyle = `rgba(37, 99, 235, ${(0.08 + intensity * 0.14).toFixed(3)})`;
        ctx.fillRect(px - 3, py - 3, 6, 6);

        // Crisp glowing matrix micro-dot
        ctx.fillStyle = `rgba(96, 165, 250, ${(0.24 + intensity * 0.34).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.15 + intensity * 0.65, 0, Math.PI * 2);
        ctx.fill();

        const bVal = Math.round(95 + intensity * 120);
        bCtx.fillStyle = `rgb(${bVal}, ${bVal}, ${bVal})`;
        bCtx.fillRect(px - 2, py - 2, 4, 4);
      }
    }
  }

  // Fine technological latitude & longitude graticules
  ctx.lineWidth = 1;
  for (let i = 1; i < 12; i += 1) {
    const y = (i / 12) * height;
    const isEquator = i === 6;
    ctx.strokeStyle = isEquator
      ? 'rgba(96, 165, 250, 0.34)'
      : 'rgba(148, 163, 184, 0.14)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    bCtx.strokeStyle = isEquator ? '#909090' : '#585858';
    bCtx.beginPath();
    bCtx.moveTo(0, y);
    bCtx.lineTo(width, y);
    bCtx.stroke();
  }

  for (let j = 0; j < 24; j += 1) {
    const x = (j / 24) * width;
    const isMajor = j % 6 === 0;
    ctx.strokeStyle = isMajor
      ? 'rgba(96, 165, 250, 0.26)'
      : 'rgba(148, 163, 184, 0.11)';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Subtle circuit-trace meridian accents near the tropics
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
  ctx.lineWidth = 1.25;
  for (let t = 0; t < 8; t += 1) {
    const startX = (t / 8) * width + 24;
    const yBand = t % 2 === 0 ? height * 0.36 : height * 0.64;
    ctx.beginPath();
    ctx.moveTo(startX, yBand);
    ctx.lineTo(startX + 42, yBand);
    ctx.lineTo(startX + 54, yBand + (t % 2 === 0 ? -12 : 12));
    ctx.lineTo(startX + 94, yBand + (t % 2 === 0 ? -12 : 12));
    ctx.stroke();
  }

  const albedoMap = new THREE.CanvasTexture(albedoCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  albedoMap.wrapS = THREE.RepeatWrapping;
  albedoMap.wrapT = THREE.ClampToEdgeWrapping;
  albedoMap.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.anisotropy = maxAnisotropy;

  return { albedoMap, bumpMap };
}

/**
 * Draws a sharp bespoke vector technology icon centered at (cx, cy) with radius r.
 */
function drawTechGlyph(
  ctx: CanvasRenderingContext2D,
  skillName: string,
  cx: number,
  cy: number,
  r: number,
  accentHex: string
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = '#F8FAFC';
  ctx.fillStyle = '#F8FAFC';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const key = skillName.toLowerCase();

  if (key.includes('react.js') || key === 'react') {
    // React 3-orbit atom
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 3; i += 1) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.88, r * 0.36, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.19, 0, Math.PI * 2);
    ctx.fill();
  } else if (key.includes('react router')) {
    // Branching route nodes
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-r * 0.65, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(r * 0.55, -r * 0.45);
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.55, r * 0.45);
    ctx.stroke();
    const pts = [
      [-r * 0.65, 0],
      [r * 0.55, -r * 0.45],
      [r * 0.55, r * 0.45],
    ];
    ctx.fillStyle = '#F8FAFC';
    for (const [px, py] of pts) {
      ctx.beginPath();
      ctx.arc(px, py, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (key === 'typescript') {
    ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#60A5FA';
    ctx.fillText('TS', 0, 1);
  } else if (key === 'javascript') {
    ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FACC15';
    ctx.fillText('JS', 0, 1);
  } else if (key === 'java') {
    // Stylized Java coffee cup + steam waves
    ctx.strokeStyle = '#93C5FD';
    ctx.beginPath();
    ctx.moveTo(-r * 0.48, -r * 0.05);
    ctx.lineTo(-r * 0.36, r * 0.55);
    ctx.lineTo(r * 0.28, r * 0.55);
    ctx.lineTo(r * 0.4, -r * 0.05);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r * 0.42, r * 0.22, r * 0.2, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.strokeStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.moveTo(-r * 0.16, -r * 0.28);
    ctx.quadraticCurveTo(-r * 0.3, -r * 0.5, -r * 0.1, -r * 0.68);
    ctx.moveTo(r * 0.14, -r * 0.28);
    ctx.quadraticCurveTo(0, -r * 0.5, r * 0.2, -r * 0.68);
    ctx.stroke();
  } else if (key === 'html5') {
    ctx.font = '800 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FB923C';
    ctx.fillText('</>', 0, 1);
  } else if (key === 'css3') {
    ctx.font = '800 19px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('{ }', 0, 0);
  } else if (key.includes('tailwind')) {
    // Dual aerodynamic Tailwind wave curves
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r * 0.68, -r * 0.18);
    ctx.bezierCurveTo(-r * 0.35, -r * 0.65, r * 0.15, r * 0.15, r * 0.68, -r * 0.25);
    ctx.moveTo(-r * 0.68, r * 0.32);
    ctx.bezierCurveTo(-r * 0.35, -r * 0.15, r * 0.15, r * 0.65, r * 0.68, r * 0.25);
    ctx.stroke();
  } else if (key.includes('node.js')) {
    // Hexagon Node emblem
    ctx.strokeStyle = '#4ADE80';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const ang = (Math.PI / 3) * i - Math.PI / 2;
      const px = Math.cos(ang) * r * 0.78;
      const py = Math.sin(ang) * r * 0.78;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.font = '800 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#86EFAC';
    ctx.fillText('JS', 0, 1);
  } else if (key.includes('express')) {
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#C7D2FE';
    ctx.fillText('EX', 0, 1);
  } else if (key.includes('postgresql') || key.includes('mysql') || key === 'sql' || key.includes('dbms')) {
    // Stacked relational database cylinder
    ctx.strokeStyle = accentHex === '#3B82F6' ? '#93C5FD' : '#FCD34D';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.45, r * 0.58, r * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.58, -r * 0.45);
    ctx.lineTo(-r * 0.58, r * 0.45);
    ctx.ellipse(0, r * 0.45, r * 0.58, r * 0.22, 0, Math.PI, 0, true);
    ctx.lineTo(r * 0.58, -r * 0.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.58, r * 0.2, 0, 0, Math.PI);
    ctx.stroke();
  } else if (key.includes('supabase')) {
    // Sharp bolt triangle
    ctx.fillStyle = '#34D399';
    ctx.beginPath();
    ctx.moveTo(r * 0.1, -r * 0.75);
    ctx.lineTo(-r * 0.52, r * 0.12);
    ctx.lineTo(r * 0.05, r * 0.12);
    ctx.lineTo(-r * 0.1, r * 0.75);
    ctx.lineTo(r * 0.55, -r * 0.12);
    ctx.lineTo(-r * 0.05, -r * 0.12);
    ctx.closePath();
    ctx.fill();
  } else if (key.includes('git')) {
    // Git commit branch tree
    ctx.strokeStyle = '#FB7185';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.35, -r * 0.55);
    ctx.lineTo(-r * 0.35, r * 0.55);
    ctx.moveTo(-r * 0.35, 0);
    ctx.bezierCurveTo(r * 0.15, 0, r * 0.35, -r * 0.2, r * 0.35, -r * 0.5);
    ctx.stroke();
    ctx.fillStyle = '#FDA4AF';
    const gitNodes = [
      [-r * 0.35, -r * 0.55],
      [-r * 0.35, r * 0.55],
      [r * 0.35, -r * 0.5],
    ];
    for (const [gx, gy] of gitNodes) {
      ctx.beginPath();
      ctx.arc(gx, gy, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (key.includes('gemini') || key.includes('ai')) {
    // Precision 4-point Gemini star
    ctx.fillStyle = '#D8B4FE';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.quadraticCurveTo(r * 0.14, -r * 0.14, r * 0.8, 0);
    ctx.quadraticCurveTo(r * 0.14, r * 0.14, 0, r * 0.8);
    ctx.quadraticCurveTo(-r * 0.14, r * 0.14, -r * 0.8, 0);
    ctx.quadraticCurveTo(-r * 0.14, -r * 0.14, 0, -r * 0.8);
    ctx.closePath();
    ctx.fill();
  } else if (key.includes('openai')) {
    // Geometric interlocking rosette
    ctx.strokeStyle = '#E9D5FF';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i += 1) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3, r * 0.36, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (key.includes('vite')) {
    // Vite geometric lightning V
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.moveTo(r * 0.15, -r * 0.78);
    ctx.lineTo(-r * 0.5, r * 0.05);
    ctx.lineTo(0, r * 0.05);
    ctx.lineTo(-r * 0.18, r * 0.78);
    ctx.lineTo(r * 0.52, -r * 0.1);
    ctx.lineTo(r * 0.02, -r * 0.1);
    ctx.closePath();
    ctx.fill();
  } else if (key.includes('jwt') || key.includes('rbac') || key.includes('session')) {
    // Security shield lock
    ctx.strokeStyle = '#A5B4FC';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.72);
    ctx.lineTo(r * 0.6, -r * 0.42);
    ctx.lineTo(r * 0.52, r * 0.25);
    ctx.quadraticCurveTo(0, r * 0.75, 0, r * 0.78);
    ctx.quadraticCurveTo(0, r * 0.75, -r * 0.52, r * 0.25);
    ctx.lineTo(-r * 0.6, -r * 0.42);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#E0E7FF';
    ctx.beginPath();
    ctx.arc(0, 0, 3.6, 0, Math.PI * 2);
    ctx.fill();
  } else if (key.includes('rest')) {
    // Bi-directional API arrows
    ctx.strokeStyle = '#A5B4FC';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-r * 0.62, -r * 0.25);
    ctx.lineTo(r * 0.58, -r * 0.25);
    ctx.lineTo(r * 0.28, -r * 0.52);
    ctx.moveTo(r * 0.62, r * 0.25);
    ctx.lineTo(-r * 0.58, r * 0.25);
    ctx.lineTo(-r * 0.28, r * 0.52);
    ctx.stroke();
  } else if (key.includes('data structures') || key.includes('problem solving')) {
    // Binary tree / graph nodes
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(-r * 0.48, r * 0.15);
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(r * 0.48, r * 0.15);
    ctx.moveTo(-r * 0.48, r * 0.15);
    ctx.lineTo(-r * 0.2, r * 0.6);
    ctx.moveTo(r * 0.48, r * 0.15);
    ctx.lineTo(r * 0.2, r * 0.6);
    ctx.stroke();
    ctx.fillStyle = '#A7F3D0';
    for (const [nx, ny] of [
      [0, -r * 0.55],
      [-r * 0.48, r * 0.15],
      [r * 0.48, r * 0.15],
      [-r * 0.2, r * 0.6],
      [r * 0.2, r * 0.6],
    ]) {
      ctx.beginPath();
      ctx.arc(nx, ny, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (key.includes('object-oriented') || key.includes('oop')) {
    // Isometric cube representing encapsulation & classes
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.72);
    ctx.lineTo(r * 0.62, -r * 0.35);
    ctx.lineTo(r * 0.62, r * 0.35);
    ctx.lineTo(0, r * 0.72);
    ctx.lineTo(-r * 0.62, r * 0.35);
    ctx.lineTo(-r * 0.62, -r * 0.35);
    ctx.closePath();
    ctx.moveTo(0, -r * 0.72);
    ctx.lineTo(0, 0);
    ctx.lineTo(r * 0.62, -r * 0.35);
    ctx.moveTo(0, 0);
    ctx.lineTo(-r * 0.62, -r * 0.35);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, r * 0.72);
    ctx.stroke();
  } else if (key.includes('operating systems')) {
    // CPU microchip kernel
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 2.2;
    ctx.strokeRect(-r * 0.42, -r * 0.42, r * 0.84, r * 0.84);
    ctx.fillStyle = '#6EE7B7';
    ctx.fillRect(-r * 0.18, -r * 0.18, r * 0.36, r * 0.36);
    const pins = [-r * 0.22, r * 0.22];
    ctx.beginPath();
    for (const p of pins) {
      ctx.moveTo(p, -r * 0.42);
      ctx.lineTo(p, -r * 0.74);
      ctx.moveTo(p, r * 0.42);
      ctx.lineTo(p, r * 0.74);
      ctx.moveTo(-r * 0.42, p);
      ctx.lineTo(-r * 0.74, p);
      ctx.moveTo(r * 0.42, p);
      ctx.lineTo(r * 0.74, p);
    }
    ctx.stroke();
  } else if (key.includes('cloudflare')) {
    // Cloud silhouette
    ctx.strokeStyle = '#FB923C';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(-r * 0.24, r * 0.12, r * 0.34, Math.PI * 0.5, Math.PI * 1.45);
    ctx.arc(r * 0.08, -r * 0.12, r * 0.4, Math.PI * 1.05, Math.PI * 1.95);
    ctx.arc(r * 0.44, r * 0.16, r * 0.26, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.stroke();
  } else if (key.includes('vs code')) {
    // Code brackets ribbon
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.25);
    ctx.lineTo(r * 0.45, r * 0.55);
    ctx.lineTo(r * 0.45, -r * 0.55);
    ctx.lineTo(-r * 0.55, r * 0.25);
    ctx.stroke();
  } else {
    // Crisp technical monogram fallback (e.g., Postman)
    const initials = skillName
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    ctx.font = '800 19px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FDA4AF';
    ctx.fillText(initials, 0, 1);
  }

  ctx.restore();
}

/**
 * Draws a crisp high-DPI floating surface plate showing the technology's
 * custom glyph + label directly anchored to the 3D globe surface.
 */
export function createSkillBadgeTexture(
  node: GlobeSkillNode,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const width = 340;
  const height = 96;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const pad = 6;
  const radius = 22;

  // Rounded capsule surface plate
  ctx.beginPath();
  ctx.roundRect(pad, pad, width - pad * 2, height - pad * 2, radius);
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, 'rgba(11, 19, 39, 0.94)');
  bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.90)');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Crisp category-tinted hairline border
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = node.accentHex;
  ctx.globalAlpha = 0.78;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Left circular icon housing
  const iconCx = 48;
  const iconCy = height / 2;
  ctx.beginPath();
  ctx.arc(iconCx, iconCy, 28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = node.glowHex;
  ctx.globalAlpha = 0.65;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Draw bespoke tech glyph
  drawTechGlyph(ctx, node.name, iconCx, iconCy, 22, node.accentHex);

  // Skill Name (primary crisp high-contrast typography)
  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const label = node.shortLabel;
  const fontSize = label.length > 13 ? 21 : label.length > 10 ? 23 : 26;
  ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif`;
  ctx.fillText(label, 90, height / 2 - 9, width - 108);

  // Subtle category micro-subtitle below skill name
  ctx.fillStyle = node.glowHex;
  ctx.font = '600 14px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(node.categoryShort, 90, height / 2 + 17, width - 108);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a soft radial glow texture for ambient starlight & surface anchor halos.
 */
export function createRadialGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.28, 'rgba(147, 197, 253, 0.65)');
  grad.addColorStop(0.65, 'rgba(59, 130, 246, 0.18)');
  grad.addColorStop(1, 'rgba(59, 130, 246, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
