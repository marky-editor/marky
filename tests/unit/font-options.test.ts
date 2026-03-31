// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  toEditorFontFamilyCss,
  toPreviewFontFamilyCss,
} from '@renderer/features/settings/lib/font-options';

describe('toEditorFontFamilyCss', () => {
  it('wraps a named family in quotes with monospace fallback', () => {
    expect(toEditorFontFamilyCss('JetBrains Mono')).toBe(
      '"JetBrains Mono", monospace',
    );
  });

  it('returns generic monospace as-is', () => {
    expect(toEditorFontFamilyCss('monospace')).toBe('monospace');
  });

  it('remaps sans-serif to monospace for the editor', () => {
    expect(toEditorFontFamilyCss('sans-serif')).toBe('monospace');
  });

  it('keeps other generic families as-is', () => {
    expect(toEditorFontFamilyCss('serif')).toBe('serif');
    expect(toEditorFontFamilyCss('system-ui')).toBe('system-ui');
  });

  it('returns default when given empty string', () => {
    expect(toEditorFontFamilyCss('')).toBe('"IBM Plex Mono", monospace');
  });
});

describe('toPreviewFontFamilyCss', () => {
  it('wraps a sans-serif family with sans-serif fallback', () => {
    expect(toPreviewFontFamilyCss('Helvetica Neue')).toBe(
      '"Helvetica Neue", sans-serif',
    );
  });

  it('uses serif fallback for serif-like families', () => {
    expect(toPreviewFontFamilyCss('Georgia')).toBe('"Georgia", serif');
    expect(toPreviewFontFamilyCss('Times New Roman')).toBe(
      '"Times New Roman", serif',
    );
  });

  it('returns generic families as-is', () => {
    expect(toPreviewFontFamilyCss('sans-serif')).toBe('sans-serif');
    expect(toPreviewFontFamilyCss('serif')).toBe('serif');
  });

  it('returns default when given empty string', () => {
    expect(toPreviewFontFamilyCss('')).toBe('"IBM Plex Sans", sans-serif');
  });
});
