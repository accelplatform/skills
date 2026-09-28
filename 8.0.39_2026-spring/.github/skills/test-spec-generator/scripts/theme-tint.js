#!/usr/bin/env node
/**
 * Excel のテーマ色 + tint から実際の表示HEXを計算する（ECMA-376準拠、HSLベース）。
 *
 * Usage:
 *   node theme-tint.js <themeHex> <tint>
 *   node theme-tint.js 44546A 0.79998168889431442
 *   # => d6dce5
 *
 * 詳細は ../reference/officecli-fill-color.md 参照。
 */
'use strict';

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function applyTint(hex, tint) {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newL = tint >= 0 ? l * (1 - tint) + tint : l * (1 + tint);
  const [r2, g2, b2] = hslToRgb(h, s, Math.max(0, Math.min(1, newL)));
  return [r2, g2, b2].map(x => x.toString(16).padStart(2, '0')).join('');
}

if (require.main === module) {
  const [themeHex, tintStr] = process.argv.slice(2);
  if (!themeHex || tintStr === undefined) {
    console.error('Usage: node theme-tint.js <themeHex> <tint>');
    process.exit(1);
  }
  console.log(applyTint(themeHex, parseFloat(tintStr)));
}

module.exports = { applyTint, rgbToHsl, hslToRgb };
