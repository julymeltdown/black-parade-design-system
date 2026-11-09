/** The public design contract. Keep these values aligned with tokens.css. */
export const tokens = {
  color: {
    paper: '#e9e6dd',
    paperLight: '#f1eee6',
    ink: '#1c1b18',
    muted: '#67635b',
    line: '#b6b0a3',
    blood: '#782f2d',
  },
  font: {
    display: "'Bodoni Moda', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    condensed: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  },
  space: [4, 8, 12, 16, 24, 32, 48, 64],
  radius: 0,
  target: { minimum: 44, standard: 48 },
  motion: { fast: 120, base: 180, slow: 240, easing: 'cubic-bezier(.2,.65,.3,1)' },
  breakpoint: { mobile: 640, tablet: 900, desktop: 1180 },
  layer: { sticky: 20, player: 30, toast: 70 },
} as const;

export type DesignTokens = typeof tokens;
