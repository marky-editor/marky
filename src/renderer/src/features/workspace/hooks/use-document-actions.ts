import { useCallback, useEffect } from 'react';
import { buildExportHtml } from '@renderer/features/export/lib/build-export-html';
import { reloadDocument } from '@renderer/features/workspace/lib/reload-document';
import {
  selectIsDirty,
  useWorkspaceStore,
} from '@renderer/features/workspace/store';
import { useSettingsStore } from '@renderer/features/settings/store';
import { useTranslation } from '@renderer/i18n';
import type { MenuAction } from '@shared/types';

function buildSuggestedName(name: string) {
  return name.endsWith('.md') ? name : `${name}.md`;
}

export function useDocumentActions(
  previewRef: React.RefObject<HTMLElement | null>,
) {
  const { t } = useTranslation();
  const activeDocument = useWorkspaceStore((state) => state.document);
  const isDirty = useWorkspaceStore(selectIsDirty);
  const setDocument = useWorkspaceStore((state) => state.setDocument);
  const createUntitledDocument = useWorkspaceStore(
    (state) => state.createUntitledDocument,
  );
  const markSaved = useWorkspaceStore((state) => state.markSaved);
  const setViewMode = useWorkspaceStore((state) => state.setViewMode);
  const setNotice = useWorkspaceStore((state) => state.setNotice);
  const settings = useSettingsStore((state) => state.settings);
  const addRecentFile = useSettingsStore((state) => state.addRecentFile);
  const removeRecentFile = useSettingsStore((state) => state.removeRecentFile);
  const clearRecentFiles = useSettingsStore((state) => state.clearRecentFiles);

  const saveDocument = useCallback(
    async (mode: 'save' | 'save-as') => {
      const payload = {
        path: mode === 'save' ? activeDocument.path : null,
        content: activeDocument.content,
        suggestedName: buildSuggestedName(activeDocument.name),
      };

      const result =
        mode === 'save'
          ? await window.marky.saveDocument(payload)
          : await window.marky.saveDocumentAs(payload);

      if (!result.canceled) {
        markSaved(result.path);
        setNotice(
          mode === 'save' ? t('notice.saved') : t('notice.savedAs'),
          'success',
        );
      }
    },
    [
      activeDocument.content,
      activeDocument.name,
      activeDocument.path,
      markSaved,
      setNotice,
      t,
    ],
  );

  const exportDocument = useCallback(
    async (kind: 'html' | 'pdf') => {
      const htmlDocument = await buildExportHtml(
        activeDocument,
        settings.exportFont,
        previewRef.current,
      );

      const payload = {
        suggestedName: buildSuggestedName(activeDocument.name),
        htmlDocument,
        ...(kind === 'pdf' && {
          pdfOptions: {
            pageSize: settings.pdfPageSize,
            margins: settings.pdfMargins,
          },
        }),
      };

      const result =
        kind === 'html'
          ? await window.marky.exportHtml(payload)
          : await window.marky.exportPdf(payload);

      if (!result.canceled) {
        setNotice(
          kind === 'html' ? t('notice.htmlExported') : t('notice.pdfExported'),
          'success',
        );
      }
    },
    [activeDocument, previewRef, setNotice, settings, t],
  );

  const openRecentFile = useCallback(
    async (path: string) => {
      const opened = await window.marky.openDocumentFromPath(path);
      if (opened) {
        setDocument(opened);
        addRecentFile(path);
        setNotice(t('notice.opened', { name: opened.name }), 'success');
      } else {
        removeRecentFile(path);
        setNotice(t('notice.fileNotFound'), 'info');
      }
    },
    [addRecentFile, removeRecentFile, setDocument, setNotice, t],
  );

  const handleMenuAction = useCallback(
    async (action: MenuAction) => {
      switch (action) {
        case 'file:new':
          if (!activeDocument.path) {
            setNotice(t('notice.alreadyUnsaved'), 'info');
            return;
          }
          createUntitledDocument();
          setNotice(t('notice.freshDraft'), 'info');
          return;
        case 'file:open': {
          const opened = await window.marky.openDocument();
          if (opened) {
            setDocument(opened);
            if (opened.path) {
              addRecentFile(opened.path);
            }
            setNotice(t('notice.opened', { name: opened.name }), 'success');
          }
          return;
        }
        case 'file:reload': {
          const outcome = await reloadDocument({
            path: activeDocument.path,
            isDirty,
            readDocument: window.marky.openDocumentFromPath,
          });
          switch (outcome.status) {
            case 'nothing-to-reload':
              setNotice(t('notice.nothingToReload'), 'info');
              return;
            case 'blocked-unsaved':
              setNotice(t('notice.reloadBlockedUnsaved'), 'info');
              return;
            case 'file-not-found':
              setNotice(t('notice.reloadFileNotFound'), 'info');
              return;
            case 'reloaded':
              setDocument(outcome.document);
              setNotice(t('notice.reloaded'), 'success');
              return;
          }
          return;
        }
        case 'file:save':
          return saveDocument('save');
        case 'file:save-as':
          return saveDocument('save-as');
        case 'file:export-html':
          return exportDocument('html');
        case 'file:export-pdf':
          return exportDocument('pdf');
        case 'view:editor':
          return setViewMode('editor');
        case 'view:split':
          return setViewMode('split');
        case 'view:preview':
          return setViewMode('preview');
      }
    },
    [
      activeDocument.path,
      addRecentFile,
      createUntitledDocument,
      exportDocument,
      isDirty,
      saveDocument,
      setDocument,
      setNotice,
      setViewMode,
      t,
    ],
  );

  useEffect(() => {
    return window.marky.onMenuAction((action) => {
      void handleMenuAction(action);
    });
  }, [handleMenuAction]);

  return {
    saveDocument,
    exportDocument,
    handleMenuAction,
    openRecentFile,
    removeRecentFile,
    clearRecentFiles,
  };
}
