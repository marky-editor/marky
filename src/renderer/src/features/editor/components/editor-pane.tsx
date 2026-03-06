import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { TableProperties } from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { useEditorStore } from '../store';
import { editorStateExtension } from '../lib/formatting-extension';
import {
  getHoveredTableHeader,
  normalizeTableSpacing,
} from '../lib/table-formatting';
import { tableNavigationExtension } from '../lib/table-navigation';

type EditorPaneProps = {
  value: string;
  onChange: (value: string) => void;
  onReady: (view: EditorView) => void;
};

type TableHoverButtonState = {
  tableFrom: number;
  left: number;
  top: number;
};

const tableHoverButtonWidth = 104;

const theme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: 'transparent',
    color: 'var(--editor-text)',
    fontSize: 'var(--editor-font-size)',
  },
  '.cm-scroller': {
    fontFamily: 'var(--editor-font-family)',
    lineHeight: '1.85',
    padding: '2.5rem 2.75rem 6rem',
  },
  '.cm-content, .cm-gutter': {
    minHeight: '100%',
  },
  '.cm-focused': {
    outline: 'none',
  },
  '.cm-line': {
    padding: '0',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--editor-cursor)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--editor-active-line)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--editor-selection) !important',
  },
});

export function EditorPane({ value, onChange, onReady }: EditorPaneProps) {
  const setFormatting = useEditorStore((state) => state.setFormatting);
  const setStats = useEditorStore((state) => state.setStats);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [tableHoverButton, setTableHoverButton] =
    useState<TableHoverButtonState | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hoverButtonRef = useRef<HTMLDivElement | null>(null);

  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage }),
      tableNavigationExtension,
      EditorView.lineWrapping,
      theme,
      editorStateExtension(setFormatting, setStats),
    ],
    [setFormatting, setStats],
  );

  const handleReady = useCallback(
    (view: EditorView) => {
      setEditorView(view);
      const content = view.state.doc.toString();
      const trimmed = content.trim();
      setStats({
        words: trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length,
        characters: content.length,
      });
      onReady(view);
    },
    [onReady, setStats],
  );

  const clearTableHoverButton = useCallback(() => {
    setTableHoverButton(null);
  }, []);

  const updateTableHoverButton = useCallback(
    (clientX: number, clientY: number) => {
      if (!editorView || !wrapperRef.current) {
        clearTableHoverButton();
        return;
      }

      const hoveredHeader = getHoveredTableHeader(editorView, clientX, clientY);
      if (!hoveredHeader) {
        clearTableHoverButton();
        return;
      }

      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const maxLeft = Math.max(
        12,
        wrapperRect.width - tableHoverButtonWidth - 12,
      );
      const left = Math.min(
        Math.max(clientX - wrapperRect.left + 12, 12),
        maxLeft,
      );
      const top = Math.max(
        12,
        hoveredHeader.top -
          wrapperRect.top +
          Math.max((hoveredHeader.bottom - hoveredHeader.top - 32) / 2, 0),
      );

      setTableHoverButton((current) => {
        if (current && current.tableFrom === hoveredHeader.tableFrom) {
          return current;
        }

        return {
          tableFrom: hoveredHeader.tableFrom,
          left,
          top,
        };
      });
    },
    [clearTableHoverButton, editorView],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (hoverButtonRef.current?.contains(event.target as Node)) {
        return;
      }

      updateTableHoverButton(event.clientX, event.clientY);
    },
    [updateTableHoverButton],
  );

  const handleNormalizeTable = useCallback(
    (tableFrom: number) => {
      if (!editorView) {
        return;
      }

      normalizeTableSpacing(editorView, tableFrom);
      clearTableHoverButton();
    },
    [clearTableHoverButton, editorView],
  );

  useEffect(() => {
    if (!editorView) {
      return;
    }

    function hideButton() {
      clearTableHoverButton();
    }

    editorView.scrollDOM.addEventListener('scroll', hideButton);
    window.addEventListener('resize', hideButton);
    return () => {
      editorView.scrollDOM.removeEventListener('scroll', hideButton);
      window.removeEventListener('resize', hideButton);
    };
  }, [clearTableHoverButton, editorView]);

  return (
    <div
      ref={wrapperRef}
      className="relative h-full"
      onMouseLeave={clearTableHoverButton}
      onMouseMove={handleMouseMove}
    >
      <CodeMirror
        value={value}
        height="100%"
        style={{ height: '100%' }}
        theme="none"
        extensions={extensions}
        indentWithTab={false}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLineGutter: false,
          searchKeymap: true,
        }}
        onChange={onChange}
        onCreateEditor={handleReady}
      />

      {tableHoverButton && (
        <div
          ref={hoverButtonRef}
          className="pointer-events-none absolute z-20"
          style={{ left: tableHoverButton.left, top: tableHoverButton.top }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="pointer-events-auto h-8 gap-1.5 rounded-full border-border/80 bg-card/92 px-3 text-foreground/85 shadow-lg backdrop-blur"
            aria-label="Normalize table spacing"
            title="Normalize table spacing"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => handleNormalizeTable(tableHoverButton.tableFrom)}
          >
            <TableProperties className="size-4" />
            <span>Align</span>
          </Button>
        </div>
      )}
    </div>
  );
}
