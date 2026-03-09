import { keymap, type KeyBinding } from '@codemirror/view';
import { applyToolbarAction } from './toolbar-actions';

const formattingBindings: readonly KeyBinding[] = [
    {
        key: 'Mod-b',
        preventDefault: true,
        run: (view) => {
            applyToolbarAction(view, 'bold');
            return true;
        },
    },
    {
        key: 'Mod-i',
        preventDefault: true,
        run: (view) => {
            applyToolbarAction(view, 'italic');
            return true;
        },
    },
    {
        key: 'Mod-Shift-x',
        preventDefault: true,
        run: (view) => {
            applyToolbarAction(view, 'strike');
            return true;
        },
    },
    {
        key: 'Mod-1',
        preventDefault: true,
        run: (view) => {
            applyToolbarAction(view, 'h1');
            return true;
        },
    },
    {
        key: 'Mod-2',
        preventDefault: true,
        run: (view) => {
            applyToolbarAction(view, 'h2');
            return true;
        },
    },
    {
        key: 'Mod-Shift-7',
        preventDefault: true,
        run: (view) => {
            applyToolbarAction(view, 'ordered');
            return true;
        },
    },
    {
        key: 'Mod-Shift-8',
        preventDefault: true,
        run: (view) => {
            applyToolbarAction(view, 'bullet');
            return true;
        },
    },
    {
        key: 'Mod-Shift-9',
        preventDefault: true,
        run: (view) => {
            applyToolbarAction(view, 'task');
            return true;
        },
    },
    {
        key: 'Mod-Shift-.',
        preventDefault: true,
        run: (view) => {
            applyToolbarAction(view, 'quote');
            return true;
        },
    },
    {
        key: 'Mod-e',
        preventDefault: true,
        run: (view) => {
            applyToolbarAction(view, 'code');
            return true;
        },
    },
    {
        key: 'Mod-k',
        preventDefault: true,
        run: (view) => {
            applyToolbarAction(view, 'link');
            return true;
        },
    },
];

export const formattingKeymap = keymap.of(formattingBindings);
