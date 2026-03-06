import type { EditorView } from '@codemirror/view';
import type { EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

export type ToolbarActionId =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'h1'
  | 'h2'
  | 'bullet'
  | 'ordered'
  | 'task'
  | 'quote'
  | 'code'
  | 'link'
  | 'image'
  | 'table';

export type LinkInsertPayload = {
  text: string;
  url: string;
};

export type ImageInsertPayload = {
  altText: string;
  url: string;
};

export type TableInsertPayload = {
  columns: number;
  rows: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Walk up the syntax tree from pos and return the first node whose type name
 *  matches one of the given names, or null if none found. */
function findAncestor(state: EditorState, pos: number, ...typeNames: string[]) {
  const tree = syntaxTree(state);
  let cur = tree.resolveInner(pos, -1);
  while (true) {
    if (typeNames.includes(cur.type.name)) return cur;
    if (!cur.parent) return null;
    cur = cur.parent;
  }
}

/** Replace the current selection with `transform(selectedText)`. */
function updateSelection(
  view: EditorView,
  transform: (value: string) => { text: string; from?: number; to?: number },
) {
  const sel = view.state.selection.main;
  const selected = view.state.doc.sliceString(sel.from, sel.to);
  const next = transform(selected);
  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert: next.text },
    selection: {
      anchor: next.from ?? sel.from,
      head: next.to ?? sel.from + next.text.length,
    },
  });
  view.focus();
}

/** Prepend `prefix` to every line in `value`. */
function prefixLines(value: string, prefix: string) {
  return (value || 'Item')
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');
}

/** Remove inline formatting markers of `markerLen` chars from both ends of a node. */
function removeInlineMarkers(
  view: EditorView,
  from: number,
  to: number,
  markerLen: number,
) {
  const inner = view.state.doc.sliceString(from + markerLen, to - markerLen);
  view.dispatch({
    changes: { from, to, insert: inner },
    selection: { anchor: from, head: from + inner.length },
  });
  view.focus();
}

/** Strip a regex pattern from the start of every line in [from, to]. */
function removeLinePrefix(
  view: EditorView,
  from: number,
  to: number,
  pattern: RegExp,
) {
  const text = view.state.doc.sliceString(from, to);
  const stripped = text
    .split('\n')
    .map((line) => line.replace(pattern, ''))
    .join('\n');
  view.dispatch({ changes: { from, to, insert: stripped } });
  view.focus();
}

function buildTableMarkdown(columns: number, rows: number) {
  const safeColumns = Math.max(1, columns);
  const safeRows = Math.max(1, rows);
  const header = `| ${Array.from({ length: safeColumns }, (_, index) => `Column ${index + 1}`).join(' | ')} |`;
  const divider = `| ${Array.from({ length: safeColumns }, () => '---').join(' | ')} |`;
  const body = Array.from(
    { length: safeRows },
    () => `| ${Array.from({ length: safeColumns }, () => '').join(' | ')} |`,
  ).join('\n');

  return `${header}\n${divider}\n${body}`;
}

export function getSelectedText(view: EditorView) {
  const sel = view.state.selection.main;
  return view.state.doc.sliceString(sel.from, sel.to);
}

export function isSelectionInsideLink(view: EditorView) {
  const pos = view.state.selection.main.head;
  return Boolean(findAncestor(view.state, pos, 'Link'));
}

export function insertLink(view: EditorView, payload: LinkInsertPayload) {
  updateSelection(view, () => ({
    text: `[${payload.text || payload.url}](${payload.url})`,
  }));
}

export function insertImage(view: EditorView, payload: ImageInsertPayload) {
  updateSelection(view, () => ({
    text: `![${payload.altText}](${payload.url})`,
  }));
}

export function insertTable(view: EditorView, payload: TableInsertPayload) {
  updateSelection(view, () => ({
    text: buildTableMarkdown(payload.columns, payload.rows),
  }));
}

// ---------------------------------------------------------------------------
// Main action dispatcher
// ---------------------------------------------------------------------------

