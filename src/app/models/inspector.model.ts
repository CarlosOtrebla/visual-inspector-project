/**
 * Interfaces e tipos do Inspetor Visual para tipagem estrita e reuso no projeto.
 */

export interface BorderSides {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  all: boolean;
}

export interface InspectorBridgePayload {
  tagName: string;
  classList: string;
  originalClasses: string[];
  modifiedStyles: Record<string, string>;
  outerHTML: string;
  selector: string;
  timestamp?: string;
}

export interface ParsedGradient {
  startColor: string;
  endColor: string;
  angle: string;
}

export type InspectorTab = 'colors' | 'layout';
export type SpacingMode = 'all' | 'indiv';

export const SYSTEM_DEFAULT_PALETTE: readonly string[] = [
  '#00A459', '#008B4B', '#006B3A', // Cores Verdes
  '#019CDE', '#0184BD', '#017DA4', // Cores Azuis
  '#C64135', '#B03429', '#91271E', // Cores Vermelhas
  '#393931', '#262621', '#1A1A16', // Toneladas Carvão/Dark
  '#FEEF10'                         // Destaque Amarelo
] as const;
