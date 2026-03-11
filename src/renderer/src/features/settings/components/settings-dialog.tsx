import { useEffect, useMemo, useState } from 'react';
import { Moon, Sun, X } from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { cn } from '@renderer/lib/utils';
import type { AppSettings, ExportFont, Locale, PdfPageSize } from '@shared/types';
import {
  fallbackFontOptions,
  loadFontOptions,
  toEditorFontFamilyCss,
  toPreviewFontFamilyCss,
  type FontOption,
  type LoadedFontOptions,
} from '../lib/font-options';
import { useSettingsStore } from '../store';
import { useTranslation } from '@renderer/i18n';

const exportFontOptions: Array<{ value: ExportFont; label: string }> = [
  { value: 'system', label: 'System sans-serif' },
  { value: 'serif', label: 'Georgia (serif)' },
  { value: 'mono', label: 'Monospace' },
];

const fontSizeOptions = [12, 13, 14, 15, 16, 18, 20, 22, 24].map((value) => ({
  value,
  label: `${value}px`,
}));

const pageSizeOptions: Array<{ value: PdfPageSize; label: string }> = [
  { value: 'A4', label: 'A4 (210 x 297 mm)' },
  { value: 'Letter', label: 'Letter (216 x 279 mm)' },
  { value: 'Legal', label: 'Legal (216 x 356 mm)' },
  { value: 'A3', label: 'A3 (297 x 420 mm)' },
];

const languageOptions: Array<{ value: Locale; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'es', label: 'Español' },
];

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

