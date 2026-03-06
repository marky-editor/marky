import mermaid from 'mermaid';

let exportId = 0;

export function substituteMermaidSvgs(html: string, previewEl: HTMLElement | null): string {
  if (!previewEl) return html;
  const figures = Array.from(previewEl.querySelectorAll<HTMLElement>('.mermaid-figure'));
  if (figures.length === 0) return html;
  let i = 0;
  return html.replace(
    /<pre><code class="language-mermaid">[\s\S]*?<\/code><\/pre>/g,
    () => figures[i++]?.outerHTML ?? '',
  );
}

function decodeHtml(encoded: string): string {
  const ta = document.createElement('textarea');
  ta.innerHTML = encoded;
  return ta.value;
}

export async function renderMermaidInHtml(html: string): Promise<string> {
  const regex = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;
  const blocks = [...html.matchAll(regex)];

  if (blocks.length === 0) return html;

  let result = html;

  for (const [fullMatch, encoded] of blocks) {
    const source = decodeHtml(encoded);

    try {
      const { svg } = await mermaid.render(`marky-export-${exportId++}`, source);
      result = result.replace(
        fullMatch,
        `<figure class="mermaid-figure">${svg}</figure>`,
      );
    } catch {
      // Leave the block as-is on render failure
    }
  }

  return result;
}
