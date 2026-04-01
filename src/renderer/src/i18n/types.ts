/** All known translation keys. Each locale file must satisfy this shape. */
export type TranslationKeys = {
  // ── Settings dialog ──────────────────────────────────────────────
  'settings.title': string;
  'settings.subtitle': string;
  'settings.appearance': string;
  'settings.language': string;
  'settings.theme': string;
  'settings.light': string;
  'settings.dark': string;
  'settings.writing': string;
  'settings.editorFont': string;
  'settings.previewFont': string;
  'settings.family': string;
  'settings.size': string;
  'settings.sample': string;
  'settings.editorFontHelper': string;
  'settings.previewFontHelper': string;
  'settings.editorPreviewText': string;
  'settings.previewPreviewText': string;
  'settings.fontHintLocalFiltered': string;
  'settings.fontHintLocalFull': string;
  'settings.fontHintFallback': string;
  'settings.export': string;
  'settings.documentFont': string;
  'settings.pdfPageSize': string;
  'settings.pdfMargins': string;
  'settings.marginTop': string;
  'settings.marginRight': string;
  'settings.marginBottom': string;
  'settings.marginLeft': string;

  // ── Title bar ────────────────────────────────────────────────────
  'titlebar.open': string;
  'titlebar.save': string;
  'titlebar.saveCopy': string;
  'titlebar.export': string;
  'titlebar.exportPdf': string;
  'titlebar.exportHtml': string;
  'titlebar.noRecentFiles': string;
  'titlebar.clearRecent': string;
  'titlebar.recentFiles': string;
  'titlebar.moreSaveOptions': string;
  'titlebar.settings': string;
  'titlebar.keyboardShortcuts': string;
  'titlebar.close': string;
  'titlebar.minimize': string;
  'titlebar.maximize': string;
  'titlebar.restore': string;
  'titlebar.viewEditor': string;
  'titlebar.viewSplit': string;
  'titlebar.viewPreview': string;

  // ── Help dialog ──────────────────────────────────────────────────
  'help.title': string;
  'help.subtitle': string;
  'help.formatting': string;
  'help.tableNavigation': string;
  'help.editor': string;
  'help.file': string;
  'help.view': string;
  'help.bold': string;
  'help.italic': string;
  'help.strikethrough': string;
  'help.heading1': string;
  'help.heading2': string;
  'help.orderedList': string;
  'help.bulletList': string;
  'help.taskList': string;
  'help.blockquote': string;
  'help.codeBlock': string;
  'help.link': string;
  'help.nextCell': string;
  'help.prevCell': string;
  'help.selectAll': string;
  'help.selectNextOccurrence': string;
  'help.find': string;
  'help.findReplace': string;
  'help.undo': string;
  'help.redo': string;
  'help.moveLine': string;
  'help.deleteLine': string;
  'help.toggleComment': string;
  'help.newDocument': string;
  'help.openFile': string;
  'help.save': string;
  'help.saveCopy': string;
  'help.exportHtml': string;
  'help.exportPdf': string;
  'help.editorOnly': string;
  'help.splitView': string;
  'help.previewOnly': string;
  'help.keyboardShortcuts': string;

  // ── Editor toolbar ───────────────────────────────────────────────
  'toolbar.bold': string;
  'toolbar.italic': string;
  'toolbar.strikethrough': string;
  'toolbar.heading1': string;
  'toolbar.heading2': string;
  'toolbar.bullets': string;
  'toolbar.ordered': string;
  'toolbar.tasks': string;
  'toolbar.quote': string;
  'toolbar.codeBlock': string;
  'toolbar.link': string;
  'toolbar.image': string;
  'toolbar.table': string;
  'toolbar.chooseTableSize': string;
  'toolbar.columnsRows': string;

  // ── Insert-asset dialog ──────────────────────────────────────────
  'insertAsset.insertLink': string;
  'insertAsset.insertImage': string;
  'insertAsset.url': string;
  'insertAsset.linkText': string;
  'insertAsset.altText': string;
  'insertAsset.linkPlaceholder': string;
  'insertAsset.imagePlaceholder': string;
  'insertAsset.linkTextPlaceholder': string;
  'insertAsset.altTextPlaceholder': string;
  'insertAsset.cancel': string;
  'insertAsset.browse': string;
  'insertAsset.imagePathOrUrl': string;
  'insertAsset.localImageHint': string;
  'insertAsset.warnUnsaved': string;
  'insertAsset.warnOutsideFolder': string;

  // ── Preview image placeholders ───────────────────────────────────
  'preview.imageUnsaved': string;
  'preview.imageOutsideFolder': string;

  // ── Document status ──────────────────────────────────────────────
  'status.words': string;
  'status.characters': string;

  // ── Notices (use-document-actions) ───────────────────────────────
  'notice.saved': string;
  'notice.savedAs': string;
  'notice.htmlExported': string;
  'notice.pdfExported': string;
  'notice.alreadyUnsaved': string;
  'notice.freshDraft': string;
  'notice.opened': string;
  'notice.fileNotFound': string;

  // ── Menu (main process) ──────────────────────────────────────────
  'menu.file': string;
  'menu.new': string;
  'menu.open': string;
  'menu.save': string;
  'menu.saveAs': string;
  'menu.exportHtml': string;
  'menu.exportPdf': string;
  'menu.view': string;
  'menu.editorOnly': string;
  'menu.splitView': string;
  'menu.previewOnly': string;
};
