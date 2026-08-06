import { useRef, useState } from 'react';
import {
  BookOpenText,
  ChevronDown,
  Clock,
  FileDown,
  FileOutput,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { cn } from '@renderer/lib/utils';
import { basename, dirname } from '@renderer/lib/paths';
import { modKey } from '@renderer/lib/platform';
import { noDrag } from '@renderer/lib/window-region';
import { useDismissOnOutside } from '@renderer/lib/use-dismiss-on-outside';
import { useTranslation } from '@renderer/i18n';

export function ReloadButton({ onReload }: { onReload: () => void }) {
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      style={noDrag}
      onClick={onReload}
      aria-label={t('titlebar.reload')}
      title={`${t('titlebar.reload')} (${modKey}+R)`}
    >
      <RefreshCw className="size-4" />
    </Button>
  );
}

export function ExportDropdown({
  onExportPdf,
  onExportHtml,
}: {
  onExportPdf: () => void;
  onExportHtml: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useDismissOnOutside(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className="relative" style={noDrag}>
      <Button
        variant="ghost"
        className="rounded-full"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <FileDown className="size-4" />
        {t('titlebar.export')}
        <ChevronDown
          className={cn('size-3 transition-transform', open && 'rotate-180')}
        />
      </Button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[152px] overflow-hidden rounded-xl border border-border/80 bg-card shadow-lg">
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setOpen(false);
              onExportPdf();
            }}
          >
            <FileDown className="size-4 shrink-0" />
            {t('titlebar.exportPdf')}
          </button>
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setOpen(false);
              onExportHtml();
            }}
          >
            <FileOutput className="size-4 shrink-0" />
            {t('titlebar.exportHtml')}
          </button>
        </div>
      )}
    </div>
  );
}

export function SplitOpenButton({
  recentFiles,
  onOpen,
  onOpenRecent,
  onRemoveRecent,
  onClearRecent,
}: {
  recentFiles: string[];
  onOpen: () => void;
  onOpenRecent: (path: string) => void;
  onRemoveRecent: (path: string) => void;
  onClearRecent: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useDismissOnOutside(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className="relative" style={noDrag}>
      <div className="flex items-center rounded-full transition-colors hover:bg-accent">
        <button
          className="flex items-center gap-1.5 rounded-l-full py-1.5 pl-3 pr-2 text-sm font-medium text-foreground/80 hover:text-foreground"
          onClick={onOpen}
        >
          <BookOpenText className="size-4 shrink-0" />
          {t('titlebar.open')}
        </button>
        <div className="h-4 w-px bg-border/70" />
        <button
          className="flex items-center rounded-r-full px-1.5 py-1.5 text-foreground/60 hover:text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={t('titlebar.recentFiles')}
        >
          <ChevronDown
            className={cn(
              'size-3.5 transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[260px] overflow-hidden rounded-xl border border-border/80 bg-card shadow-lg">
          {recentFiles.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
              <Clock className="size-3.5 shrink-0" />
              {t('titlebar.noRecentFiles')}
            </div>
          ) : (
            <>
              {recentFiles.map((filePath) => (
                <div
                  key={filePath}
                  className="group flex items-center gap-1 px-1 py-0.5 hover:bg-accent"
                >
                  <button
                    className="flex min-w-0 flex-1 flex-col gap-0.5 px-2 py-1.5 text-left"
                    onClick={() => {
                      setOpen(false);
                      onOpenRecent(filePath);
                    }}
                  >
                    <span className="truncate text-sm text-foreground/85 leading-none">
                      {basename(filePath)}
                    </span>
                    <span className="truncate text-xs text-muted-foreground leading-none">
                      {dirname(filePath)}
                    </span>
                  </button>
                  <button
                    className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveRecent(filePath);
                    }}
                    aria-label={t('titlebar.removeRecent', {
                      name: basename(filePath),
                    })}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              <div className="border-t border-border/60 px-1 py-0.5">
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => {
                    setOpen(false);
                    onClearRecent();
                  }}
                >
                  <Trash2 className="size-3.5 shrink-0" />
                  {t('titlebar.clearRecent')}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function SplitSaveButton({
  onSave,
  onSaveAs,
}: {
  onSave: () => void;
  onSaveAs: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useDismissOnOutside(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className="relative" style={noDrag}>
      <div className="flex items-center rounded-full transition-colors hover:bg-accent">
        <button
          className="flex items-center gap-1.5 rounded-l-full py-1.5 pl-3 pr-2 text-sm font-medium text-foreground/80 hover:text-foreground"
          onClick={onSave}
        >
          <Save className="size-4 shrink-0" />
          {t('titlebar.save')}
        </button>
        <div className="h-4 w-px bg-border/70" />
        <button
          className="flex items-center rounded-r-full px-1.5 py-1.5 text-foreground/60 hover:text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={t('titlebar.moreSaveOptions')}
        >
          <ChevronDown
            className={cn(
              'size-3.5 transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[168px] overflow-hidden rounded-xl border border-border/80 bg-card shadow-lg">
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setOpen(false);
              onSaveAs();
            }}
          >
            <Save className="size-4 shrink-0" />
            {t('titlebar.saveCopy')}
          </button>
        </div>
      )}
    </div>
  );
}
