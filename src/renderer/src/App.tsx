import { useEffect, useRef, useState } from 'react';
import type { EditorView } from '@codemirror/view';
import { cn } from '@renderer/lib/utils';
import { TitleBar } from '@renderer/features/titlebar/components/title-bar';
import { EditorPane } from '@renderer/features/editor/components/editor-pane';
import {
  EditorToolbar,
  type EditorInsertRequest,
} from '@renderer/features/editor/components/editor-toolbar';
import {
  InsertAssetDialog,
  type InsertAssetPayload,
} from '@renderer/features/editor/components/insert-asset-dialog';
import { PreviewPane } from '@renderer/features/preview/components/preview-pane';
import { DocumentStatus } from '@renderer/features/workspace/components/document-status';
import { useDocumentActions } from '@renderer/features/workspace/hooks/use-document-actions';
import {
  selectIsDirty,
  useWorkspaceStore,
} from '@renderer/features/workspace/store';
import { useSettingsStore } from '@renderer/features/settings/store';
import { SettingsDialog } from '@renderer/features/settings/components/settings-dialog';
import { HelpDialog } from '@renderer/features/help/components/help-dialog';
import {
  toEditorFontFamilyCss,
  toPreviewFontFamilyCss,
} from '@renderer/features/settings/lib/font-options';
import {
  insertImage,
  insertLink,
} from '@renderer/features/editor/lib/toolbar-actions';
import { useScrollSync } from '@renderer/features/editor/hooks/use-scroll-sync';
import { I18nProvider, detectClosestLocale } from '@renderer/i18n';

