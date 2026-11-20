import * as THREE from 'three';
import { GlobeSkillNode } from '../../utils/techGlobeLogic';

/**
 * Draws a crisp, borderless, luminous vector technology emblem centered at
 * (cx, cy) with radius r. No box or circular badge wrapper — pure floating logo.
 */
function drawFloatingTechLogo(
  ctx: CanvasRenderingContext2D,
  skillName: string,
  cx: number,
  cy: number,
  r: number,
  accentHex: string,
  glowHex: string
): void {
  ctx.save();
  ctx.translate(cx, cy);

  // Soft spatial halo directly behind the emblem so it floats cleanly in space
  const halo = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 1.45);
  halo.addColorStop(0, `${accentHex}52`);
  halo.addColorStop(0.55, `${glowHex}1C`);
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#F8FAFC';
  ctx.fillStyle = '#F8FAFC';
  ctx.lineWidth = Math.max(2.3, r * 0.11);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = accentHex;
  ctx.shadowBlur = 10;

  const key = skillName.toLowerCase();

  if (key.includes('react.js') || key === 'react') {
    ctx.strokeStyle = '#38BDF8';
    for (let i = 0; i < 3; i += 1) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.92, r * 0.36, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#7DD3FC';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (key.includes('react router')) {
    ctx.strokeStyle = '#22D3EE';
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(r * 0.62, -r * 0.48);
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.62, r * 0.48);
    ctx.stroke();
    ctx.fillStyle = '#E0F2FE';
    for (const [px, py] of [
      [-r * 0.7, 0],
      [r * 0.62, -r * 0.48],
      [r * 0.62, r * 0.48],
    ]) {
      ctx.beginPath();
      ctx.arc(px, py, r * 0.17, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (key === 'typescript') {
    ctx.font = `800 ${Math.round(r * 1.12)}px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#60A5FA';
    ctx.fillText('TS', 0, 1);
  } else if (key === 'javascript') {
    ctx.font = `800 ${Math.round(r * 1.12)}px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FDE047';
    ctx.fillText('JS', 0, 1);
  } else if (key === 'java') {
    // Stylized Java cup + rising steam curves
    ctx.strokeStyle = '#93C5FD';
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.04);
    ctx.lineTo(-r * 0.36, r * 0.6);
    ctx.lineTo(r * 0.3, r * 0.6);
    ctx.lineTo(r * 0.44, -r * 0.04);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r * 0.44, r * 0.24, r * 0.22, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.strokeStyle = '#E0F2FE';
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, -r * 0.26);
    ctx.quadraticCurveTo(-r * 0.32, -r * 0.54, -r * 0.1, -r * 0.76);
    ctx.moveTo(r * 0.16, -r * 0.26);
    ctx.quadraticCurveTo(0, -r * 0.54, r * 0.22, -r * 0.76);
    ctx.stroke();
  } else if (key === 'html5') {
    ctx.font = `800 ${Math.round(r * 0.94)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('</>', 0, 1);
  } else if (key === 'css3') {
    ctx.font = `800 ${Math.round(r * 0.98)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#67E8F9';
    ctx.fillText('{ }', 0, 0);
  } else if (key.includes('tailwind')) {
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = Math.max(2.8, r * 0.13);
    ctx.beginPath();
    ctx.moveTo(-r * 0.74, -r * 0.2);
    ctx.bezierCurveTo(-r * 0.38, -r * 0.72, r * 0.16, r * 0.18, r * 0.74, -r * 0.28);
    ctx.moveTo(-r * 0.74, r * 0.34);
    ctx.bezierCurveTo(-r * 0.38, -r * 0.16, r * 0.16, r * 0.72, r * 0.74, r * 0.26);
    ctx.stroke();
  } else if (key.includes('node.js')) {
    ctx.strokeStyle = '#818CF8';
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const ang = (Math.PI / 3) * i - Math.PI / 2;
      const px = Math.cos(ang) * r * 0.84;
      const py = Math.sin(ang) * r * 0.84;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.font = `800 ${Math.round(r * 0.62)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#C7D2FE';
    ctx.fillText('JS', 0, 1);
  } else if (key.includes('express')) {
    ctx.font = `800 ${Math.round(r * 1.0)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#A5B4FC';
    ctx.fillText('EX', 0, 1);
  } else if (
    key.includes('postgresql') ||
    key.includes('mysql') ||
    key === 'sql' ||
    key.includes('dbms')
  ) {
    ctx.strokeStyle = '#7DD3FC';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.48, r * 0.62, r * 0.24, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.62, -r * 0.48);
    ctx.lineTo(-r * 0.62, r * 0.48);
    ctx.ellipse(0, r * 0.48, r * 0.62, r * 0.24, 0, Math.PI, 0, true);
    ctx.lineTo(r * 0.62, -r * 0.48);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.62, r * 0.21, 0, 0, Math.PI);
    ctx.stroke();
  } else if (key.includes('supabase')) {
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(r * 0.12, -r * 0.82);
    ctx.lineTo(-r * 0.56, r * 0.12);
    ctx.lineTo(r * 0.06, r * 0.12);
    ctx.lineTo(-r * 0.12, r * 0.82);
    ctx.lineTo(r * 0.58, -r * 0.12);
    ctx.lineTo(-r * 0.06, -r * 0.12);
    ctx.closePath();
    ctx.fill();
  } else if (key.includes('git')) {
    ctx.strokeStyle = '#C084FC';
    ctx.beginPath();
    ctx.moveTo(-r * 0.36, -r * 0.6);
    ctx.lineTo(-r * 0.36, r * 0.6);
    ctx.moveTo(-r * 0.36, 0);
    ctx.bezierCurveTo(r * 0.2, 0, r * 0.38, -r * 0.22, r * 0.38, -r * 0.56);
    ctx.stroke();
    ctx.fillStyle = '#E9D5FF';
    for (const [gx, gy] of [
      [-r * 0.36, -r * 0.6],
      [-r * 0.36, r * 0.6],
      [r * 0.38, -r * 0.56],
    ]) {
      ctx.beginPath();
      ctx.arc(gx, gy, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (key.includes('gemini') || key.includes('ai')) {
    ctx.fillStyle = '#C4B5FD';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.86);
    ctx.quadraticCurveTo(r * 0.16, -r * 0.16, r * 0.86, 0);
    ctx.quadraticCurveTo(r * 0.16, r * 0.16, 0, r * 0.86);
    ctx.quadraticCurveTo(-r * 0.16, r * 0.16, -r * 0.86, 0);
    ctx.quadraticCurveTo(-r * 0.16, -r * 0.16, 0, -r * 0.86);
    ctx.closePath();
    ctx.fill();
  } else if (key.includes('openai')) {
    ctx.strokeStyle = '#DDD6FE';
    ctx.lineWidth = Math.max(1.9, r * 0.085);
    for (let i = 0; i < 6; i += 1) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32, r * 0.38, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (key.includes('vite')) {
    ctx.fillStyle = '#A78BFA';
    ctx.beginPath();
    ctx.moveTo(r * 0.16, -r * 0.82);
    ctx.lineTo(-r * 0.54, r * 0.06);
    ctx.lineTo(0, r * 0.06);
    ctx.lineTo(-r * 0.18, r * 0.82);
    ctx.lineTo(r * 0.56, -r * 0.1);
    ctx.lineTo(r * 0.02, -r * 0.1);
    ctx.closePath();
    ctx.fill();
  } else if (key.includes('jwt') || key.includes('rbac') || key.includes('session')) {
    ctx.strokeStyle = '#A5B4FC';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.78);
    ctx.lineTo(r * 0.64, -r * 0.44);
    ctx.lineTo(r * 0.54, r * 0.28);
    ctx.quadraticCurveTo(0, r * 0.8, 0, r * 0.84);
    ctx.quadraticCurveTo(0, r * 0.8, -r * 0.54, r * 0.28);
    ctx.lineTo(-r * 0.64, -r * 0.44);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#E0E7FF';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.17, 0, Math.PI * 2);
    ctx.fill();
  } else if (key.includes('rest')) {
    ctx.strokeStyle = '#A5B4FC';
    ctx.beginPath();
    ctx.moveTo(-r * 0.68, -r * 0.26);
    ctx.lineTo(r * 0.62, -r * 0.26);
    ctx.lineTo(r * 0.3, -r * 0.56);
    ctx.moveTo(r * 0.68, r * 0.26);
    ctx.lineTo(-r * 0.62, r * 0.26);
    ctx.lineTo(-r * 0.3, r * 0.56);
    ctx.stroke();
  } else if (key.includes('data structures') || key.includes('problem solving')) {
    ctx.strokeStyle = '#5EEAD4';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.62);
    ctx.lineTo(-r * 0.52, r * 0.16);
    ctx.moveTo(0, -r * 0.62);
    ctx.lineTo(r * 0.52, r * 0.16);
    ctx.moveTo(-r * 0.52, r * 0.16);
    ctx.lineTo(-r * 0.22, r * 0.66);
    ctx.moveTo(r * 0.52, r * 0.16);
    ctx.lineTo(r * 0.22, r * 0.66);
    ctx.stroke();
    ctx.fillStyle = '#CCFBF1';
    for (const [nx, ny] of [
      [0, -r * 0.62],
      [-r * 0.52, r * 0.16],
      [r * 0.52, r * 0.16],
      [-r * 0.22, r * 0.66],
      [r * 0.22, r * 0.66],
    ]) {
      ctx.beginPath();
      ctx.arc(nx, ny, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (key.includes('object-oriented') || key.includes('oop')) {
    ctx.strokeStyle = '#5EEAD4';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.78);
    ctx.lineTo(r * 0.66, -r * 0.38);
    ctx.lineTo(r * 0.66, r * 0.38);
    ctx.lineTo(0, r * 0.78);
    ctx.lineTo(-r * 0.66, r * 0.38);
    ctx.lineTo(-r * 0.66, -r * 0.38);
    ctx.closePath();
    ctx.moveTo(0, -r * 0.78);
    ctx.lineTo(0, 0);
    ctx.lineTo(r * 0.66, -r * 0.38);
    ctx.moveTo(0, 0);
    ctx.lineTo(-r * 0.66, -r * 0.38);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, r * 0.78);
    ctx.stroke();
  } else if (key.includes('operating systems')) {
    ctx.strokeStyle = '#5EEAD4';
    ctx.strokeRect(-r * 0.44, -r * 0.44, r * 0.88, r * 0.88);
    ctx.fillStyle = '#99F6E4';
    ctx.fillRect(-r * 0.2, -r * 0.2, r * 0.4, r * 0.4);
    const pins = [-r * 0.22, r * 0.22];
    ctx.beginPath();
    for (const p of pins) {
      ctx.moveTo(p, -r * 0.44);
      ctx.lineTo(p, -r * 0.8);
      ctx.moveTo(p, r * 0.44);
      ctx.lineTo(p, r * 0.8);
      ctx.moveTo(-r * 0.44, p);
      ctx.lineTo(-r * 0.8, p);
      ctx.moveTo(r * 0.44, p);
      ctx.lineTo(r * 0.8, p);
    }
    ctx.stroke();
  } else if (key.includes('cloudflare')) {
    ctx.strokeStyle = '#C084FC';
    ctx.beginPath();
    ctx.arc(-r * 0.26, r * 0.14, r * 0.36, Math.PI * 0.5, Math.PI * 1.45);
    ctx.arc(r * 0.08, -r * 0.14, r * 0.44, Math.PI * 1.05, Math.PI * 1.95);
    ctx.arc(r * 0.48, r * 0.16, r * 0.28, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.stroke();
  } else if (key.includes('vs code')) {
    ctx.strokeStyle = '#93C5FD';
    ctx.beginPath();
    ctx.moveTo(-r * 0.58, -r * 0.26);
    ctx.lineTo(r * 0.48, r * 0.58);
    ctx.lineTo(r * 0.48, -r * 0.58);
    ctx.lineTo(-r * 0.58, r * 0.26);
    ctx.stroke();
  } else {
    const initials = skillName
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    ctx.font = `800 ${Math.round(r * 0.96)}px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = glowHex;
    ctx.fillText(initials, 0, 1);
  }

  ctx.restore();
}

/**
 * Generates a borderless floating holographic texture combining the
 * technology's vector logo + crisp luminous typography (no boxes or circular
 * badge frames) so the skills themselves construct the 3D sphere.
 */
export function createSkillHologramTexture(
  node: GlobeSkillNode,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const width = 420;
  const height = 112;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const isPrimary = node.prominence === 'primary';
  const iconRadius = isPrimary ? 25 : 20;
  const iconCx = 46;
  const centerY = height / 2;

  // Measure text to keep layout optically balanced & centered around the node
  const label = node.shortLabel;
  const fontSize = isPrimary
    ? label.length > 13
      ? 26
      : 31
    : label.length > 14
      ? 21
      : 24;

  // Draw floating luminous vector logo on the left
  drawFloatingTechLogo(
    ctx,
    node.name,
    iconCx,
    centerY,
    iconRadius,
    node.accentHex,
    node.glowHex
  );

  // Subtle dark soft legibility backdrop glow ONLY behind the letters (zero visible border/box)
  ctx.save();
  const textStartX = iconCx + iconRadius + 16;
  ctx.font = `${isPrimary ? 800 : 600} ${fontSize}px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // Crisp spatial shadow for legibility across overlapping filaments
  ctx.shadowColor = 'rgba(2, 6, 23, 0.96)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  // Primary luminous skill name
  ctx.fillStyle = isPrimary ? '#F8FAFC' : '#CBD5E1';
  const labelY = isPrimary ? centerY - 7 : centerY;
  ctx.fillText(label, textStartX, labelY, width - textStartX - 14);

  // Delicate accent micro-underline spark & discipline hint on primary anchor nodes
  if (isPrimary) {
    ctx.shadowBlur = 8;
    ctx.fillStyle = node.glowHex;
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText(node.categoryShort.toUpperCase(), textStartX + 1, centerY + 21);
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a soft additive radial starlight flare texture for glowing
 * skill junction vertices and hollow spherical core aura.
 */
export function createRadialGlowTexture(
  innerColor = 'rgba(255, 255, 255, 1)',
  midColor = 'rgba(96, 165, 250, 0.55)',
  outerColor = 'rgba(139, 92, 246, 0)'
): THREE.CanvasTexture {
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
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.32, midColor);
  grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.14)');
  grad.addColorStop(1, outerColor);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
