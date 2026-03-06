export type ViewMode = 'editor' | 'split' | 'preview';

export type Platform = 'windows' | 'macos' | 'linux';

export type DocumentHandle = {
  path: string | null;
  name: string;
  content: string;
};

export type SaveDocumentPayload = {
  path: string | null;
  content: string;
  suggestedName: string;
};

export type PdfPageSize = 'A4' | 'Letter' | 'Legal' | 'A3';

export type ExportFont = 'system' | 'serif' | 'mono';

export type PdfMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type AppSettings = {
  theme: 'light' | 'dark';
  exportFont: ExportFont;
  editorFontFamily: string;
  editorFontSize: number;
  previewFontFamily: string;
  previewFontSize: number;
  pdfPageSize: PdfPageSize;
  pdfMargins: PdfMargins;
  recentFiles: string[];
};

export type PdfExportOptions = {
  pageSize: PdfPageSize;
  margins: PdfMargins;
};

export type ExportPayload = {
  suggestedName: string;
  htmlDocument: string;
  pdfOptions?: PdfExportOptions;
};

export type SaveResult = {
  canceled: boolean;
  path: string | null;
};

export type MenuAction =
  | 'file:new'
  | 'file:open'
  | 'file:save'
  | 'file:save-as'
  | 'file:export-html'
  | 'file:export-pdf'
  | 'view:editor'
  | 'view:split'
  | 'view:preview';
