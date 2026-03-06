/// <reference types="vite/client" />

import type { MarkyApi } from '@shared/contracts';

declare global {
  type MarkyLocalFont = {
    family: string;
    fullName?: string;
    postscriptName?: string;
    style?: string;
  };

  interface Window {
    marky: MarkyApi;
    queryLocalFonts?: () => Promise<MarkyLocalFont[]>;
  }

  namespace React {
    interface CSSProperties {
      WebkitAppRegion?: 'drag' | 'no-drag';
    }
  }
}

export {};
