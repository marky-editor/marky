import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkspaceStore, selectIsDirty } from '@renderer/features/workspace/store';

describe('useWorkspaceStore', () => {
  beforeEach(() => {
    // Reset to initial state between tests
    useWorkspaceStore.getState().createUntitledDocument();
  });

  it('starts with an untitled document', () => {
    const { document } = useWorkspaceStore.getState();
    expect(document.name).toBe('untitled.md');
    expect(document.path).toBeNull();
  });

  it('starts in split view mode', () => {
    expect(useWorkspaceStore.getState().viewMode).toBe('split');
  });

  it('updates content', () => {
    useWorkspaceStore.getState().setContent('new content');
    expect(useWorkspaceStore.getState().document.content).toBe('new content');
  });

  it('sets a document', () => {
    useWorkspaceStore.getState().setDocument({
      path: '/test.md',
      name: 'test.md',
      content: 'test content',
    });
    const { document, savedContent } = useWorkspaceStore.getState();
    expect(document.path).toBe('/test.md');
    expect(document.name).toBe('test.md');
    expect(document.content).toBe('test content');
    expect(savedContent).toBe('test content');
  });

  it('marks document as saved and extracts filename from path', () => {
    useWorkspaceStore.getState().setContent('changed');
    useWorkspaceStore.getState().markSaved('/docs/readme.md');
    const state = useWorkspaceStore.getState();
    expect(state.document.path).toBe('/docs/readme.md');
    expect(state.document.name).toBe('readme.md');
    expect(state.savedContent).toBe('changed');
  });

  it('switches view mode', () => {
    useWorkspaceStore.getState().setViewMode('preview');
    expect(useWorkspaceStore.getState().viewMode).toBe('preview');
    useWorkspaceStore.getState().setViewMode('editor');
    expect(useWorkspaceStore.getState().viewMode).toBe('editor');
  });

  it('sets and clears notices', () => {
    useWorkspaceStore.getState().setNotice('Saved!', 'success');
    expect(useWorkspaceStore.getState().notice).toEqual({
      message: 'Saved!',
      tone: 'success',
    });
    useWorkspaceStore.getState().clearNotice();
    expect(useWorkspaceStore.getState().notice).toBeNull();
  });

  it('defaults notice tone to info', () => {
    useWorkspaceStore.getState().setNotice('Hello');
    expect(useWorkspaceStore.getState().notice?.tone).toBe('info');
  });
});

describe('selectIsDirty', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().createUntitledDocument();
  });

  it('returns false when content matches saved content', () => {
    expect(selectIsDirty(useWorkspaceStore.getState())).toBe(false);
  });

  it('returns true when content differs from saved content', () => {
    useWorkspaceStore.getState().setContent('modified');
    expect(selectIsDirty(useWorkspaceStore.getState())).toBe(true);
  });

  it('returns false again after markSaved', () => {
    useWorkspaceStore.getState().setContent('modified');
    useWorkspaceStore.getState().markSaved(null);
    expect(selectIsDirty(useWorkspaceStore.getState())).toBe(false);
  });
});