const labelClass = 'mb-1 block text-xs font-medium text-muted-foreground';
const subLabelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/75';
const noDrag = {
  WebkitAppRegion: 'no-drag' as React.CSSProperties['WebkitAppRegion'],
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ensureSelectedFont(options: FontOption[], value: string) {
  if (!value || options.some((option) => option.value === value)) {
    return options;
  }

  return [{ value, label: value }, ...options];
}

function ensureSelectedFontSize(
  options: Array<{ value: number; label: string }>,
  value: number,
) {
  if (options.some((option) => option.value === value)) {
    return options;
  }

  return [...options, { value, label: `${value}px` }].sort(
    (left, right) => left.value - right.value,
  );
}

function FontField({
  label,
  value,
  fontSize,
  options,
  helper,
  previewText,
  previewFontFamily,
  previewFontSize,
  familyLabel,
  sizeLabel,
  sampleLabel,
  onChange,
  onFontSizeChange,
}: {
  label: string;
  value: string;
  fontSize: number;
  options: FontOption[];
  helper: string;
  previewText: string;
  previewFontFamily: string;
  previewFontSize: number;
  familyLabel: string;
  sizeLabel: string;
  sampleLabel: string;
  onChange: (value: string) => void;
  onFontSizeChange: (value: number) => void;
}) {
  const availableFontSizes = ensureSelectedFontSize(fontSizeOptions, fontSize);

  return (
    <div className="space-y-2">
      <label className={labelClass}>{label}</label>
      <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-2">
        <div className="min-w-0">
          <span className={subLabelClass}>{familyLabel}</span>
          <select
            className={inputClass}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className={subLabelClass}>{sizeLabel}</span>
          <select
            className={inputClass}
            aria-label={`${label} size`}
            value={fontSize}
            onChange={(event) => onFontSizeChange(Number(event.target.value))}
          >
            {availableFontSizes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
      <div className="rounded-2xl border border-border/80 bg-background/70 p-3 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
          {sampleLabel}
        </p>
        <p
          className="mt-2 whitespace-pre-wrap text-foreground/90"
          style={{
            fontFamily: previewFontFamily,
            fontSize: `${previewFontSize}px`,
            lineHeight: 1.7,
          }}
        >
          {previewText}
        </p>
      </div>
    </div>
  );
}

export function SettingsDialog() {
  const { t } = useTranslation();
  const { settings, isOpen, setSettings, closeDialog } = useSettingsStore();
  const [loadedFontChoices, setLoadedFontChoices] =
    useState<LoadedFontOptions | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeDialog();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDialog]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    void loadFontOptions({
      editorFontFamily: settings.editorFontFamily,
      previewFontFamily: settings.previewFontFamily,
    }).then((next) => {
      if (!cancelled) {
        setLoadedFontChoices(next);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, settings.editorFontFamily, settings.previewFontFamily]);

  const fontChoices = useMemo(() => {
    const base =
      loadedFontChoices ??
      fallbackFontOptions({
        editorFontFamily: settings.editorFontFamily,
        previewFontFamily: settings.previewFontFamily,
      });

    return {
      ...base,
      editor: ensureSelectedFont(base.editor, settings.editorFontFamily),
      preview: ensureSelectedFont(base.preview, settings.previewFontFamily),
    };
  }, [
    loadedFontChoices,
    settings.editorFontFamily,
    settings.previewFontFamily,
  ]);

  const fontLibraryHint = useMemo(() => {
    if (fontChoices.usesLocalFonts && fontChoices.editorListIsFiltered) {
      return t('settings.fontHintLocalFiltered');
    }

    if (fontChoices.usesLocalFonts) {
      return t('settings.fontHintLocalFull');
    }

    return t('settings.fontHintFallback');
  }, [fontChoices.editorListIsFiltered, fontChoices.usesLocalFonts, t]);

  if (!isOpen) return null;

  function update(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    void window.marky.setSettings(next);
  }

  const marginLabels: Record<'top' | 'right' | 'bottom' | 'left', string> = {
    top: t('settings.marginTop'),
    right: t('settings.marginRight'),
    bottom: t('settings.marginBottom'),
    left: t('settings.marginLeft'),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm"
      onClick={closeDialog}
      style={noDrag}
    >
      <div
        className="relative flex max-h-[calc(100vh-1.5rem)] w-[540px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        style={noDrag}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold tracking-wide">{t('settings.title')}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('settings.subtitle')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={closeDialog}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="themed-scrollbar min-h-0 space-y-6 overflow-y-auto px-5 py-5 focus:outline-none" tabIndex={0} ref={(el) => el?.focus()}>
          <Section title={t('settings.appearance')}>
            <div>
              <p className={labelClass}>{t('settings.language')}</p>
              <select
                className={inputClass}
                value={settings.language}
                onChange={(event) =>
                  update({ language: event.target.value as Locale })
                }
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className={labelClass}>{t('settings.theme')}</p>
              <div className="flex gap-2">
                {(['light', 'dark'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => update({ theme })}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 text-sm font-medium transition-colors',
                      settings.theme === theme
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {theme === 'light' ? (
                      <Sun className="size-4" />
                    ) : (
                      <Moon className="size-4" />
                    )}
                    {theme === 'light' ? t('settings.light') : t('settings.dark')}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <div className="border-t border-border" />

          <Section title={t('settings.writing')}>
            <p className="text-xs leading-5 text-muted-foreground">
              {fontLibraryHint}
            </p>

            <div className="space-y-4">
              <FontField
                label={t('settings.editorFont')}
                value={settings.editorFontFamily}
                fontSize={settings.editorFontSize}
                options={fontChoices.editor}
                helper={t('settings.editorFontHelper')}
                previewFontFamily={toEditorFontFamilyCss(settings.editorFontFamily)}
                previewFontSize={settings.editorFontSize}
                previewText={t('settings.editorPreviewText')}
                familyLabel={t('settings.family')}
                sizeLabel={t('settings.size')}
                sampleLabel={t('settings.sample')}
                onChange={(editorFontFamily) => update({ editorFontFamily })}
                onFontSizeChange={(editorFontSize) => update({ editorFontSize })}
              />

              <FontField
                label={t('settings.previewFont')}
                value={settings.previewFontFamily}
                fontSize={settings.previewFontSize}
                options={fontChoices.preview}
                helper={t('settings.previewFontHelper')}
                previewFontFamily={toPreviewFontFamilyCss(settings.previewFontFamily)}
                previewFontSize={settings.previewFontSize}
                previewText={t('settings.previewPreviewText')}
                familyLabel={t('settings.family')}
                sizeLabel={t('settings.size')}
                sampleLabel={t('settings.sample')}
                onChange={(previewFontFamily) => update({ previewFontFamily })}
                onFontSizeChange={(previewFontSize) => update({ previewFontSize })}
              />
            </div>
          </Section>

          <div className="border-t border-border" />

          <Section title={t('settings.export')}>
            <div>
              <label className={labelClass}>{t('settings.documentFont')}</label>
              <select
                className={inputClass}
                value={settings.exportFont}
                onChange={(event) =>
                  update({ exportFont: event.target.value as ExportFont })
                }
              >
                {exportFontOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t('settings.pdfPageSize')}</label>
              <select
                className={inputClass}
                value={settings.pdfPageSize}
                onChange={(event) =>
                  update({ pdfPageSize: event.target.value as PdfPageSize })
                }
              >
                {pageSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className={labelClass}>{t('settings.pdfMargins')}</p>
              <div className="grid grid-cols-2 gap-2">
                {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                  <div key={side}>
                    <label className="mb-0.5 block text-xs text-muted-foreground">
                      {marginLabels[side]}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={inputClass}
                      value={settings.pdfMargins[side]}
                      onChange={(event) =>
                        update({
                          pdfMargins: {
                            ...settings.pdfMargins,
                            [side]: Math.max(0, Number(event.target.value)),
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
