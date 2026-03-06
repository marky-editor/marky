import { create } from 'zustand';

export type FormattingState = {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  code: boolean;
  link: boolean;
  heading1: boolean;
  heading2: boolean;
  blockquote: boolean;
  bulletList: boolean;
  orderedList: boolean;
};

export type DocumentStats = {
  words: number;
  characters: number;
};

type EditorStoreState = {
  formatting: FormattingState;
  stats: DocumentStats;
  setFormatting: (formatting: FormattingState) => void;
  setStats: (stats: DocumentStats) => void;
};

const defaultFormatting: FormattingState = {
  bold: false,
  italic: false,
  strikethrough: false,
  code: false,
  link: false,
  heading1: false,
  heading2: false,
  blockquote: false,
  bulletList: false,
  orderedList: false,
};

export const useEditorStore = create<EditorStoreState>((set) => ({
  formatting: defaultFormatting,
  stats: { words: 0, characters: 0 },
  setFormatting: (formatting) => set({ formatting }),
  setStats: (stats) => set({ stats }),
}));