export function App() {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const [insertDialog, setInsertDialog] = useState<EditorInsertRequest | null>(
    null,
  );

  const activeDocument = useWorkspaceStore((state) => state.document);
  const viewMode = useWorkspaceStore((state) => state.viewMode);

  useScrollSync(editorViewRef, previewRef, viewMode);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (viewMode === 'preview') {
        previewRef.current?.focus();
      } else {
        editorViewRef.current?.focus();
      }
    });
  }, [viewMode]);
  const setContent = useWorkspaceStore((state) => state.setContent);
  const setViewMode = useWorkspaceStore((state) => state.setViewMode);
  const isDirty = useWorkspaceStore(selectIsDirty);

  const {
    saveDocument,
    exportDocument,
    handleMenuAction,
    openRecentFile,
    removeRecentFile,
    clearRecentFiles,
  } = useDocumentActions(previewRef);

  const settings = useSettingsStore((state) => state.settings);
  const setSettings = useSettingsStore((state) => state.setSettings);
  const openDialog = useSettingsStore((state) => state.openDialog);
  const openHelp = useSettingsStore((state) => state.openHelp);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const isHelpOpen = useSettingsStore((state) => state.isHelpOpen);
  const recentFiles = useSettingsStore((state) => state.settings.recentFiles);

  useEffect(() => {
    if (!isSettingsOpen && !isHelpOpen) {
      requestAnimationFrame(() => editorViewRef.current?.focus());
    }
  }, [isSettingsOpen, isHelpOpen]);

  // Load settings and auto-detect language on first launch
  const languageDetected = useRef(false);
  useEffect(() => {
    void window.marky.getSettings().then((loaded) => {
      setSettings(loaded);

      // Auto-detect language only on first launch (language still at default 'en')
      if (!languageDetected.current && loaded.language === 'en') {
        languageDetected.current = true;
        void window.marky.getLocale().then((osLocale) => {
          const detected = detectClosestLocale(osLocale);
          if (detected !== 'en') {
            const updated = { ...loaded, language: detected };
            setSettings(updated);
            void window.marky.setSettings(updated);
            void window.marky.updateMenuLanguage(detected);
          }
        });
      }
    });
  }, [setSettings]);

  // Sync native menu language whenever settings.language changes
  useEffect(() => {
    void window.marky.updateMenuLanguage(settings.language);
  }, [settings.language]);

  useEffect(() => {
    const root = globalThis.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    const root = globalThis.document.documentElement;
    root.style.setProperty(
      '--editor-font-family',
      toEditorFontFamilyCss(settings.editorFontFamily),
    );
    root.style.setProperty('--editor-font-size', `${settings.editorFontSize}px`);
    root.style.setProperty(
      '--preview-font-family',
      toPreviewFontFamilyCss(settings.previewFontFamily),
    );
    root.style.setProperty(
      '--preview-font-size',
      `${settings.previewFontSize}px`,
    );
  }, [
    settings.editorFontFamily,
    settings.editorFontSize,
    settings.previewFontFamily,
    settings.previewFontSize,
  ]);

  useEffect(() => {
    globalThis.document.title = `${isDirty ? '\u2022 ' : ''}${activeDocument.name} - Marky`;
  }, [activeDocument.name, isDirty]);

  const canCreateNewDocument = activeDocument.path !== null;

  function handleInsertRequest(request: EditorInsertRequest) {
    setInsertDialog(request);
  }

  function handleInsertDialogClose() {
    setInsertDialog(null);
  }

  function handleInsertDialogSubmit(payload: InsertAssetPayload) {
    const view = editorViewRef.current;
    if (!view) {
      setInsertDialog(null);
      return;
    }

    if (payload.type === 'link') {
      insertLink(view, { text: payload.text, url: payload.url });
    } else {
      insertImage(view, { altText: payload.altText, url: payload.url });
    }

    setInsertDialog(null);
  }

  return (
    <I18nProvider locale={settings.language}>
      <div className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">
        <div className="app-shell-overlay" />
        <div className="app-grain-overlay" />

        <div className="relative flex flex-1 flex-col overflow-hidden">
          <TitleBar
            documentName={activeDocument.name}
            isDirty={isDirty}
            canCreateNewDocument={canCreateNewDocument}
            viewMode={viewMode}
            recentFiles={recentFiles}
            onNew={() => void handleMenuAction('file:new')}
            onOpen={() => void handleMenuAction('file:open')}
            onOpenRecent={(path) => void openRecentFile(path)}
            onRemoveRecent={removeRecentFile}
            onClearRecent={clearRecentFiles}
            onSave={() => void saveDocument('save')}
            onSaveAs={() => void saveDocument('save-as')}
            onExportPdf={() => void exportDocument('pdf')}
            onExportHtml={() => void exportDocument('html')}
            onSettings={openDialog}
            onHelp={openHelp}
            onViewModeChange={setViewMode}
          />

          <main className="flex flex-1 overflow-hidden">
            {viewMode !== 'preview' && (
              <section
                className={cn(
                  'app-editor-pane',
                  viewMode === 'split' && 'border-r border-border/80',
                )}
              >
                <div className="app-editor-top-fade" />
                <EditorPane
                  value={activeDocument.content}
                  onChange={setContent}
                  onReady={(view) => {
                    editorViewRef.current = view;
                  }}
                />
              </section>
            )}

            {viewMode !== 'editor' && (
              <section ref={previewRef} className="app-preview-pane focus:outline-none" tabIndex={-1}>
                <div data-preview-root className="mx-auto max-w-3xl px-8 py-10">
                  <PreviewPane markdown={activeDocument.content} />
                </div>
              </section>
            )}
          </main>

          <footer
            className={cn(
              'flex h-14 shrink-0 items-center gap-3 border-t border-border/80 bg-background/70 px-3 backdrop-blur',
              viewMode === 'preview' ? 'justify-end' : 'justify-between',
            )}
          >
            {viewMode !== 'preview' && (
              <EditorToolbar
                editorViewRef={editorViewRef}
                onRequestInsert={handleInsertRequest}
              />
            )}
            <DocumentStatus />
          </footer>
        </div>

        <InsertAssetDialog
          dialog={insertDialog}
          onClose={handleInsertDialogClose}
          onInsert={handleInsertDialogSubmit}
        />
        <SettingsDialog />
        <HelpDialog />
      </div>
    </I18nProvider>
  );
}
