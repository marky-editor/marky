import type { DocumentHandle } from '@shared/types';

export type ReloadOutcome =
  | { status: 'nothing-to-reload' }
  | { status: 'blocked-unsaved' }
  | { status: 'file-not-found' }
  | { status: 'reloaded'; document: DocumentHandle };

/**
 * Decides what reloading the open document from disk should do.
 *
 * Kept free of React and IPC so every branch is directly testable: the caller
 * injects the read, and the caller maps the outcome onto a user-facing notice.
 */
export async function reloadDocument({
  path,
  isDirty,
  readDocument,
}: {
  path: string | null;
  isDirty: boolean;
  readDocument: (path: string) => Promise<DocumentHandle | null>;
}): Promise<ReloadOutcome> {
  if (!path) {
    return { status: 'nothing-to-reload' };
  }

  // Reloading replaces the buffer outright, so unsaved edits would be lost
  // with no undo. Refuse rather than destroy them.
  if (isDirty) {
    return { status: 'blocked-unsaved' };
  }

  const document = await readDocument(path);
  if (!document) {
    return { status: 'file-not-found' };
  }

  return { status: 'reloaded', document };
}
