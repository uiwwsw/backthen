import type { CSSProperties } from 'react';
import { cache } from 'react';
import sharp from 'sharp';

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type HslColor = {
  h: number;
  s: number;
  l: number;
};

type PaletteCandidate = {
  color: RgbColor;
  count: number;
  saturation: number;
  lightness: number;
};

type PaletteSample = {
  average: RgbColor;
  candidates: PaletteCandidate[];
};

export type ThemePalette = {
  paper: string;
  paperTop: string;
  paperBottom: string;
  shellTop: string;
  shellBottom: string;
  surface: string;
  surfaceAlt: string;
  surfaceAlt2: string;
  surfaceMuted: string;
  surfaceCard: string;
  surfaceStrong: string;
  surfaceTag: string;
  ink: string;
  mutedInk: string;
  line: string;
  lineSoft: string;
  frameLine: string;
  banner: string;
  bannerInk: string;
  bannerInkMuted: string;
  bannerLine: string;
  accent: string;
  accentStrong: string;
  accentInk: string;
  selection: string;
  displayGhost: string;
  paperEdge: string;
  paperEdgeStrong: string;
  paperSpotA: string;
  paperSpotB: string;
  paperVignette: string;
  paperShadowSoft: string;
  frameShadow: string;
  archiveSpotA: string;
  archiveSpotB: string;
  archiveVignette: string;
  archiveShadow: string;
  photoFillStart: string;
  photoFillEnd: string;
  photoFallbackStart: string;
  photoFallbackEnd: string;
  photoOverlayStrong: string;
  photoOverlaySoft: string;
  photoShadow: string;
};

const DEFAULT_PAPER = { r: 245, g: 239, b: 228 };
const DEFAULT_INK = { r: 17, g: 17, b: 17 };
const DEFAULT_MUTED_INK = { r: 63, g: 59, b: 54 };
const DEFAULT_ACCENT = { r: 207, g: 16, b: 32 };
const WHITE = { r: 255, g: 255, b: 255 };

export const defaultThemePalette: ThemePalette = {
  paper: '#f5efe4',
  paperTop: '#f3e8d2',
  paperBottom: '#e7d8bd',
  shellTop: '#cab999',
  shellBottom: '#ae9c81',
  surface: 'rgba(255, 255, 255, 0.62)',
  surfaceAlt: '#f1e3c4',
  surfaceAlt2: '#f2e2c1',
  surfaceMuted: '#ece0c8',
  surfaceCard: '#f6eed7',
  surfaceStrong: 'rgba(17, 17, 17, 0.035)',
  surfaceTag: 'rgba(255, 255, 255, 0.68)',
  ink: '#111111',
  mutedInk: '#3f3b36',
  line: 'rgba(17, 17, 17, 0.18)',
  lineSoft: 'rgba(17, 17, 17, 0.12)',
  frameLine: 'rgba(17, 17, 17, 0.15)',
  banner: '#111111',
  bannerInk: '#ffffff',
  bannerInkMuted: 'rgba(255, 255, 255, 0.72)',
  bannerLine: 'rgba(255, 255, 255, 0.15)',
  accent: '#cf1020',
  accentStrong: '#b40e1b',
  accentInk: '#ffffff',
  selection: 'rgba(169, 18, 18, 0.18)',
  displayGhost: 'rgba(255, 255, 255, 0.16)',
  paperEdge: 'rgba(131, 100, 63, 0.08)',
  paperEdgeStrong: 'rgba(131, 100, 63, 0.1)',
  paperSpotA: 'rgba(124, 92, 50, 0.08)',
  paperSpotB: 'rgba(101, 74, 39, 0.08)',
  paperVignette: 'rgba(77, 55, 24, 0.05)',
  paperShadowSoft: 'rgba(0, 0, 0, 0.05)',
  frameShadow: 'rgba(33, 23, 10, 0.24)',
  archiveSpotA: 'rgba(145, 109, 63, 0.08)',
  archiveSpotB: 'rgba(122, 89, 48, 0.08)',
  archiveVignette: 'rgba(80, 57, 27, 0.05)',
  archiveShadow: 'rgba(108, 79, 44, 0.05)',
  photoFillStart: 'rgba(17, 17, 17, 0.04)',
  photoFillEnd: 'rgba(17, 17, 17, 0.42)',
  photoFallbackStart: 'rgba(17, 17, 17, 0.16)',
  photoFallbackEnd: 'rgba(17, 17, 17, 0.58)',
  photoOverlayStrong: 'rgba(17, 17, 17, 0.7)',
  photoOverlaySoft: 'rgba(17, 17, 17, 0.12)',
  photoShadow: 'rgba(10, 10, 10, 0.54)'
};

