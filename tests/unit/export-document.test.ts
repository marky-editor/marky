import { describe, it, expect } from 'vitest';
import { createExportDocument } from '@renderer/features/export/lib/export-document';

describe('createExportDocument', () => {
  it('produces a valid HTML document', () => {
    const html = createExportDocument('My Doc', '<p>hello</p>');
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('</html>');
  });

  it('includes the title in <title> tag', () => {
    const html = createExportDocument('Test Title', '<p>body</p>');
    expect(html).toContain('<title>Test Title</title>');
  });

  it('wraps body HTML in an <article>', () => {
    const html = createExportDocument('t', '<p>content</p>');
    expect(html).toContain('<article><p>content</p></article>');
  });

  it('uses system font by default', () => {
    const html = createExportDocument('t', '<p>hi</p>');
    expect(html).toContain('-apple-system');
    expect(html).toContain('Segoe UI');
  });

  it('uses serif font family when requested', () => {
    const html = createExportDocument('t', '<p>hi</p>', 'serif');
    expect(html).toContain('Georgia');
    expect(html).toContain('Times New Roman');
  });

  it('uses mono font family when requested', () => {
    const html = createExportDocument('t', '<p>hi</p>', 'mono');
    expect(html).toContain('SFMono-Regular');
    expect(html).toContain('Consolas');
  });

  it('includes mermaid figure styling', () => {
    const html = createExportDocument('t', '<p>hi</p>');
    expect(html).toContain('.mermaid-figure');
  });

  it('includes responsive image styling', () => {
    const html = createExportDocument('t', '<p>hi</p>');
    expect(html).toContain('max-width: 100%');
  });

  it('includes table styling', () => {
    const html = createExportDocument('t', '<p>hi</p>');
    expect(html).toContain('border-collapse: collapse');
  });
});
