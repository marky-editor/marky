import { describe, it, expect } from 'vitest';
import { mergeAppSettings, defaultAppSettings } from '@shared/settings';

describe('mergeAppSettings', () => {
  it('returns defaults when given null', () => {
    expect(mergeAppSettings(null)).toEqual(defaultAppSettings);
  });

  it('returns defaults when given undefined', () => {
    expect(mergeAppSettings(undefined)).toEqual(defaultAppSettings);
  });

  it('returns defaults when given empty object', () => {
    expect(mergeAppSettings({})).toEqual(defaultAppSettings);
  });

  it('overrides top-level scalar values', () => {
    const result = mergeAppSettings({ theme: 'dark', editorFontSize: 20 });
    expect(result.theme).toBe('dark');
    expect(result.editorFontSize).toBe(20);
    // Other values stay at defaults
    expect(result.language).toBe(defaultAppSettings.language);
  });

  it('deep-merges pdfMargins', () => {
    const result = mergeAppSettings({ pdfMargins: { top: 50 } as never });
    expect(result.pdfMargins).toEqual({
      top: 50,
      right: 20,
      bottom: 20,
      left: 20,
    });
  });

  it('preserves explicit recentFiles', () => {
    const result = mergeAppSettings({ recentFiles: ['/a.md', '/b.md'] });
    expect(result.recentFiles).toEqual(['/a.md', '/b.md']);
  });

  it('falls back to default recentFiles when not provided', () => {
    const result = mergeAppSettings({ theme: 'dark' });
    expect(result.recentFiles).toEqual(defaultAppSettings.recentFiles);
  });
});

describe('defaultAppSettings', () => {
  it('has expected default values', () => {
    expect(defaultAppSettings.theme).toBe('light');
    expect(defaultAppSettings.language).toBe('en');
    expect(defaultAppSettings.exportFont).toBe('system');
    expect(defaultAppSettings.editorFontFamily).toBe('IBM Plex Mono');
    expect(defaultAppSettings.previewFontFamily).toBe('IBM Plex Sans');
    expect(defaultAppSettings.pdfPageSize).toBe('A4');
  });
});
