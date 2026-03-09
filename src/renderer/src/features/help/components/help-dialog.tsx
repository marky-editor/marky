import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { useSettingsStore } from '@renderer/features/settings/store';

const noDrag = {
  WebkitAppRegion: 'no-drag' as React.CSSProperties['WebkitAppRegion'],
};

type ShortcutEntry = {
  keys: string;
  label: string;
};

const isMac =
  typeof navigator !== 'undefined' &&
  (navigator.platform.toLowerCase().includes('mac') ||
    navigator.userAgent.includes('Mac'));

const mod = isMac ? '⌘' : 'Ctrl';

const formattingShortcuts: ShortcutEntry[] = [
  { keys: `${mod}+B`, label: 'Bold' },
  { keys: `${mod}+I`, label: 'Italic' },
  { keys: `${mod}+Shift+X`, label: 'Strikethrough' },
  { keys: `${mod}+1`, label: 'Heading 1' },
  { keys: `${mod}+2`, label: 'Heading 2' },
  { keys: `${mod}+Shift+7`, label: 'Ordered list' },
  { keys: `${mod}+Shift+8`, label: 'Bullet list' },
  { keys: `${mod}+Shift+9`, label: 'Task list' },
  { keys: `${mod}+Shift+.`, label: 'Blockquote' },
  { keys: `${mod}+E`, label: 'Code block' },
  { keys: `${mod}+K`, label: 'Link' },
];

const tableShortcuts: ShortcutEntry[] = [
  { keys: 'Tab', label: 'Next cell' },
  { keys: 'Shift+Tab', label: 'Previous cell' },
];

const editorShortcuts: ShortcutEntry[] = [
  { keys: `${mod}+A`, label: 'Select all' },
  { keys: `${mod}+D`, label: 'Select next occurrence' },
  { keys: `${mod}+F`, label: 'Find' },
  { keys: `${mod}+H`, label: 'Find & replace' },
  { keys: `${mod}+Z`, label: 'Undo' },
  { keys: `${mod}+${isMac ? 'Shift+Z' : 'Y'}`, label: 'Redo' },
  { keys: `Alt+↑ / ↓`, label: 'Move line up / down' },
  { keys: `${mod}+Shift+K`, label: 'Delete line' },
  { keys: `${mod}+/`, label: 'Toggle comment' },
];

const fileShortcuts: ShortcutEntry[] = [
  { keys: `${mod}+N`, label: 'New document' },
  { keys: `${mod}+O`, label: 'Open file' },
  { keys: `${mod}+S`, label: 'Save' },
  { keys: `${mod}+Shift+S`, label: 'Save a copy' },
  { keys: `${mod}+Alt+H`, label: 'Export HTML' },
  { keys: `${mod}+Alt+P`, label: 'Export PDF' },
];

const viewShortcuts: ShortcutEntry[] = [
  { keys: 'Alt+1', label: 'Editor only' },
  { keys: 'Alt+2', label: 'Split view' },
  { keys: 'Alt+3', label: 'Preview only' },
  { keys: 'F1', label: 'Keyboard shortcuts' },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-medium leading-none text-foreground/80 shadow-sm">
      {children}
    </kbd>
  );
}

function ShortcutRow({ entry }: { entry: ShortcutEntry }) {
  const parts = entry.keys.split('+').map((k) => k.trim());
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-sm text-foreground/80">{entry.label}</span>
      <span className="flex shrink-0 items-center gap-1">
        {parts.map((part, i) => (
          <Kbd key={i}>{part}</Kbd>
        ))}
      </span>
    </div>
  );
}

function ShortcutSection({
  title,
  entries,
}: {
  title: string;
  entries: ShortcutEntry[];
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      <div className="divide-y divide-border/50">
        {entries.map((entry) => (
          <ShortcutRow key={entry.label} entry={entry} />
        ))}
      </div>
    </div>
  );
}

export function HelpDialog() {
  const isHelpOpen = useSettingsStore((s) => s.isHelpOpen);
  const closeHelp = useSettingsStore((s) => s.closeHelp);

  useEffect(() => {
    if (!isHelpOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeHelp();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isHelpOpen, closeHelp]);

  if (!isHelpOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm"
      onClick={closeHelp}
      style={noDrag}
    >
      <div
        className="relative flex max-h-[calc(100vh-1.5rem)] w-[460px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={noDrag}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold tracking-wide">
              Keyboard Shortcuts
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              All shortcuts available in Marky.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={closeHelp}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="themed-scrollbar min-h-0 space-y-5 overflow-y-auto px-5 py-5 focus:outline-none" tabIndex={0} ref={(el) => el?.focus()}>
          <ShortcutSection title="Formatting" entries={formattingShortcuts} />
          <div className="border-t border-border" />
          <ShortcutSection
            title="Table Navigation"
            entries={tableShortcuts}
          />
          <div className="border-t border-border" />
          <ShortcutSection title="Editor" entries={editorShortcuts} />
          <div className="border-t border-border" />
          <ShortcutSection title="File" entries={fileShortcuts} />
          <div className="border-t border-border" />
          <ShortcutSection title="View" entries={viewShortcuts} />
        </div>
      </div>
    </div>
  );
}
