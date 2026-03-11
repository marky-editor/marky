import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
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
  onClose: () => void;
  onInsert: (payload: InsertAssetPayload) => void;
};

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

const labelClass = 'mb-1 block text-xs font-medium text-muted-foreground';
const noDrag = {
  WebkitAppRegion: 'no-drag' as React.CSSProperties['WebkitAppRegion'],
};

export function InsertAssetDialog({
  dialog,
  onClose,
  onInsert,
}: InsertAssetDialogProps) {
  if (!dialog) return null;

  return (
    <InsertAssetDialogContent
      key={`${dialog.type}:${dialog.initialText}`}
      dialog={dialog}
      onClose={onClose}
      onInsert={onInsert}
    />
  );
}

type InsertAssetDialogContentProps = {
  dialog: Exclude<InsertAssetDialogState, null>;
  onClose: () => void;
  onInsert: (payload: InsertAssetPayload) => void;
};

function InsertAssetDialogContent({
  dialog,
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
  const title = isLink ? t('insertAsset.insertLink') : t('insertAsset.insertImage');
  const textLabel = isLink ? t('insertAsset.linkText') : t('insertAsset.altText');
  const textPlaceholder = isLink
    ? t('insertAsset.linkTextPlaceholder')
    : t('insertAsset.altTextPlaceholder');
  const submitLabel = isLink ? t('insertAsset.insertLink') : t('insertAsset.insertImage');

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
              {t('insertAsset.url')}
            </label>
            <input
              id="insert-asset-url"
              ref={urlInputRef}
              type="url"
              className={inputClass}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={
                isLink
                  ? t('insertAsset.linkPlaceholder')
                  : t('insertAsset.imagePlaceholder')
              }
            />
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
