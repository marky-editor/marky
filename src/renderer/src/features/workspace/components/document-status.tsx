import { useEffect } from 'react';
import { Eye } from 'lucide-react';
import { cn } from '@renderer/lib/utils';
import { useWorkspaceStore } from '@renderer/features/workspace/store';
import { useEditorStore } from '@renderer/features/editor/store';
import { useTranslation } from '@renderer/i18n';

export function DocumentStatus() {
  const { t } = useTranslation();
  const notice = useWorkspaceStore((state) => state.notice);
  const clearNotice = useWorkspaceStore((state) => state.clearNotice);
  const stats = useEditorStore((state) => state.stats);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => clearNotice(), 2800);
    return () => window.clearTimeout(timeout);
  }, [notice, clearNotice]);

  return (
    <div className="flex items-center gap-4 pr-2 text-sm text-muted-foreground">
      <span>{t('status.words', { count: stats.words })}</span>
      <span>{t('status.characters', { count: stats.characters })}</span>
      {notice && (
        <span
          className={cn(
            'notice-pill',
            notice.tone === 'success' && 'notice-pill-success',
            notice.tone === 'error' && 'notice-pill-error',
            notice.tone === 'info' && 'notice-pill-info',
          )}
        >
          {notice.message}
        </span>
      )}
      <Eye className="size-4" />
    </div>
  );
}
