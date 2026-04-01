import { useEffect, useMemo, useRef, useState } from 'react';
import { FolderOpen, TriangleAlert, X } from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { useTranslation } from '@renderer/i18n';

export type InsertAssetDialogState = {
  type: 'link' | 'image';
  initialText: string;
} | null;

export type InsertAssetPayload =
  | {
      type: 'link';
      text: string;
      url: string;
    }
  | {
      type: 'image';
      altText: string;
      url: string;
    };

type InsertAssetDialogProps = {
  dialog: InsertAssetDialogState;
  documentPath?: string | null;
  onClose: () => void;
  onInsert: (payload: InsertAssetPayload) => void;
};

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

const labelClass = 'mb-1 block text-xs font-medium text-muted-foreground';
const noDrag = {
  WebkitAppRegion: 'no-drag' as React.CSSProperties['WebkitAppRegion'],
};

function isLocalPath(value: string): boolean {
  if (!value.trim()) return false;
  try {
    new URL(value);
    return false;
  } catch {
    return !value.startsWith('data:');
  }
}

function isOutsideDocumentFolder(
  absoluteImagePath: string,
  documentPath: string,
): boolean {
  const relative = toRelativePath(absoluteImagePath, documentPath);
  return relative === absoluteImagePath;
}

function toRelativePath(
  absoluteImagePath: string,
  documentPath: string,
): string {
  const sep = documentPath.includes('\\') ? '\\' : '/';
  const docDir =
    documentPath.substring(
      0,
      Math.max(
        documentPath.lastIndexOf('/'),
        documentPath.lastIndexOf('\\'),
      ),
    ) + sep;

  const normalizedImage = absoluteImagePath.replace(/\\/g, '/');
  const normalizedDir = docDir.replace(/\\/g, '/');

  if (normalizedImage.startsWith(normalizedDir)) {
    return normalizedImage.substring(normalizedDir.length);
  }

  return absoluteImagePath;
}

export function InsertAssetDialog({
  dialog,
  documentPath,
  onClose,
  onInsert,
}: InsertAssetDialogProps) {
  if (!dialog) return null;

  return (
    <InsertAssetDialogContent
      key={`${dialog.type}:${dialog.initialText}`}
      dialog={dialog}
      documentPath={documentPath}
      onClose={onClose}
      onInsert={onInsert}
    />
  );
}

type InsertAssetDialogContentProps = {
  dialog: Exclude<InsertAssetDialogState, null>;
  documentPath?: string | null;
  onClose: () => void;
  onInsert: (payload: InsertAssetPayload) => void;
};

function InsertAssetDialogContent({
  dialog,
  documentPath,
  onClose,
  onInsert,
}: InsertAssetDialogContentProps) {
  const { t } = useTranslation();
  const urlInputRef = useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = useState('');
  const [textValue, setTextValue] = useState(dialog.initialText);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      urlInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isLink = dialog.type === 'link';
  const isImage = dialog.type === 'image';
  const title = isLink ? t('insertAsset.insertLink') : t('insertAsset.insertImage');
  const textLabel = isLink ? t('insertAsset.linkText') : t('insertAsset.altText');
  const textPlaceholder = isLink
    ? t('insertAsset.linkTextPlaceholder')
    : t('insertAsset.altTextPlaceholder');
  const submitLabel = isLink ? t('insertAsset.insertLink') : t('insertAsset.insertImage');
  const urlLabel = isImage ? t('insertAsset.imagePathOrUrl') : t('insertAsset.url');

  const imageWarning = useMemo(() => {
    if (!isImage || !url.trim()) return null;
    if (!isLocalPath(url)) return null;
    if (!documentPath) return t('insertAsset.warnUnsaved');
    if (isOutsideDocumentFolder(url, documentPath)) return t('insertAsset.warnOutsideFolder');
    return null;
  }, [isImage, url, documentPath, t]);

  async function handleBrowse() {
    const picked = await window.marky.pickImage();
    if (!picked) return;

    if (documentPath) {
      setUrl(toRelativePath(picked, documentPath));
    } else {
      setUrl(picked);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    if (isLink) {
      onInsert({
        type: 'link',
        text: textValue.trim() || trimmedUrl,
        url: trimmedUrl,
      });
      return;
    }

    onInsert({
      type: 'image',
      altText: textValue.trim(),
      url: trimmedUrl,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm"
      onClick={onClose}
      style={noDrag}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        style={noDrag}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={onClose}
            aria-label={t('titlebar.close')}
          >
            <X className="size-4" />
          </Button>
        </div>

        <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit}>
          <div>
            <label className={labelClass} htmlFor="insert-asset-url">
              {urlLabel}
            </label>
            <div className={isImage ? 'flex gap-2' : ''}>
              <input
                id="insert-asset-url"
                ref={urlInputRef}
                type={isLink ? 'url' : 'text'}
                className={inputClass}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder={
                  isLink
                    ? t('insertAsset.linkPlaceholder')
                    : t('insertAsset.imagePlaceholder')
                }
              />
              {isImage && (
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={handleBrowse}
                  aria-label={t('insertAsset.browse')}
                >
                  <FolderOpen className="mr-1.5 size-4" />
                  {t('insertAsset.browse')}
                </Button>
              )}
            </div>
            {isImage && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t('insertAsset.localImageHint')}
              </p>
            )}
            {imageWarning && (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <TriangleAlert className="mt-px size-3.5 shrink-0" />
                <span>{imageWarning}</span>
              </p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="insert-asset-text">
              {textLabel}
            </label>
            <input
              id="insert-asset-text"
              type="text"
              className={inputClass}
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              placeholder={textPlaceholder}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              {t('insertAsset.cancel')}
            </Button>
            <Button type="submit" disabled={url.trim().length === 0}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
