import { SectionHeading } from '@renderer/components/ui/field';
import { Modal } from '@renderer/components/ui/modal';
import { useSettingsStore } from '@renderer/features/settings/store';
import { useTranslation } from '@renderer/i18n';
import { isMac, modKey as mod } from '@renderer/lib/platform';
import { shortcutDisplay } from '@renderer/features/editor/lib/formatting-shortcuts';
import type { ToolbarActionId } from '@renderer/features/editor/lib/toolbar-actions';
import type { TranslationKeys } from '@renderer/i18n';

type ShortcutEntry = {
  keys: string;
  labelKey: keyof TranslationKeys;
};

// Labels are the help dialog's own; the key combos come from the editor.
const formattingLabels: Array<{
  id: ToolbarActionId;
  labelKey: keyof TranslationKeys;
}> = [
  { id: 'bold', labelKey: 'help.bold' },
  { id: 'italic', labelKey: 'help.italic' },
  { id: 'strike', labelKey: 'help.strikethrough' },
  { id: 'h1', labelKey: 'help.heading1' },
  { id: 'h2', labelKey: 'help.heading2' },
  { id: 'ordered', labelKey: 'help.orderedList' },
  { id: 'bullet', labelKey: 'help.bulletList' },
  { id: 'task', labelKey: 'help.taskList' },
  { id: 'quote', labelKey: 'help.blockquote' },
  { id: 'code', labelKey: 'help.codeBlock' },
  { id: 'link', labelKey: 'help.link' },
];

const formattingShortcuts: ShortcutEntry[] = formattingLabels.map(
  ({ id, labelKey }) => ({ keys: shortcutDisplay[id] ?? '', labelKey }),
);

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
  { keys: `${mod}+R`, labelKey: 'help.reload' },
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
    <kbd className="inline-flex items-center justify-center rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 font-mono text-sub font-medium leading-none text-foreground/80 shadow-sm">
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
      <SectionHeading>{title}</SectionHeading>
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

  if (!isHelpOpen) return null;

  return (
    <Modal
      title={t('help.title')}
      subtitle={t('help.subtitle')}
      className="w-[460px]"
      scrollableBody
      bodyClassName="space-y-5"
      onClose={closeHelp}
    >
      <ShortcutSection
        title={t('help.formatting')}
        entries={formattingShortcuts}
      />
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
    </Modal>
  );
}
