import { useEffect, useRef, useState } from 'react';
import {
  BookOpenText,
  ChevronDown,
  CircleHelp,
  Clock,
  FileDown,
  FileOutput,
  FilePlus,
  Maximize2,
  Minus,
  PanelLeft,
  PanelRight,
  Save,
  ScanSearch,
  Settings,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { cn } from '@renderer/lib/utils';
import type { Platform, ViewMode } from '@shared/types';
import { useTranslation } from '@renderer/i18n';
import type { TranslationKeys } from '@renderer/i18n';

function getPlatform(): Platform {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('mac') || navigator.userAgent.includes('Mac')) {
    return 'macos';
  }
  if (platform.includes('linux')) {
    return 'linux';
  }
  return 'windows';
}

interface TitleBarProps {
  documentName: string;
  isDirty: boolean;
  canCreateNewDocument: boolean;
  viewMode: ViewMode;
  recentFiles: string[];
  onNew: () => void;
  onOpen: () => void;
  onOpenRecent: (path: string) => void;
  onRemoveRecent: (path: string) => void;
  onClearRecent: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExportPdf: () => void;
  onExportHtml: () => void;
  onSettings: () => void;
  onHelp: () => void;
  onViewModeChange: (mode: ViewMode) => void;
}

const viewOptionKeys: Array<{
  mode: ViewMode;
  labelKey: keyof TranslationKeys;
  icon: typeof PanelLeft;
}> = [
  { mode: 'editor', labelKey: 'titlebar.viewEditor', icon: PanelLeft },
  { mode: 'split', labelKey: 'titlebar.viewSplit', icon: ScanSearch },
  { mode: 'preview', labelKey: 'titlebar.viewPreview', icon: PanelRight },
];

const drag = {
  WebkitAppRegion: 'drag' as React.CSSProperties['WebkitAppRegion'],
};
const noDrag = {
  WebkitAppRegion: 'no-drag' as React.CSSProperties['WebkitAppRegion'],
};

function ExportDropdown({
  onExportPdf,
  onExportHtml,
}: {
  onExportPdf: () => void;
  onExportHtml: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

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

function getBasename(filePath: string) {
  return filePath.replace(/\\/g, '/').split('/').at(-1) ?? filePath;
}

function getDirname(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/');
  const idx = normalized.lastIndexOf('/');
  return idx > 0 ? normalized.slice(0, idx) : '';
}

function SplitOpenButton({
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

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

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
                      {getBasename(filePath)}
                    </span>
                    <span className="truncate text-xs text-muted-foreground leading-none">
                      {getDirname(filePath)}
                    </span>
                  </button>
                  <button
                    className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveRecent(filePath);
                    }}
                    aria-label={`Remove ${getBasename(filePath)} from recent files`}
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

function SplitSaveButton({
  onSave,
  onSaveAs,
}: {
  onSave: () => void;
  onSaveAs: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

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

export function TitleBar({
  documentName,
  isDirty,
  canCreateNewDocument,
  viewMode,
  recentFiles,
  onNew,
  onOpen,
  onOpenRecent,
  onRemoveRecent,
  onClearRecent,
  onSave,
  onSaveAs,
  onExportPdf,
  onExportHtml,
  onSettings,
  onHelp,
  onViewModeChange,
}: TitleBarProps) {
  const { t } = useTranslation();
  const platform = getPlatform();
  const isMac = platform === 'macos';
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    void window.marky.windowIsMaximized().then(setIsMaximized);
    const interval = setInterval(() => {
      void window.marky.windowIsMaximized().then(setIsMaximized);
    }, 500);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'F1') {
        e.preventDefault();
        onHelp();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onHelp]);

  const macControls = (
    <div className="flex items-center gap-1.5" style={noDrag}>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full hover:bg-red-500/90 hover:text-white"
        onClick={() => window.marky.windowClose()}
        aria-label={t('titlebar.close')}
      >
        <X className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full hover:bg-yellow-500/90 hover:text-white"
        onClick={() => window.marky.windowMinimize()}
        aria-label={t('titlebar.minimize')}
      >
        <Minus className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full hover:bg-green-500/90 hover:text-white"
        onClick={() => window.marky.windowMaximize()}
        aria-label={isMaximized ? t('titlebar.restore') : t('titlebar.maximize')}
      >
        {isMaximized ? (
          <Square className="size-3" />
        ) : (
          <Maximize2 className="size-3" />
        )}
      </Button>
    </div>
  );

  const winLinuxControls = (
    <div className="flex items-center" style={noDrag}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none hover:bg-accent"
        onClick={() => window.marky.windowMinimize()}
        aria-label={t('titlebar.minimize')}
      >
        <Minus className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none hover:bg-accent"
        onClick={() => window.marky.windowMaximize()}
        aria-label={isMaximized ? t('titlebar.restore') : t('titlebar.maximize')}
      >
        {isMaximized ? (
          <Square className="size-3.5" />
        ) : (
          <Maximize2 className="size-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none hover:bg-red-500 hover:text-white"
        onClick={() => window.marky.windowClose()}
        aria-label={t('titlebar.close')}
      >
        <X className="size-4" />
      </Button>
    </div>
  );

  const fileActions = (
    <div className="flex items-center gap-1" style={noDrag}>
      <Button
        variant="ghost"
        className="rounded-full"
        onClick={onNew}
        disabled={!canCreateNewDocument}
      >
        <FilePlus className="size-4" />
      </Button>
      <SplitOpenButton
        recentFiles={recentFiles}
        onOpen={onOpen}
        onOpenRecent={onOpenRecent}
        onRemoveRecent={onRemoveRecent}
        onClearRecent={onClearRecent}
      />
      <SplitSaveButton onSave={onSave} onSaveAs={onSaveAs} />
      <ExportDropdown onExportPdf={onExportPdf} onExportHtml={onExportHtml} />
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={onSettings}
        aria-label={t('titlebar.settings')}
      >
        <Settings className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={onHelp}
        aria-label={t('titlebar.keyboardShortcuts')}
        title={`${t('titlebar.keyboardShortcuts')} (F1)`}
      >
        <CircleHelp className="size-4" />
      </Button>
    </div>
  );

  const viewSwitcher = (
    <div
      className="flex items-center gap-1 rounded-full border border-border/80 bg-background/60 p-1"
      style={noDrag}
    >
      {viewOptionKeys.map(({ mode, labelKey, icon: Icon }) => (
        <Button
          key={mode}
          variant={viewMode === mode ? 'subtle' : 'ghost'}
          size="sm"
          className="rounded-full"
          onClick={() => onViewModeChange(mode)}
        >
          <Icon className="size-4" />
          <span className="hidden md:inline">{t(labelKey)}</span>
        </Button>
      ))}
    </div>
  );

  return (
    <header
      className="flex items-center gap-3 border-b border-border/80 bg-background/90 px-3 py-1.5 select-none"
      style={drag}
    >
      <div className="flex shrink-0 items-center gap-2">
        {isMac && macControls}
        {fileActions}
      </div>

      <div
        className="min-w-0 flex-1 overflow-hidden px-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70"
        style={drag}
      >
        <span className="block truncate" title={documentName}>
          {isDirty ? '\u2022 ' : ''}
          {documentName}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {viewSwitcher}
        {!isMac && winLinuxControls}
      </div>
    </header>
  );
}
