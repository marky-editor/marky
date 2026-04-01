import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

function isRelativePath(src: string): boolean {
  try {
    new URL(src);
    return false;
  } catch {
    return !src.startsWith('data:');
  }
}

function toLocalAssetUrl(baseDir: string, relativePath: string): string {
  return `local-asset://asset?base=${encodeURIComponent(baseDir)}&path=${encodeURIComponent(relativePath)}`;
}

function rehypeResolveLocalImages(baseDir: string) {
  return () => (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img' && typeof node.properties.src === 'string') {
        const src = node.properties.src;
        if (isRelativePath(src)) {
          node.properties.src = toLocalAssetUrl(baseDir, src);
        }
      }
    });
  };
}

function createProcessor(baseDir?: string) {
  const pipeline = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkRehype)

  if (baseDir) {
    pipeline.use(rehypeResolveLocalImages(baseDir));
  }

  return pipeline.use(rehypeStringify);
}

const defaultProcessor = createProcessor();

export function renderMarkdown(markdown: string, documentPath?: string | null) {
  if (documentPath) {
    const lastSep = Math.max(documentPath.lastIndexOf('/'), documentPath.lastIndexOf('\\'));
    const baseDir = documentPath.substring(0, lastSep);
    return createProcessor(baseDir).processSync(markdown).toString();
  }
  return defaultProcessor.processSync(markdown).toString();
}