export const getIssueThemePalette = cache(async (imageUrl: string | null): Promise<ThemePalette> => {
  if (!imageUrl) {
    return defaultThemePalette;
  }

  try {
    const sample = await fetchPaletteSample(imageUrl);

    return buildThemePalette(sample);
  } catch {
    return defaultThemePalette;
  }
});

export function getThemeStyle(palette: ThemePalette): CSSProperties {
  const style: Record<string, string> = {
    '--paper': palette.paper,
    '--paper-top': palette.paperTop,
    '--paper-bottom': palette.paperBottom,
    '--shell-top': palette.shellTop,
    '--shell-bottom': palette.shellBottom,
    '--surface': palette.surface,
    '--surface-alt': palette.surfaceAlt,
    '--surface-alt-2': palette.surfaceAlt2,
    '--surface-muted': palette.surfaceMuted,
    '--surface-card': palette.surfaceCard,
    '--surface-strong': palette.surfaceStrong,
    '--surface-tag': palette.surfaceTag,
    '--ink': palette.ink,
    '--muted-ink': palette.mutedInk,
    '--line': palette.line,
    '--line-soft': palette.lineSoft,
    '--frame-line': palette.frameLine,
    '--banner': palette.banner,
    '--banner-ink': palette.bannerInk,
    '--banner-ink-muted': palette.bannerInkMuted,
    '--banner-line': palette.bannerLine,
    '--tabloid-red': palette.accent,
    '--tabloid-red-strong': palette.accentStrong,
    '--accent-ink': palette.accentInk,
    '--selection': palette.selection,
    '--display-ghost': palette.displayGhost,
    '--paper-edge': palette.paperEdge,
    '--paper-edge-strong': palette.paperEdgeStrong,
    '--paper-spot-a': palette.paperSpotA,
    '--paper-spot-b': palette.paperSpotB,
    '--paper-vignette': palette.paperVignette,
    '--paper-shadow-soft': palette.paperShadowSoft,
    '--frame-shadow': palette.frameShadow,
    '--archive-spot-a': palette.archiveSpotA,
    '--archive-spot-b': palette.archiveSpotB,
    '--archive-vignette': palette.archiveVignette,
    '--archive-shadow': palette.archiveShadow,
    '--photo-fill-start': palette.photoFillStart,
    '--photo-fill-end': palette.photoFillEnd,
    '--photo-fallback-start': palette.photoFallbackStart,
    '--photo-fallback-end': palette.photoFallbackEnd,
    '--photo-overlay-strong': palette.photoOverlayStrong,
    '--photo-overlay-soft': palette.photoOverlaySoft,
    '--photo-shadow': palette.photoShadow
  };

  return style as CSSProperties;
}

