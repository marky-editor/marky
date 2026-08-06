import { HighlightStyle } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

const color = {
  foreground: 'hsl(var(--syntax-foreground))',
  /**
   * Headings and links used --primary directly, which is an accent built for
   * fills and swatches rather than for text. On a light surface that reached
   * 2.13:1 in amber. This keeps the accent's hue and darkens it enough to read.
   */
  heading: 'hsl(var(--syntax-heading))',
  comment: 'hsl(var(--syntax-comment))',
  string: 'hsl(var(--syntax-string))',
  keyword: 'hsl(var(--syntax-keyword))',
  function: 'hsl(var(--syntax-function))',
  class: 'hsl(var(--syntax-class))',
  constant: 'hsl(var(--syntax-constant))',
  parameter: 'hsl(var(--syntax-parameter))',
  error: 'hsl(var(--syntax-error))',
  tag: 'hsl(var(--syntax-tag))',
} as const;

/**
 * One highlight style shared by every theme. Colours resolve through the
 * `--syntax-*` CSS variables, so switching palette re-tints the editor with no
 * extension reconfiguration. Covers Markdown tokens and the languages CodeMirror
 * lazily loads for fenced code blocks.
 */
export const markyHighlightStyle = HighlightStyle.define([
  // --- Markdown structural tokens ---
  { tag: t.heading, color: color.heading, fontWeight: '700' },
  { tag: t.strong, color: color.foreground, fontWeight: '700' },
  { tag: t.emphasis, color: color.foreground, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: [t.link, t.url], color: color.heading, textDecoration: 'underline' },
  { tag: t.quote, color: color.comment, fontStyle: 'italic' },
  { tag: t.monospace, color: color.string },
  { tag: t.list, color: color.keyword },
  { tag: [t.processingInstruction, t.meta], color: color.comment },

  // --- Programming-language tokens (embedded fenced code) ---
  { tag: t.comment, color: color.comment, fontStyle: 'italic' },
  { tag: [t.keyword, t.modifier, t.operatorKeyword], color: color.keyword },
  { tag: [t.string, t.special(t.string), t.regexp], color: color.string },
  // Bold, not just coloured: function names sit in more colour-vision
  // collapses than any other token, and weight is the one cue that costs a
  // reader nothing. Safe to mark because these tags are code-only, so no
  // markdown ever renders bolder than it did.
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: color.function,
    fontWeight: '700',
  },
  { tag: [t.typeName, t.className, t.namespace], color: color.class },
  {
    tag: [t.number, t.bool, t.null, t.atom, t.constant(t.variableName)],
    color: color.constant,
  },
  {
    tag: [t.propertyName, t.attributeName, t.variableName],
    color: color.parameter,
  },
  // Also bold, and for the same reason. Chosen over keyword, which scores the
  // same but shares its colour with t.list and would put every bullet marker
  // in the document in bold.
  { tag: [t.tagName, t.angleBracket], color: color.tag, fontWeight: '700' },
  { tag: [t.operator, t.punctuation, t.separator], color: color.foreground },
  // Wavy underline rather than colour alone: error collapses into keyword, tag,
  // string and parameter once simulated for colour vision deficiency, and it is
  // the token that can least afford to be missed.
  { tag: t.invalid, color: color.error, textDecoration: 'underline wavy' },
]);
