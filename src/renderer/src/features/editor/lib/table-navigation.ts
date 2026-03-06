import { syntaxTree } from '@codemirror/language';
import { Prec, type EditorState } from '@codemirror/state';
import { keymap, type EditorView, type KeyBinding } from '@codemirror/view';
import type { SyntaxNode } from '@lezer/common';

type TableCellRange = {
  from: number;
  to: number;
};

type TableRowInfo = {
  from: number;
  to: number;
  cells: TableCellRange[];
};

type FlatTableCell = {
  cell: TableCellRange;
  rowIndex: number;
  cellIndex: number;
};

function findAncestor(node: SyntaxNode | null, names: string[]) {
  let current = node;

  while (current) {
    if (names.includes(current.type.name)) {
      return current;
    }
    current = current.parent;
  }

  return null;
}

function findCurrentTableRow(state: EditorState, position: number) {
  const tree = syntaxTree(state);
  const probes = Array.from(
    new Set(
      [position, position - 1, position + 1].filter(
        (probe) => probe >= 0 && probe <= state.doc.length,
      ),
    ),
  );

  for (const probe of probes) {
    const resolved = tree.resolveInner(probe, -1);
    const row = findAncestor(resolved, ['TableHeader', 'TableRow']);
    if (row) {
      return row;
    }
  }

  return null;
}

function parseTableCells(lineFrom: number, lineText: string) {
  const pipePositions: number[] = [];
  let escaped = false;

  for (let index = 0; index < lineText.length; index += 1) {
    const char = lineText[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '|') {
      pipePositions.push(index);
    }
  }

  if (pipePositions.length < 2) {
    return [];
  }

  const boundaries: number[] = [];
  if (pipePositions[0] > 0) {
    boundaries.push(-1);
  }
  boundaries.push(...pipePositions);
  if (pipePositions.at(-1)! < lineText.length - 1) {
    boundaries.push(lineText.length);
  }

  const cells: TableCellRange[] = [];
  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const from = lineFrom + boundaries[index] + 1;
    const to = lineFrom + boundaries[index + 1];
    if (from <= to) {
      cells.push({ from, to });
    }
  }

  return cells;
}

function collectTableRows(state: EditorState, tableNode: SyntaxNode) {
  const rows: TableRowInfo[] = [];

  for (let child = tableNode.firstChild; child; child = child.nextSibling) {
    if (child.type.name !== 'TableHeader' && child.type.name !== 'TableRow') {
      continue;
    }

    const cells = parseTableCells(
      child.from,
      state.doc.sliceString(child.from, child.to),
    );

    if (cells.length > 0) {
      rows.push({ from: child.from, to: child.to, cells });
    }
  }

  return rows;
}

function findCellIndex(cells: TableCellRange[], position: number) {
  if (cells.length === 0) {
    return -1;
  }

  if (position <= cells[0].from) {
    return 0;
  }

  for (let index = 0; index < cells.length; index += 1) {
    if (position <= cells[index].to) {
      return index;
    }
  }

  return cells.length - 1;
}

function getCellSelection(
  state: EditorState,
  cell: TableCellRange,
  direction: -1 | 1,
) {
  let contentFrom = cell.from;
  let contentTo = cell.to;

  while (
    contentFrom < contentTo &&
    /\s/.test(state.doc.sliceString(contentFrom, contentFrom + 1))
  ) {
    contentFrom += 1;
  }

  while (
    contentTo > contentFrom &&
    /\s/.test(state.doc.sliceString(contentTo - 1, contentTo))
  ) {
    contentTo -= 1;
  }

  if (contentFrom < contentTo) {
    const position = direction === 1 ? contentFrom : contentTo;
    return { anchor: position, head: position };
  }

  if (cell.to > cell.from) {
    const midpoint = cell.from + Math.floor((cell.to - cell.from) / 2);
    return { anchor: midpoint, head: midpoint };
  }

  return { anchor: cell.from, head: cell.from };
}

function getTableNavigationContext(state: EditorState) {
  const position = state.selection.main.head;
  const rowNode = findCurrentTableRow(state, position);
  if (!rowNode) {
    return null;
  }

  const tableNode = findAncestor(rowNode, ['Table']);
  if (!tableNode) {
    return null;
  }

  const rows = collectTableRows(state, tableNode);
  const rowIndex = rows.findIndex(
    (row) => row.from === rowNode.from && row.to === rowNode.to,
  );
  if (rowIndex < 0) {
    return null;
  }

  const cellIndex = findCellIndex(rows[rowIndex].cells, position);
  if (cellIndex < 0) {
    return null;
  }

  const flatCells: FlatTableCell[] = rows.flatMap((row, currentRowIndex) =>
    row.cells.map((cell, currentCellIndex) => ({
      cell,
      rowIndex: currentRowIndex,
      cellIndex: currentCellIndex,
    })),
  );

  const flatIndex = flatCells.findIndex(
    (entry) => entry.rowIndex === rowIndex && entry.cellIndex === cellIndex,
  );
  if (flatIndex < 0) {
    return null;
  }

  return { flatCells, flatIndex };
}

function moveBetweenTableCells(view: EditorView, direction: -1 | 1) {
  const context = getTableNavigationContext(view.state);
  if (!context) {
    return false;
  }

  const targetIndex = context.flatIndex + direction;
  if (targetIndex < 0 || targetIndex >= context.flatCells.length) {
    return true;
  }

  view.dispatch({
    selection: getCellSelection(
      view.state,
      context.flatCells[targetIndex].cell,
      direction,
    ),
    scrollIntoView: true,
  });
  view.focus();
  return true;
}

const tableNavigationKeymap: readonly KeyBinding[] = [
  {
    key: 'Tab',
    preventDefault: true,
    run: (view) => moveBetweenTableCells(view, 1),
  },
  {
    key: 'Shift-Tab',
    preventDefault: true,
    run: (view) => moveBetweenTableCells(view, -1),
  },
];

export const tableNavigationExtension = Prec.highest(
  keymap.of(tableNavigationKeymap),
);