async function fetchPaletteSample(imageUrl: string): Promise<PaletteSample> {
  const response = await fetch(imageUrl, {
    cache: 'force-cache',
    headers: {
      accept: 'image/*'
    }
  });

  if (!response.ok) {
    throw new Error(`Image fetch failed: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.startsWith('image/')) {
    throw new Error('Response is not an image');
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());
  const sampled = await sharp(imageBuffer)
    .rotate()
    .flatten({ background: DEFAULT_PAPER })
    .resize(48, 48, { fit: 'inside', withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const totalPixels = Math.max(sampled.info.width * sampled.info.height, 1);
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;

  for (let index = 0; index < sampled.data.length; index += sampled.info.channels) {
    const r = sampled.data[index] ?? 0;
    const g = sampled.data[index + 1] ?? 0;
    const b = sampled.data[index + 2] ?? 0;
    const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`;
    const bucket = buckets.get(key);

    totalR += r;
    totalG += g;
    totalB += b;

    if (bucket) {
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.count += 1;
      continue;
    }

    buckets.set(key, { r, g, b, count: 1 });
  }

  const candidates = [...buckets.values()]
    .map((bucket) => {
      const color = {
        r: Math.round(bucket.r / bucket.count),
        g: Math.round(bucket.g / bucket.count),
        b: Math.round(bucket.b / bucket.count)
      };
      const { s, l } = rgbToHsl(color);

      return {
        color,
        count: bucket.count,
        saturation: s,
        lightness: l
      };
    })
    .filter((candidate) => candidate.count >= Math.max(2, Math.round(totalPixels * 0.012)))
    .sort((left, right) => right.count - left.count);

  return {
    average: {
      r: Math.round(totalR / totalPixels),
      g: Math.round(totalG / totalPixels),
      b: Math.round(totalB / totalPixels)
    },
    candidates
  };
}

function buildThemePalette(sample: PaletteSample): ThemePalette {
  const paperSeed =
    pickCandidate(
      sample.candidates,
      (candidate) => candidate.lightness >= 0.18,
      (candidate) => candidate.count + candidate.lightness * 18 - candidate.saturation * 3
    ) ?? sample.average;
  const bannerSeed =
    pickCandidate(
      sample.candidates,
      (candidate) => candidate.lightness <= 0.38,
      (candidate) => candidate.count * 1.8 + (0.42 - candidate.lightness) * 24 + candidate.saturation * 6
    ) ?? mixRgb(paperSeed, DEFAULT_INK, 0.76);
  const accentSeed =
    pickCandidate(
      sample.candidates,
      (candidate) =>
        candidate.saturation >= 0.22 &&
        candidate.lightness >= 0.2 &&
        candidate.lightness <= 0.74 &&
        colorDistance(candidate.color, bannerSeed) >= 38 &&
        colorDistance(candidate.color, paperSeed) >= 28,
      (candidate) => Math.sqrt(candidate.count) * 10 + candidate.saturation * 120 - Math.abs(candidate.lightness - 0.5) * 18
    ) ?? mixRgb(paperSeed, DEFAULT_ACCENT, 0.72);

  const paperBase = tunePaper(mixRgb(paperSeed, DEFAULT_PAPER, 0.38));
  const paperTop = withLightness(paperBase, 0.95);
  const paperBottom = withLightness(paperBase, 0.85);
  let banner = tuneBanner(mixRgb(bannerSeed, DEFAULT_INK, 0.22));
  let ink = tuneInk(mixRgb(banner, DEFAULT_INK, 0.42), paperBase);
  let accent = tuneAccent(accentSeed, paperBase);

  if (contrastRatio(accent, paperBase) < 3.2) {
    accent = tuneAccent(mixRgb(accent, banner, 0.22), paperBase);
  }

  if (contrastRatio(banner, paperBase) < 7) {
    banner = tuneBanner(mixRgb(banner, DEFAULT_INK, 0.28));
    ink = tuneInk(mixRgb(banner, DEFAULT_INK, 0.42), paperBase);
  }

  const mutedInk = tuneMutedInk(mixRgb(ink, DEFAULT_MUTED_INK, 0.42), paperBase);
  const accentStrong = withLightness(accent, clamp(rgbToHsl(accent).l - 0.09, 0.22, 0.46));
  const bannerInk = pickReadableForeground(banner, WHITE, paperBase);
  const accentInk = pickReadableForeground(accent, WHITE, ink);
  const shellTop = mixRgb(paperBottom, banner, 0.18);
  const shellBottom = mixRgb(paperBottom, banner, 0.3);
  const surfaceTint = mixRgb(paperTop, accent, 0.06);
  const surface = toRgba(surfaceTint, 0.78);
  const surfaceAlt = toHex(mixRgb(paperBottom, accent, 0.14));
  const surfaceAlt2 = toHex(mixRgb(paperBottom, banner, 0.06));
  const surfaceMuted = toHex(mixRgb(paperBottom, paperSeed, 0.16));
  const surfaceCard = toHex(mixRgb(paperBottom, accent, 0.08));
  const surfaceStrong = toRgba(mixRgb(banner, paperBase, 0.12), 0.08);
  const surfaceTag = toRgba(mixRgb(paperTop, accent, 0.1), 0.82);
  const line = toRgba(ink, 0.18);
  const lineSoft = toRgba(ink, 0.12);
  const frameLine = toRgba(ink, 0.15);
  const bannerInkMuted = toRgba(bannerInk, 0.72);
  const bannerLine = toRgba(bannerInk, 0.15);
  const displayGhost = toRgba(bannerInk, 0.16);
  const paperEdge = toRgba(mixRgb(paperBottom, banner, 0.22), 0.1);
  const paperEdgeStrong = toRgba(mixRgb(paperBottom, banner, 0.32), 0.12);
  const paperSpotA = toRgba(mixRgb(paperSeed, accent, 0.32), 0.1);
  const paperSpotB = toRgba(mixRgb(paperSeed, banner, 0.24), 0.1);
  const paperVignette = toRgba(banner, 0.05);
  const paperShadowSoft = toRgba(banner, 0.05);
  const frameShadow = toRgba(mixRgb(banner, DEFAULT_INK, 0.2), 0.24);
  const archiveSpotA = toRgba(mixRgb(paperSeed, accent, 0.38), 0.08);
  const archiveSpotB = toRgba(mixRgb(paperSeed, banner, 0.28), 0.08);
  const archiveVignette = toRgba(banner, 0.05);
  const archiveShadow = toRgba(banner, 0.05);
  const photoFillStart = toRgba(banner, 0.06);
  const photoFillEnd = toRgba(banner, 0.46);
  const photoFallbackStart = toRgba(banner, 0.16);
  const photoFallbackEnd = toRgba(banner, 0.58);
  const photoOverlayStrong = toRgba(banner, 0.72);
  const photoOverlaySoft = toRgba(banner, 0.14);
  const photoShadow = toRgba(mixRgb(banner, DEFAULT_INK, 0.2), 0.54);

  return {
    paper: toHex(paperBase),
    paperTop: toHex(paperTop),
    paperBottom: toHex(paperBottom),
    shellTop: toHex(shellTop),
    shellBottom: toHex(shellBottom),
    surface,
    surfaceAlt,
    surfaceAlt2,
    surfaceMuted,
    surfaceCard,
    surfaceStrong,
    surfaceTag,
    ink: toHex(ink),
    mutedInk: toHex(mutedInk),
    line,
    lineSoft,
    frameLine,
    banner: toHex(banner),
    bannerInk: toHex(bannerInk),
    bannerInkMuted,
    bannerLine,
    accent: toHex(accent),
    accentStrong: toHex(accentStrong),
    accentInk: toHex(accentInk),
    selection: toRgba(accent, 0.18),
    displayGhost,
    paperEdge,
    paperEdgeStrong,
    paperSpotA,
    paperSpotB,
    paperVignette,
    paperShadowSoft,
    frameShadow,
    archiveSpotA,
    archiveSpotB,
    archiveVignette,
    archiveShadow,
    photoFillStart,
    photoFillEnd,
    photoFallbackStart,
    photoFallbackEnd,
    photoOverlayStrong,
    photoOverlaySoft,
    photoShadow
  };
}

function pickCandidate(
  candidates: PaletteCandidate[],
  filter: (candidate: PaletteCandidate) => boolean,
  score: (candidate: PaletteCandidate) => number
) {
  let winner: PaletteCandidate | null = null;
  let winnerScore = Number.NEGATIVE_INFINITY;

  for (const candidate of candidates) {
    if (!filter(candidate)) {
      continue;
    }

    const nextScore = score(candidate);

    if (nextScore > winnerScore) {
      winner = candidate;
      winnerScore = nextScore;
    }
  }

  return winner?.color ?? null;
}

function tunePaper(color: RgbColor) {
  const hsl = rgbToHsl(color);

  return hslToRgb({
    h: hsl.h,
    s: clamp(hsl.s * 0.6 + 0.04, 0.08, 0.28),
    l: 0.92
  });
}

function tuneBanner(color: RgbColor) {
  const hsl = rgbToHsl(color);

  return hslToRgb({
    h: hsl.h,
    s: clamp(hsl.s * 0.82 + 0.02, 0.08, 0.46),
    l: clamp(Math.min(hsl.l, 0.2), 0.11, 0.22)
  });
}

function tuneInk(color: RgbColor, background: RgbColor) {
  let ink = withLightness(color, clamp(Math.min(rgbToHsl(color).l, 0.16), 0.08, 0.18));

  if (contrastRatio(ink, background) < 10) {
    ink = DEFAULT_INK;
  }

  return ink;
}

function tuneMutedInk(color: RgbColor, background: RgbColor) {
  let muted = withLightness(color, clamp(rgbToHsl(color).l, 0.22, 0.34));

  if (contrastRatio(muted, background) < 5) {
    muted = mixRgb(DEFAULT_MUTED_INK, DEFAULT_INK, 0.18);
  }

  return muted;
}

function tuneAccent(color: RgbColor, background: RgbColor) {
  const hsl = rgbToHsl(color);
  let accent = hslToRgb({
    h: hsl.h,
    s: clamp(Math.max(hsl.s, 0.42), 0.4, 0.78),
    l: clamp(hsl.l, 0.34, 0.56)
  });

  if (contrastRatio(accent, background) < 3.2) {
    accent = withLightness(accent, clamp(rgbToHsl(accent).l - 0.08, 0.28, 0.48));
  }

  return accent;
}

function pickReadableForeground(background: RgbColor, light: RgbColor, dark: RgbColor) {
  return contrastRatio(light, background) >= 4.5 ? light : dark;
}

function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness };
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  switch (max) {
    case red:
      hue = ((green - blue) / delta) % 6;
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    default:
      hue = (red - green) / delta + 4;
      break;
  }

  hue *= 60;

  if (hue < 0) {
    hue += 360;
  }

  return {
    h: hue,
    s: saturation,
    l: lightness
  };
}