export function applyToolbarAction(view: EditorView, action: ToolbarActionId) {
  const { state } = view;
  const pos = state.selection.main.head;

  switch (action) {
    case 'bold': {
      const node = findAncestor(state, pos, 'StrongEmphasis');
      if (node) {
        removeInlineMarkers(view, node.from, node.to, 2);
      } else {
        updateSelection(view, (v) => ({ text: `**${v || 'bold text'}**` }));
      }
      return;
    }

    case 'italic': {
      const node = findAncestor(state, pos, 'Emphasis');
      if (node) {
        // EmphasisMark is always 1 char (* or _)
        removeInlineMarkers(view, node.from, node.to, 1);
      } else {
        updateSelection(view, (v) => ({ text: `*${v || 'italic text'}*` }));
      }
      return;
    }

    case 'strike': {
      const node = findAncestor(state, pos, 'Strikethrough');
      if (node) {
        removeInlineMarkers(view, node.from, node.to, 2);
      } else {
        updateSelection(view, (v) => ({ text: `~~${v || 'struck text'}~~` }));
      }
      return;
    }

    case 'h1': {
      const node = findAncestor(state, pos, 'ATXHeading1', 'SetextHeading1');
      if (node) {
        const line = state.doc.lineAt(node.from);
        view.dispatch({
          changes: {
            from: line.from,
            to: line.to,
            insert: line.text.replace(/^#+\s+/, ''),
          },
          selection: { anchor: line.from },
        });
        view.focus();
      } else {
        updateSelection(view, (v) => ({
          text: prefixLines(v || 'Heading', '# '),
        }));
      }
      return;
    }

    case 'h2': {
      const node = findAncestor(state, pos, 'ATXHeading2', 'SetextHeading2');
      if (node) {
        const line = state.doc.lineAt(node.from);
        view.dispatch({
          changes: {
            from: line.from,
            to: line.to,
            insert: line.text.replace(/^#+\s+/, ''),
          },
          selection: { anchor: line.from },
        });
        view.focus();
      } else {
        updateSelection(view, (v) => ({
          text: prefixLines(v || 'Heading', '## '),
        }));
      }
      return;
    }

    case 'bullet': {
      const node = findAncestor(state, pos, 'BulletList');
      if (node) {
        const from = state.doc.lineAt(node.from).from;
        const to = state.doc.lineAt(node.to).to;
        removeLinePrefix(view, from, to, /^[-*+] (\[.\] )?/);
      } else {
        updateSelection(view, (v) => ({
          text: prefixLines(v || 'List item', '- '),
        }));
      }
      return;
    }

    case 'ordered': {
      const node = findAncestor(state, pos, 'OrderedList');
      if (node) {
        const from = state.doc.lineAt(node.from).from;
        const to = state.doc.lineAt(node.to).to;
        removeLinePrefix(view, from, to, /^\d+\.\s+/);
      } else {
        updateSelection(view, (v) => ({
          text: (v || 'List item')
            .split('\n')
            .map((line, i) => `${i + 1}. ${line}`)
            .join('\n'),
        }));
      }
      return;
    }

    case 'task': {
      // Toggle checkbox on the current line only
      const line = state.doc.lineAt(pos);
      if (/^[-*+] \[.\] /.test(line.text)) {
        // Remove the checkbox, keep the bullet
        const newText = line.text.replace(/^([-*+]) \[.\] /, '$1 ');
        view.dispatch({
          changes: { from: line.from, to: line.to, insert: newText },
        });
        view.focus();
      } else {
        updateSelection(view, (v) => ({
          text: prefixLines(v || 'Task item', '- [ ] '),
        }));
      }
      return;
    }

    case 'quote': {
      const node = findAncestor(state, pos, 'Blockquote');
      if (node) {
        const from = state.doc.lineAt(node.from).from;
        const to = state.doc.lineAt(node.to).to;
        removeLinePrefix(view, from, to, /^>\s?/);
      } else {
        updateSelection(view, (v) => ({
          text: prefixLines(v || 'Quoted idea', '> '),
        }));
      }
      return;
    }

    case 'code': {
      const fencedNode = findAncestor(state, pos, 'FencedCode');
      if (fencedNode) {
        const from = state.doc.lineAt(fencedNode.from).from;
        const to = state.doc.lineAt(fencedNode.to).to;
        const lines = state.doc.sliceString(from, to).split('\n');
        // Drop the opening fence line and the closing fence line
        const inner = lines
          .slice(1, lines.at(-1)?.trim() === '' ? -2 : -1)
          .join('\n');
        view.dispatch({
          changes: { from, to, insert: inner },
          selection: { anchor: from },
        });
        view.focus();
      } else {
        const inlineNode = findAncestor(state, pos, 'InlineCode');
        if (inlineNode) {
          const text = state.doc.sliceString(inlineNode.from, inlineNode.to);
          const markerLen = text.startsWith('``') ? 2 : 1;
          removeInlineMarkers(view, inlineNode.from, inlineNode.to, markerLen);
        } else {
          updateSelection(view, (v) => ({
            text: `\`\`\`\n${v || 'code block'}\n\`\`\``,
          }));
        }
      }
      return;
    }

    case 'link': {
      const node = findAncestor(state, pos, 'Link');
      if (node) {
        const fullText = state.doc.sliceString(node.from, node.to);
        const match = /^\[([^\]]*)\]/.exec(fullText);
        const linkText = match ? match[1] : fullText;
        view.dispatch({
          changes: { from: node.from, to: node.to, insert: linkText },
          selection: { anchor: node.from, head: node.from + linkText.length },
        });
        view.focus();
      } else {
        insertLink(view, {
          text: getSelectedText(view) || 'Link text',
          url: 'https://example.com',
        });
      }
      return;
    }

    case 'image':
      insertImage(view, {
        altText: getSelectedText(view) || 'Alt text',
        url: 'https://placehold.co/1200x800',
      });
      return;

    case 'table':
      insertTable(view, { columns: 3, rows: 3 });
      return;
  }
}
