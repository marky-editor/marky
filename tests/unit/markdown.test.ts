import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '@renderer/features/preview/lib/markdown';

describe('renderMarkdown', () => {
  it('renders a paragraph', () => {
    expect(renderMarkdown('Hello world')).toBe('<p>Hello world</p>');
  });

  it('renders headings', () => {
    expect(renderMarkdown('# Title')).toBe('<h1>Title</h1>');
    expect(renderMarkdown('## Subtitle')).toBe('<h2>Subtitle</h2>');
  });

  it('renders inline formatting', () => {
    expect(renderMarkdown('**bold**')).toBe('<p><strong>bold</strong></p>');
    expect(renderMarkdown('*italic*')).toBe('<p><em>italic</em></p>');
    expect(renderMarkdown('~~struck~~')).toBe('<p><del>struck</del></p>');
  });

  it('renders links', () => {
    expect(renderMarkdown('[text](https://example.com)')).toBe(
      '<p><a href="https://example.com">text</a></p>',
    );
  });

  it('renders unordered lists', () => {
    const md = '- one\n- two\n- three';
    const html = renderMarkdown(md);
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>one</li>');
    expect(html).toContain('<li>two</li>');
    expect(html).toContain('<li>three</li>');
  });

  it('renders ordered lists', () => {
    const md = '1. first\n2. second';
    const html = renderMarkdown(md);
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>first</li>');
    expect(html).toContain('<li>second</li>');
  });

  it('renders code blocks', () => {
    const md = '```\nconsole.log("hi")\n```';
    const html = renderMarkdown(md);
    expect(html).toContain('<pre>');
    expect(html).toContain('<code>');
  });

  it('renders inline code', () => {
    expect(renderMarkdown('use `npm install`')).toContain(
      '<code>npm install</code>',
    );
  });

  it('renders blockquotes', () => {
    expect(renderMarkdown('> a quote')).toContain('<blockquote>');
  });

  it('renders GFM tables', () => {
    const md = '| A | B |\n| --- | --- |\n| 1 | 2 |';
    const html = renderMarkdown(md);
    expect(html).toContain('<table>');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>1</td>');
  });

  it('renders GFM task lists', () => {
    const md = '- [ ] todo\n- [x] done';
    const html = renderMarkdown(md);
    expect(html).toContain('type="checkbox"');
  });

  it('preserves mermaid code blocks for downstream processing', () => {
    const md = '```mermaid\nflowchart LR\n  A --> B\n```';
    const html = renderMarkdown(md);
    expect(html).toContain('language-mermaid');
  });

  it('returns empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('');
  });

  it('renders line breaks (remark-breaks)', () => {
    const md = 'line one\nline two';
    const html = renderMarkdown(md);
    expect(html).toContain('<br>');
  });
});
