import { useEffect, useState } from 'react';
import {
  CircleHelp,
  FilePlus,
  Maximize2,
  Minus,
  PanelLeft,
  PanelRight,
  ScanSearch,
  Settings,
  Square,
  X,
} from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { isMac } from '@renderer/lib/platform';
import { drag, noDrag } from '@renderer/lib/window-region';
import { useTranslation } from '@renderer/i18n';
import type { TranslationKeys } from '@renderer/i18n';
import type { ViewMode } from '@shared/types';
import {
  ExportDropdown,
  ReloadButton,
  SplitOpenButton,
  SplitSaveButton,
} from './file-actions';

interface TitleBarProps {
  documentName: string;
  isDirty: boolean;
  canCreateNewDocument: boolean;
  viewMode: ViewMode;
  recentFiles: string[];
  onNew: () => void;
  onOpen: () => void;
  onReload: () => void;
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

export function TitleBar({
  documentName,
  isDirty,
  canCreateNewDocument,
  viewMode,
  recentFiles,
  onNew,
  onOpen,
  onReload,
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
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    void window.marky.windowIsMaximized().then(setIsMaximized);
    return window.marky.onMaximizedChange(setIsMaximized);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'F1') {
        e.preventDefault();
        onHelp();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
        aria-label={
          isMaximized ? t('titlebar.restore') : t('titlebar.maximize')
        }
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
        aria-label={
          isMaximized ? t('titlebar.restore') : t('titlebar.maximize')
        }
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
        size="icon"
        className="rounded-full"
        onClick={onNew}
        disabled={!canCreateNewDocument}
        aria-label={t('titlebar.new')}
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
      <ReloadButton onReload={onReload} />
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
          aria-label={t(labelKey)}
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
