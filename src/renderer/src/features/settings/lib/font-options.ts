export type FontOption = {
  value: string;
  label: string;
};

export type LoadedFontOptions = {
  editor: FontOption[];
  preview: FontOption[];
  usesLocalFonts: boolean;
  editorListIsFiltered: boolean;
};

const genericFamilies = new Set(['serif', 'sans-serif', 'monospace', 'system-ui']);

const serifPattern =
  /\b(serif|georgia|times|garamond|palatino|cambria|baskerville|merriweather|charter)\b/i;

const monospaceNamePattern =
  /\b(mono|code|console|courier|typewriter|fixed|terminal|menlo|monaco|consolas|cascadia|inconsolata|meslo|hack)\b/i;

const editorFallbackFamilies = [
  'IBM Plex Mono',
  'Cascadia Code',
  'Consolas',
  'Fira Code',
  'JetBrains Mono',
  'Source Code Pro',
  'Menlo',
  'Monaco',
  'Courier New',
];

const previewFallbackFamilies = [
  'IBM Plex Sans',
  'Segoe UI',
  'Aptos',
  'Arial',
  'Helvetica Neue',
  'Verdana',
  'Trebuchet MS',
  'Georgia',
  'Palatino Linotype',
  'Times New Roman',
];

const measureCanvas = document.createElement('canvas');
const measureContext = measureCanvas.getContext('2d');

function normalizeFamily(family: string) {
  return family.trim();
}

function uniqueFamilies(families: string[]) {
  return Array.from(
    new Set(families.map(normalizeFamily).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));
}

function withPinnedFamilies(families: string[], pinned: string[], current: string) {
  const normalizedCurrent = normalizeFamily(current);

  return Array.from(
    new Set([
      ...pinned.map(normalizeFamily),
      ...(normalizedCurrent ? [normalizedCurrent] : []),
      ...families,
    ]),
  );
}

function toOptionLabel(family: string) {
  switch (family) {
    case 'monospace':
      return 'System monospace';
    case 'sans-serif':
      return 'System sans-serif';
    case 'serif':
      return 'System serif';
    case 'system-ui':
      return 'System UI';
    default:
      return family;
  }
}

function toOptions(families: string[]): FontOption[] {
  return families.map((family) => ({
    value: family,
    label: toOptionLabel(family),
  }));
}

function isGenericFamily(family: string) {
  return genericFamilies.has(normalizeFamily(family).toLowerCase());
}

function quoteFamily(family: string) {
  return JSON.stringify(normalizeFamily(family));
}

function measureSample(fontFamily: string, sample: string) {
  if (!measureContext) {
    return null;
  }

  measureContext.font = `16px ${fontFamily}`;
  return measureContext.measureText(sample).width;
}

function isProbablyMonospaceFamily(family: string) {
  if (monospaceNamePattern.test(family)) {
    return true;
  }

  const fontFamily = toEditorFontFamilyCss(family);
  const wide = measureSample(fontFamily, 'WWWWWWWWWW');
  const narrow = measureSample(fontFamily, 'iiiiiiiiii');

  if (wide === null || narrow === null) {
    return false;
  }

  return Math.abs(wide - narrow) < 0.1;
}

async function getLocalFontFamilies() {
  if (typeof window.queryLocalFonts !== 'function') {
    return null;
  }

  try {
    const fonts = await window.queryLocalFonts();
    return uniqueFamilies(fonts.map((font) => font.family));
  } catch {
    return null;
  }
}

export function fallbackFontOptions(current: {
  editorFontFamily: string;
  previewFontFamily: string;
}): LoadedFontOptions {
  return {
    editor: toOptions(
      withPinnedFamilies(
        editorFallbackFamilies,
        ['monospace'],
        current.editorFontFamily,
      ),
    ),
    preview: toOptions(
      withPinnedFamilies(
        previewFallbackFamilies,
        ['IBM Plex Sans', 'sans-serif', 'serif'],
        current.previewFontFamily,
      ),
    ),
    usesLocalFonts: false,
    editorListIsFiltered: false,
  };
}

export async function loadFontOptions(current: {
  editorFontFamily: string;
  previewFontFamily: string;
}): Promise<LoadedFontOptions> {
  const localFamilies = await getLocalFontFamilies();

  if (!localFamilies) {
    return fallbackFontOptions(current);
  }

  const editorFamilies = localFamilies.filter(isProbablyMonospaceFamily);

  return {
    editor: toOptions(
      withPinnedFamilies(
        editorFamilies.length > 0
          ? editorFamilies
          : editorFallbackFamilies,
        ['monospace'],
        current.editorFontFamily,
      ),
    ),
    preview: toOptions(
      withPinnedFamilies(
        localFamilies,
        ['IBM Plex Sans', 'sans-serif', 'serif'],
        current.previewFontFamily,
      ),
    ),
    usesLocalFonts: true,
    editorListIsFiltered: editorFamilies.length > 0,
  };
}

export function toEditorFontFamilyCss(family: string) {
  const normalized = normalizeFamily(family);

  if (!normalized) {
    return '"IBM Plex Mono", monospace';
  }

  if (isGenericFamily(normalized)) {
    return normalized.toLowerCase() === 'sans-serif' ? 'monospace' : normalized;
  }

  return `${quoteFamily(normalized)}, monospace`;
}

export function toPreviewFontFamilyCss(family: string) {
  const normalized = normalizeFamily(family);

  if (!normalized) {
    return '"IBM Plex Sans", sans-serif';
  }

  if (isGenericFamily(normalized)) {
    return normalized;
  }

  const genericFallback = serifPattern.test(normalized) ? 'serif' : 'sans-serif';
  return `${quoteFamily(normalized)}, ${genericFallback}`;
}


