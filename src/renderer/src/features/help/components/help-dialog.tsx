import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { useSettingsStore } from '@renderer/features/settings/store';
import { useTranslation } from '@renderer/i18n';
import type { TranslationKeys } from '@renderer/i18n';

const noDrag = {
  WebkitAppRegion: 'no-drag' as React.CSSProperties['WebkitAppRegion'],
};

type ShortcutEntry = {
  keys: string;
  labelKey: keyof TranslationKeys;
};

const isMac =
  typeof navigator !== 'undefined' &&
  (navigator.platform.toLowerCase().includes('mac') ||
    navigator.userAgent.includes('Mac'));

const mod = isMac ? '⌘' : 'Ctrl';

const formattingShortcuts: ShortcutEntry[] = [
  { keys: `${mod}+B`, labelKey: 'help.bold' },
  { keys: `${mod}+I`, labelKey: 'help.italic' },
  { keys: `${mod}+Shift+X`, labelKey: 'help.strikethrough' },
  { keys: `${mod}+1`, labelKey: 'help.heading1' },
  { keys: `${mod}+2`, labelKey: 'help.heading2' },
  { keys: `${mod}+Shift+7`, labelKey: 'help.orderedList' },
  { keys: `${mod}+Shift+8`, labelKey: 'help.bulletList' },
  { keys: `${mod}+Shift+9`, labelKey: 'help.taskList' },
  { keys: `${mod}+Shift+.`, labelKey: 'help.blockquote' },
  { keys: `${mod}+E`, labelKey: 'help.codeBlock' },
  { keys: `${mod}+K`, labelKey: 'help.link' },
];

const tableShortcuts: ShortcutEntry[] = [
  { keys: 'Tab', labelKey: 'help.nextCell' },
  { keys: 'Shift+Tab', labelKey: 'help.prevCell' },
];

const editorShortcuts: ShortcutEntry[] = [
  { keys: `${mod}+A`, labelKey: 'help.selectAll' },
  { keys: `${mod}+D`, labelKey: 'help.selectNextOccurrence' },
  { keys: `${mod}+F`, labelKey: 'help.find' },
  { keys: `${mod}+H`, labelKey: 'help.findReplace' },
  { keys: `${mod}+Z`, labelKey: 'help.undo' },
  { keys: `${mod}+${isMac ? 'Shift+Z' : 'Y'}`, labelKey: 'help.redo' },
  { keys: `Alt+↑ / ↓`, labelKey: 'help.moveLine' },
  { keys: `${mod}+Shift+K`, labelKey: 'help.deleteLine' },
  { keys: `${mod}+/`, labelKey: 'help.toggleComment' },
];

const fileShortcuts: ShortcutEntry[] = [
  { keys: `${mod}+N`, labelKey: 'help.newDocument' },
  { keys: `${mod}+O`, labelKey: 'help.openFile' },
  { keys: `${mod}+S`, labelKey: 'help.save' },
  { keys: `${mod}+Shift+S`, labelKey: 'help.saveCopy' },
  { keys: `${mod}+Alt+H`, labelKey: 'help.exportHtml' },
  { keys: `${mod}+Alt+P`, labelKey: 'help.exportPdf' },
];

const viewShortcuts: ShortcutEntry[] = [
  { keys: 'Alt+1', labelKey: 'help.editorOnly' },
  { keys: 'Alt+2', labelKey: 'help.splitView' },
  { keys: 'Alt+3', labelKey: 'help.previewOnly' },
  { keys: 'F1', labelKey: 'help.keyboardShortcuts' },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-medium leading-none text-foreground/80 shadow-sm">
      {children}
    </kbd>
  );
}

function ShortcutRow({ entry }: { entry: ShortcutEntry }) {
  const { t } = useTranslation();
  const parts = entry.keys.split('+').map((k) => k.trim());
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-sm text-foreground/80">{t(entry.labelKey)}</span>
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
          <ShortcutRow key={entry.labelKey} entry={entry} />
        ))}
      </div>
    </div>
  );
}

export function HelpDialog() {
  const { t } = useTranslation();
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
              {t('help.title')}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('help.subtitle')}
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
          <ShortcutSection title={t('help.formatting')} entries={formattingShortcuts} />
          <div className="border-t border-border" />
          <ShortcutSection
            title={t('help.tableNavigation')}
            entries={tableShortcuts}
          />
          <div className="border-t border-border" />
          <ShortcutSection title={t('help.editor')} entries={editorShortcuts} />
          <div className="border-t border-border" />
          <ShortcutSection title={t('help.file')} entries={fileShortcuts} />
          <div className="border-t border-border" />
          <ShortcutSection title={t('help.view')} entries={viewShortcuts} />
        </div>
      </div>
    </div>
  );
}