function hslToRgb({ h, s, l }: HslColor): RgbColor {
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const huePrime = h / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  let red = 0;
  let green = 0;
  let blue = 0;

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = x;
  } else if (huePrime < 2) {
    red = x;
    green = chroma;
  } else if (huePrime < 3) {
    green = chroma;
    blue = x;
  } else if (huePrime < 4) {
    green = x;
    blue = chroma;
  } else if (huePrime < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const match = l - chroma / 2;

  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255)
  };
}

function withLightness(color: RgbColor, lightness: number) {
  const hsl = rgbToHsl(color);

  return hslToRgb({
    h: hsl.h,
    s: hsl.s,
    l: lightness
  });
}

function mixRgb(base: RgbColor, target: RgbColor, amount: number): RgbColor {
  const ratio = clamp(amount, 0, 1);

  return {
    r: Math.round(base.r + (target.r - base.r) * ratio),
    g: Math.round(base.g + (target.g - base.g) * ratio),
    b: Math.round(base.b + (target.b - base.b) * ratio)
  };
}

function contrastRatio(foreground: RgbColor, background: RgbColor) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance({ r, g, b }: RgbColor) {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255;

    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function colorDistance(left: RgbColor, right: RgbColor) {
  return Math.sqrt(
    Math.pow(left.r - right.r, 2) + Math.pow(left.g - right.g, 2) + Math.pow(left.b - right.b, 2)
  );
}

function toHex({ r, g, b }: RgbColor) {
  return `#${[r, g, b]
    .map((channel) => clamp(channel, 0, 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

function toRgba({ r, g, b }: RgbColor, alpha: number) {
  return `rgba(${clamp(r, 0, 255)}, ${clamp(g, 0, 255)}, ${clamp(b, 0, 255)}, ${clamp(alpha, 0, 1)})`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
