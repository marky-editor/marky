import { describe, it, expect } from 'vitest';
import {
  THEMES,
  deltaE2000,
  hslTripletToRgb,
  paletteVars,
  simulate,
} from '../helpers/theme-colors';

/**
 * Syntax highlighting has to stay legible for readers with colour vision
 * deficiency, which contrast alone does not guarantee: two tokens can both
 * clear 4.5:1 against the background and still be the same colour as each
 * other once simulated.
 *
 * Every palette is simulated across the protan, deutan and tritan families,
 * and every token pair that is clearly distinct in normal vision is checked
 * for collapsing under simulation.
 *
 * KNOWN is the debt that already exists, grouped by conflict so the shape of
 * it is visible: a conflict listing all twelve palettes is one shared colour
 * pair to fix, a conflict listing one palette is local to that palette. The
 * suite fails both on a new collapse and on a stale entry, so the list has to
 * shrink deliberately rather than drift.
 */
const SYNTAX_KEYS = [
  'syntax-heading',
  'syntax-foreground',
  'syntax-comment',
  'syntax-string',
  'syntax-keyword',
  'syntax-function',
  'syntax-class',
  'syntax-constant',
  'syntax-parameter',
  'syntax-error',
  'syntax-tag',
];

/**
 * CIEDE2000 distance below which two colours read as the same colour.
 *
 * Anchored by rendering rather than assumed: token pairs were drawn as
 * interleaved code in their simulated colours and inspected. Below about 9.7
 * the two tokens in a line were not tellable apart; separation becomes
 * reliable around 10 to 11. Side-by-side text in a single line is the easiest
 * case there is — real code scatters these tokens — so the threshold sits at
 * the optimistic end of what was legible, not beyond it.
 */
const DISTINCT = 10;

/**
 * Machado, Oliveira & Fernandes (2009), applied in linear RGB, as published in
 * the colour-science dataset. Each row is the flattened 3x3 matrix.
 *
 * Severity 1.0 is dichromacy; lower severities are anomalous trichromacy,
 * which is both milder and far more common. Severity 1.0 is not a worst case
 * that subsumes the rest — colours can converge partway along the range and
 * separate again — so the whole range is swept.
 */
// prettier-ignore
const CVD_MATRICES = {
  protanomaly: {
    0.5: [0.458064, 0.679578, -0.137642, 0.092785, 0.846313, 0.060902, -0.007494, -0.016807, 1.024301],
    0.6: [0.385450, 0.769005, -0.154455, 0.100526, 0.829802, 0.069673, -0.007442, -0.022190, 1.029632],
    0.7: [0.319627, 0.849633, -0.169261, 0.106241, 0.815969, 0.077790, -0.007025, -0.028051, 1.035076],
    0.8: [0.259411, 0.923008, -0.182420, 0.110296, 0.804340, 0.085364, -0.006276, -0.034346, 1.040622],
    0.9: [0.203876, 0.990338, -0.194214, 0.112975, 0.794542, 0.092483, -0.005222, -0.041043, 1.046265],
    1.0: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  },
  deuteranomaly: {
    0.5: [0.547494, 0.607765, -0.155259, 0.181692, 0.781742, 0.036566, -0.010410, 0.027275, 0.983136],
    0.6: [0.498864, 0.674741, -0.173604, 0.205199, 0.754872, 0.039929, -0.011131, 0.030969, 0.980162],
    0.7: [0.457771, 0.731899, -0.189670, 0.226409, 0.731012, 0.042579, -0.011595, 0.034333, 0.977261],
    0.8: [0.422823, 0.781057, -0.203881, 0.245752, 0.709602, 0.044646, -0.011843, 0.037423, 0.974421],
    0.9: [0.392952, 0.823610, -0.216562, 0.263559, 0.690210, 0.046232, -0.011910, 0.040281, 0.971630],
    1.0: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.011820, 0.042940, 0.968881],
  },
  tritanomaly: {
    0.5: [1.017277, 0.027029, -0.044306, -0.006113, 0.958479, 0.047634, 0.006379, 0.248708, 0.744913],
    0.6: [1.104996, -0.046633, -0.058363, -0.032137, 0.971635, 0.060503, 0.001336, 0.317922, 0.680742],
    0.7: [1.193214, -0.109812, -0.083402, -0.058496, 0.979410, 0.079086, -0.002346, 0.403492, 0.598854],
    0.8: [1.257728, -0.139648, -0.118081, -0.078003, 0.975409, 0.102594, -0.003316, 0.501214, 0.502102],
    0.9: [1.278864, -0.125333, -0.153531, -0.084748, 0.957674, 0.127074, -0.000989, 0.601151, 0.399838],
    1.0: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.303900],
  },
} as const;

const SEVERITIES = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0] as const;

