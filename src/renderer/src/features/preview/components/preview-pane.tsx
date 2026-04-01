import { useEffect, useMemo, useRef } from 'react';
import mermaid from 'mermaid';
import { toPreviewFontFamilyCss } from '@renderer/features/settings/lib/font-options';
import { useSettingsStore } from '@renderer/features/settings/store';
import { renderMarkdown } from '../lib/markdown';

type PreviewPaneProps = {
  markdown: string;
  documentPath?: string | null;
};

type MermaidTheme = 'light' | 'dark';

type MermaidThemeVariables = {
  primaryColor: string;
  primaryTextColor: string;
  primaryBorderColor: string;
  lineColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  edgeLabelBackground: string;
};

const mermaidCssVarMap: Record<keyof MermaidThemeVariables, string> = {
  primaryColor: '--mermaid-primary-color',
  primaryTextColor: '--mermaid-primary-text-color',
  primaryBorderColor: '--mermaid-primary-border-color',
  lineColor: '--mermaid-line-color',
  secondaryColor: '--mermaid-secondary-color',
  tertiaryColor: '--mermaid-tertiary-color',
  edgeLabelBackground: '--mermaid-edge-label-background',
};

function readMermaidThemeVariables(): MermaidThemeVariables {
  const styles = getComputedStyle(document.documentElement);

  return Object.fromEntries(
    Object.entries(mermaidCssVarMap).map(([key, cssVar]) => [
      key,
      styles.getPropertyValue(cssVar).trim(),
    ]),
  ) as MermaidThemeVariables;
}

function getMermaidConfig(
  previewFontFamily: string,
  previewFontSize: number,
): Parameters<typeof mermaid.initialize>[0] {
  return {
    startOnLoad: false,
    fontSize: previewFontSize,
    theme: 'base',
    themeVariables: {
      ...readMermaidThemeVariables(),
      fontFamily: toPreviewFontFamilyCss(previewFontFamily),
    },
  };
}

let initializedConfigKey: string | null = null;

function ensureMermaid(
  theme: MermaidTheme,
  previewFontFamily: string,
  previewFontSize: number,
) {
  const configKey = `${theme}:${previewFontFamily}:${previewFontSize}`;

  if (initializedConfigKey !== configKey) {
    mermaid.initialize(getMermaidConfig(previewFontFamily, previewFontSize));
    initializedConfigKey = configKey;
  }
}

const mermaidCache = new Map<string, string>();
let mermaidSeq = 0;

export function PreviewPane({ markdown, documentPath }: PreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const theme = useSettingsStore((state) => state.settings.theme);
  const previewFontFamily = useSettingsStore(
    (state) => state.settings.previewFontFamily,
  );
  const previewFontSize = useSettingsStore(
    (state) => state.settings.previewFontSize,
  );
  const html = useMemo(() => renderMarkdown(markdown, documentPath), [markdown, documentPath]);

  useEffect(() => {
    ensureMermaid(theme, previewFontFamily, previewFontSize);

    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = html;

    let cancelled = false;

    const blocks = Array.from(
      container.querySelectorAll<HTMLElement>('pre > code.language-mermaid'),
    );

    void Promise.all(
      blocks.map(async (block) => {
        const parent = block.parentElement;
        if (!parent) return;

        const source = block.textContent ?? '';
        const cacheKey = `${theme}:${previewFontFamily}:${previewFontSize}:${source}`;

        try {
          let svg = mermaidCache.get(cacheKey);

          if (!svg) {
            const result = await mermaid.render(
              `mermaid-${mermaidSeq++}`,
              source,
            );
            svg = result.svg;
            mermaidCache.set(cacheKey, svg);
          }

          if (cancelled) return;

          const figure = document.createElement('figure');
          figure.className = 'mermaid-figure';
          figure.innerHTML = svg;
          parent.replaceWith(figure);
        } catch (error) {
          if (cancelled) return;
          parent.classList.add('mermaid-error');
          parent.setAttribute(
            'data-error',
            error instanceof Error ? error.message : 'Invalid Mermaid syntax',
          );
        }
      }),
    );

    return () => {
      cancelled = true;
    };
  }, [html, previewFontFamily, previewFontSize, theme]);

  return <div ref={containerRef} className="preview-prose dark:prose-invert" />;
}
