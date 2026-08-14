import { Injectable } from '@angular/core';
import { ParsedGradient } from '../models/inspector.model';

@Injectable({
  providedIn: 'root'
})
export class StyleUtilsService {

  /**
   * Converte uma string de cor CSS no formato rgb(a) para hexadecimal (#RRGGBB).
   * Caso a cor seja transparente ou inválida, retorna '#FFFFFF'.
   */
  public rgbToHex(rgbStr: string): string {
    if (!rgbStr || rgbStr === 'transparent' || rgbStr === 'rgba(0, 0, 0, 0)') {
      return '#FFFFFF';
    }

    if (!rgbStr.startsWith('rgb')) {
      return '#FFFFFF';
    }

    const match = rgbStr.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (!match) return '#FFFFFF';

    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const a = match[4] ? parseFloat(match[4]) : 1;

    if (a === 0) return '#FFFFFF';

    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  /**
   * Converte uma string de imagem de fundo com gradiente linear em um objeto estruturado ParsedGradient.
   */
  public parseLinearGradient(bgImageStr: string): ParsedGradient {
    let startColor = '#00A459';
    let endColor = '#019CDE';
    let angle = '90';

    if (!bgImageStr || bgImageStr === 'none') {
      return { startColor, endColor, angle };
    }

    const colorMatches = bgImageStr.match(/rgba?\(?[\d\s,.]+\)?|#[0-9a-fA-F]{3,8}/g);
    if (colorMatches && colorMatches.length >= 2) {
      startColor = this.rgbToHex(colorMatches[0]);
      endColor = this.rgbToHex(colorMatches[1]);
    } else if (colorMatches && colorMatches.length === 1) {
      startColor = this.rgbToHex(colorMatches[0]);
      endColor = this.rgbToHex(colorMatches[0]);
    }

    const angleMatch = bgImageStr.match(/(\d+)deg/);
    if (angleMatch) {
      angle = angleMatch[1];
    } else if (bgImageStr.includes('to right')) {
      angle = '90';
    } else if (bgImageStr.includes('to bottom')) {
      angle = '180';
    } else if (bgImageStr.includes('to bottom right')) {
      angle = '135';
    }

    return { startColor, endColor, angle };
  }

  /**
   * Calcula o ângulo em graus a partir do centro de um elemento dial circular e as coordenadas do clique.
   */
  public calculateAngleFromCoordinates(centerX: number, centerY: number, clickX: number, clickY: number): number {
    const dx = clickX - centerX;
    const dy = clickY - centerY;
    const angleRad = Math.atan2(dx, -dy);
    let angleDeg = Math.round(angleRad * (180 / Math.PI));

    if (angleDeg < 0) {
      angleDeg += 360;
    }

    return angleDeg;
  }

  /**
   * Extrai o valor numérico em pixels de uma propriedade CSS com sufixo (ex: "16px" -> 16).
   */
  public parsePxValue(valStr: string, fallback = 0): number {
    if (!valStr) return fallback;
    const parsed = parseInt(valStr, 10);
    return isNaN(parsed) ? fallback : parsed;
  }
}