const KNOWN: Record<string, string[]> = {
  'deuteranomaly class/tag': ['dark/amber', 'dark/jade'],
  'deuteranomaly comment/class': [
    'light/amethyst',
    'light/rose',
    'light/sapphire',
  ],
  'deuteranomaly comment/constant': ['dark/amethyst'],
  'deuteranomaly comment/error': ['dark/amber'],
  'deuteranomaly comment/function': ['light/amber'],
  'deuteranomaly comment/keyword': [
    'dark/jade',
    'dark/rose',
    'dark/sapphire',
    'light/amber',
    'light/coral',
    'light/jade',
    'light/rose',
  ],
  'deuteranomaly comment/tag': [
    'dark/jade',
    'dark/rose',
    'dark/sapphire',
    'light/amber',
    'light/coral',
    'light/jade',
    'light/rose',
  ],
  'deuteranomaly function/error': ['dark/amber'],
  'deuteranomaly function/parameter': [
    'dark/amber',
    'dark/amethyst',
    'dark/coral',
    'dark/jade',
    'dark/rose',
    'dark/sapphire',
  ],
  'deuteranomaly heading/comment': ['dark/amethyst', 'dark/rose'],
  'deuteranomaly heading/constant': ['dark/sapphire', 'light/sapphire'],
  'deuteranomaly heading/error': ['light/coral'],
  'deuteranomaly heading/function': ['light/amber', 'light/rose'],
  'deuteranomaly heading/keyword': ['dark/jade'],
  'deuteranomaly heading/tag': ['dark/jade'],
  'deuteranomaly keyword/class': ['dark/amber', 'dark/jade'],
  'deuteranomaly parameter/error': [
    'dark/amber',
    'dark/amethyst',
    'dark/coral',
    'dark/jade',
    'dark/rose',
    'dark/sapphire',
    'light/amber',
    'light/amethyst',
    'light/coral',
    'light/jade',
    'light/rose',
    'light/sapphire',
  ],
  'deuteranomaly string/error': ['light/amber'],
  'deuteranomaly string/function': [
    'dark/amethyst',
    'dark/coral',
    'dark/jade',
    'dark/rose',
    'dark/sapphire',
    'light/coral',
    'light/jade',
  ],
  'deuteranomaly string/parameter': ['light/amber'],
  'protanomaly comment/class': ['light/rose', 'light/sapphire'],
  'protanomaly comment/constant': ['dark/amethyst', 'dark/rose'],
  'protanomaly comment/error': ['dark/amber', 'light/amber'],
  'protanomaly comment/function': ['light/amber'],
  'protanomaly comment/keyword': [
    'dark/amethyst',
    'dark/rose',
    'dark/sapphire',
    'light/amethyst',
  ],
  'protanomaly comment/tag': [
    'dark/amethyst',
    'dark/rose',
    'dark/sapphire',
    'light/amethyst',
  ],
  'protanomaly constant/tag': ['dark/amber', 'dark/jade'],
  'protanomaly foreground/class': [
    'dark/amber',
    'dark/amethyst',
    'dark/coral',
    'dark/jade',
    'dark/rose',
    'dark/sapphire',
  ],
  'protanomaly function/error': ['light/amber', 'light/coral', 'light/jade'],
  'protanomaly function/parameter': ['dark/amber', 'light/coral', 'light/jade'],
  'protanomaly heading/comment': ['dark/amethyst', 'dark/rose'],
  'protanomaly heading/constant': ['dark/sapphire', 'light/sapphire'],
  'protanomaly heading/error': ['light/amber', 'light/coral'],
  'protanomaly heading/foreground': ['dark/jade'],
  'protanomaly heading/function': ['dark/amber', 'light/amber', 'light/coral'],
  'protanomaly heading/parameter': ['light/amber'],
  'protanomaly heading/string': ['light/amber'],
  'protanomaly keyword/constant': ['dark/amber', 'dark/jade'],
  'protanomaly parameter/error': [
    'light/amethyst',
    'light/coral',
    'light/jade',
    'light/rose',
    'light/sapphire',
  ],
  'protanomaly string/error': [
    'light/amethyst',
    'light/coral',
    'light/jade',
    'light/rose',
    'light/sapphire',
  ],
  'protanomaly string/function': [
    'dark/amber',
    'dark/amethyst',
    'dark/coral',
    'dark/jade',
    'dark/rose',
    'dark/sapphire',
  ],
  'protanomaly string/parameter': ['light/amber', 'light/rose'],
  'tritanomaly comment/class': ['light/sapphire'],
  'tritanomaly comment/constant': ['dark/amethyst'],
  'tritanomaly error/tag': [
    'dark/amber',
    'dark/amethyst',
    'dark/coral',
    'dark/jade',
    'dark/rose',
    'dark/sapphire',
  ],
  'tritanomaly foreground/string': [
    'dark/amber',
    'dark/amethyst',
    'dark/coral',
    'dark/jade',
    'dark/rose',
    'dark/sapphire',
  ],
  'tritanomaly function/class': [
    'dark/amber',
    'dark/amethyst',
    'dark/coral',
    'dark/jade',
    'dark/rose',
    'dark/sapphire',
    'light/amethyst',
    'light/rose',
    'light/sapphire',
  ],
  'tritanomaly heading/comment': [
    'dark/amethyst',
    'light/coral',
    'light/jade',
    'light/sapphire',
  ],
  'tritanomaly heading/error': ['dark/rose', 'light/rose'],
  'tritanomaly heading/foreground': ['dark/amber'],
  'tritanomaly heading/function': ['dark/jade'],
  'tritanomaly heading/keyword': ['light/rose'],
  'tritanomaly heading/tag': ['light/rose'],
  'tritanomaly keyword/error': [
    'dark/amber',
    'dark/amethyst',
    'dark/coral',
    'dark/jade',
    'dark/rose',
    'dark/sapphire',
    'light/rose',
  ],
  'tritanomaly keyword/parameter': [
    'light/amethyst',
    'light/coral',
    'light/jade',
    'light/sapphire',
  ],
  'tritanomaly parameter/error': [
    'dark/amber',
    'dark/jade',
    'light/amber',
    'light/coral',
    'light/jade',
  ],
  'tritanomaly parameter/tag': [
    'light/amethyst',
    'light/coral',
    'light/jade',
    'light/sapphire',
  ],
};

