import { describe, it, expect, vi } from 'vitest';
import { reloadDocument } from '@renderer/features/workspace/lib/reload-document';
import type { DocumentHandle } from '@shared/types';

const onDisk: DocumentHandle = {
  path: '/notes/draft.md',
  name: 'draft.md',
  content: 'updated on disk',
};

describe('reloadDocument', () => {
  it('does nothing when no file is open', async () => {
    const readDocument = vi.fn();

    const outcome = await reloadDocument({
      path: null,
      isDirty: false,
      readDocument,
    });

    expect(outcome).toEqual({ status: 'nothing-to-reload' });
    expect(readDocument).not.toHaveBeenCalled();
  });

  it('reloads the file from disk', async () => {
    const readDocument = vi.fn().mockResolvedValue(onDisk);

    const outcome = await reloadDocument({
      path: '/notes/draft.md',
      isDirty: false,
      readDocument,
    });

    expect(outcome).toEqual({ status: 'reloaded', document: onDisk });
    expect(readDocument).toHaveBeenCalledWith('/notes/draft.md');
  });

  it('reports a file that no longer exists', async () => {
    const readDocument = vi.fn().mockResolvedValue(null);

    const outcome = await reloadDocument({
      path: '/notes/deleted.md',
      isDirty: false,
      readDocument,
    });

    expect(outcome).toEqual({ status: 'file-not-found' });
  });

  it('refuses to reload over unsaved changes', async () => {
    const readDocument = vi.fn();

    const outcome = await reloadDocument({
      path: '/notes/draft.md',
      isDirty: true,
      readDocument,
    });

    expect(outcome).toEqual({ status: 'blocked-unsaved' });
  });

  it('does not read from disk when there are unsaved changes', async () => {
    const readDocument = vi.fn().mockResolvedValue(onDisk);

    await reloadDocument({
      path: '/notes/draft.md',
      isDirty: true,
      readDocument,
    });

    // The dirty check must short-circuit before the read, so a slow or failing
    // read can never race ahead of it and replace the buffer.
    expect(readDocument).not.toHaveBeenCalled();
  });

  it('prefers the no-file outcome over the dirty check', async () => {
    const readDocument = vi.fn();

    const outcome = await reloadDocument({
      path: null,
      isDirty: true,
      readDocument,
    });

    expect(outcome).toEqual({ status: 'nothing-to-reload' });
  });
});
