import { useEffect, type RefObject } from 'react';
import type { EditorView } from '@codemirror/view';
import type { ViewMode } from '@shared/types';

/**
 * Synchronise preview scroll position to match the editor's scroll ratio.
 *
 * When the user scrolls the CodeMirror editor, this hook calculates what
 * percentage of the total scrollable height has been scrolled and applies
 * the same ratio to the preview pane. A guard flag prevents feedback loops
 * when the preview scroll would otherwise trigger a reverse sync.
 */
export function useScrollSync(
    editorViewRef: RefObject<EditorView | null>,
    previewRef: RefObject<HTMLElement | null>,
    viewMode: ViewMode,
) {
    useEffect(() => {
        if (viewMode !== 'split') return;

        const editorView = editorViewRef.current;
        const previewElement = previewRef.current;
        if (!editorView || !previewElement) return;

        const scroller = editorView.scrollDOM;
        let isSyncing = false;

        function handleEditorScroll() {
            if (isSyncing || !previewElement) return;

            const maxScroll = scroller.scrollHeight - scroller.clientHeight;
            if (maxScroll <= 0) return;

            const ratio = scroller.scrollTop / maxScroll;
            const previewMax = previewElement.scrollHeight - previewElement.clientHeight;

            isSyncing = true;
            previewElement.scrollTop = ratio * previewMax;
            requestAnimationFrame(() => {
                isSyncing = false;
            });
        }

        scroller.addEventListener('scroll', handleEditorScroll, { passive: true });
        return () => {
            scroller.removeEventListener('scroll', handleEditorScroll);
        };
    }, [editorViewRef, previewRef, viewMode]);
}
