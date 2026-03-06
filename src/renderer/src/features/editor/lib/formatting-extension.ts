import { syntaxTree } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import type { EditorState } from '@codemirror/state';
import type { FormattingState, DocumentStats } from '../store';

function computeStats(content: string): DocumentStats {
  const trimmed = content.trim();
  return {
    words: trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length,
    characters: content.length,
  };
}

/**
 * Walk up the syntax tree from `pos`, collecting all ancestor type names.
 * We probe both `pos` and `pos - 1` to handle the cursor sitting right on
 * a node boundary (e.g. right after the opening `**`).
 */
function collectAncestorNames(state: EditorState, pos: number): Set<string> {
  const names = new Set<string>();
  const tree = syntaxTree(state);

  for (const probe of [pos, pos - 1]) {
    if (probe < 0) continue;
    let cur = tree.resolveInner(probe, -1);
    while (true) {
      names.add(cur.type.name);
      if (!cur.parent) break;
      cur = cur.parent;
    }
  }

  return names;
}

function detectFormatting(state: EditorState): FormattingState {
  const pos = state.selection.main.head;
  const names = collectAncestorNames(state, pos);

  return {
    bold: names.has('StrongEmphasis'),
    italic: names.has('Emphasis'),
    strikethrough: names.has('Strikethrough'),
    code: names.has('InlineCode') || names.has('FencedCode'),
    link: names.has('Link'),
    heading1: names.has('ATXHeading1') || names.has('SetextHeading1'),
    heading2: names.has('ATXHeading2') || names.has('SetextHeading2'),
    blockquote: names.has('Blockquote'),
    bulletList: names.has('BulletList'),
    orderedList: names.has('OrderedList'),
  };
}

export function editorStateExtension(
  onFormatting: (f: FormattingState) => void,
  onStats: (s: DocumentStats) => void,
) {
  return EditorView.updateListener.of((update) => {
    if (update.selectionSet || update.docChanged) {
      onFormatting(detectFormatting(update.state));
    }
    if (update.docChanged) {
      onStats(computeStats(update.state.doc.toString()));
    }
  });
}
