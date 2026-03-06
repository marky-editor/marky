import { create } from 'zustand';
import { defaultDocument } from '@shared/default-document';
import type { DocumentHandle, ViewMode } from '@shared/types';

type NoticeTone = 'info' | 'success' | 'error';

type WorkspaceState = {
  document: DocumentHandle;
  savedContent: string;
  viewMode: ViewMode;
  notice: { message: string; tone: NoticeTone } | null;
  setContent: (content: string) => void;
  setDocument: (document: DocumentHandle) => void;
  markSaved: (path: string | null) => void;
  createUntitledDocument: () => void;
  setViewMode: (viewMode: ViewMode) => void;
  setNotice: (message: string, tone?: NoticeTone) => void;
  clearNotice: () => void;
};

const untitledDocument: DocumentHandle = {
  path: null,
  name: 'untitled.md',
  content: defaultDocument,
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  document: untitledDocument,
  savedContent: untitledDocument.content,
  viewMode: 'split',
  notice: null,
  setContent: (content) =>
    set((state) => ({
      document: {
        ...state.document,
        content,
      },
    })),
  setDocument: (document) => set({ document, savedContent: document.content }),
  markSaved: (path) =>
    set((state) => ({
      document: {
        ...state.document,
        path,
        name: path
          ? (path.split(/[/\\]/).at(-1) ?? state.document.name)
          : state.document.name,
      },
      savedContent: state.document.content,
    })),
  createUntitledDocument: () =>
    set({ document: untitledDocument, savedContent: defaultDocument }),
  setViewMode: (viewMode) => set({ viewMode }),
  setNotice: (message, tone = 'info') => set({ notice: { message, tone } }),
  clearNotice: () => set({ notice: null }),
}));

export function selectIsDirty(state: WorkspaceState) {
  return state.document.content !== state.savedContent;
}