/**
 * Conflict -> the palettes it occurs in. A pair counts as collapsed if it is
 * indistinguishable at any severity, recorded once per deficiency rather than
 * once per severity: the reader either loses the distinction or does not.
 */
function collapsedConflicts(): Record<string, string[]> {
  const found: Record<string, string[]> = {};

  for (const mode of ['light', 'dark'] as const) {
    for (const name of THEMES) {
      const vars = paletteVars(mode, name);
      const colors = SYNTAX_KEYS.filter((k) => vars[k]).map(
        (k) => [k.replace('syntax-', ''), hslTripletToRgb(vars[k])] as const,
      );

      for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
          const [nameA, a] = colors[i];
          const [nameB, b] = colors[j];
          // Tokens that already share a colour are not a collapse to fix.
          if (deltaE2000(a, b) < DISTINCT) continue;

          for (const deficiency of Object.keys(CVD_MATRICES) as Array<
            keyof typeof CVD_MATRICES
          >) {
            for (const severity of SEVERITIES) {
              const matrix = CVD_MATRICES[deficiency][severity];
              if (
                deltaE2000(simulate(a, matrix), simulate(b, matrix)) >= DISTINCT
              ) {
                continue;
              }
              (found[`${deficiency} ${nameA}/${nameB}`] ??= []).push(
                `${mode}/${name}`,
              );
              break;
            }
          }
        }
      }
    }
  }

  for (const palettes of Object.values(found)) palettes.sort();
  return found;
}

/**
 * Non-colour cues from highlight-style.ts. A pair whose two tokens carry
 * different cues stays tellable apart even when the colours collapse, so it is
 * not the same risk as a pair distinguished by hue alone.
 *
 * Keep in step with markyHighlightStyle: a cue removed there without being
 * removed here would overstate how safe the palette is.
 */
const NON_COLOUR_CUES: Record<string, string> = {
  comment: 'italic',
  error: 'wavy underline',
};

function isMitigated(conflict: string): boolean {
  const [a, b] = conflict.split(' ')[1].split('/');
  return (NON_COLOUR_CUES[a] ?? '') !== (NON_COLOUR_CUES[b] ?? '');
}

describe('syntax colours under colour vision deficiency', () => {
  const collapsed = collapsedConflicts();

  it('introduces no collapse that is not already recorded', () => {
    const unrecorded: string[] = [];
    for (const [conflict, palettes] of Object.entries(collapsed)) {
      for (const palette of palettes) {
        if (!KNOWN[conflict]?.includes(palette)) {
          unrecorded.push(`${conflict} in ${palette}`);
        }
      }
    }
    expect(unrecorded).toEqual([]);
  });

  it('has no stale entries, so the known list shrinks deliberately', () => {
    const stale: string[] = [];
    for (const [conflict, palettes] of Object.entries(KNOWN)) {
      for (const palette of palettes) {
        if (!collapsed[conflict]?.includes(palette)) {
          stale.push(`${conflict} in ${palette}`);
        }
      }
    }
    expect(stale).toEqual([]);
  });

  // The count that actually matters. Everything else survives on italics or a
  // wavy underline; these are distinguishable by hue alone, so a reader with
  // colour vision deficiency has nothing else to go on.
  //
  // 80 of 175. Was 125 while the palette only had to clear contrast; solving
  // the token lightnesses against each other as well took out 45 of them.
  //
  // 80 is an upper bound rather than a floor. The search moved lightness only,
  // left hue and saturation alone, and hill-climbs from the current values, so
  // it cannot reach an arrangement that needs a worse step first.
  it('adds no colour-only collapse beyond the recorded 80', () => {
    const bare = Object.entries(collapsed)
      .filter(([conflict]) => !isMitigated(conflict))
      .reduce((total, [, palettes]) => total + palettes.length, 0);
    expect(bare).toBeLessThanOrEqual(80);
  });

  it('keeps error distinguishable by something other than hue', () => {
    const bareErrors = Object.keys(collapsed)
      .filter((conflict) => conflict.includes('error'))
      .filter((conflict) => !isMitigated(conflict));
    expect(bareErrors).toEqual([]);
  });
});
