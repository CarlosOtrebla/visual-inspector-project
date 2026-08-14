import { Injectable } from '@angular/core';
import { StyleUtilsService } from './style-utils.service';
import { SYSTEM_DEFAULT_PALETTE } from '../models/inspector.model';

@Injectable({
  providedIn: 'root'
})
export class DomInspectorService {
  private hoverOverlay: HTMLDivElement | null = null;

  /**
   * Cria o elemento visual de sobreposição (overlay) para indicar o componente sob a mira.
   */
  public createHoverOverlay(): HTMLDivElement {
    if (this.hoverOverlay) return this.hoverOverlay;

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.pointerEvents = 'none';
    overlay.style.border = '2px solid #10b981'; // Verde Neon
    overlay.style.backgroundColor = 'rgba(16, 185, 129, 0.08)';
    overlay.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.4)';
    overlay.style.zIndex = '99999';
    overlay.style.display = 'none';
    overlay.style.borderRadius = '4px';

    document.body.appendChild(overlay);
    this.hoverOverlay = overlay;
    return overlay;
  }

  /**
   * Atualiza a posição e dimensões do overlay sobre o elemento alvo inspecionado.
   */
  public updateHoverOverlayPosition(target: HTMLElement): void {
    if (!this.hoverOverlay) {
      this.createHoverOverlay();
    }

    if (this.hoverOverlay) {
      const rect = target.getBoundingClientRect();
      this.hoverOverlay.style.top = `${rect.top}px`;
      this.hoverOverlay.style.left = `${rect.left}px`;
      this.hoverOverlay.style.width = `${rect.width}px`;
      this.hoverOverlay.style.height = `${rect.height}px`;
      this.hoverOverlay.style.display = 'block';
    }
  }

  /**
   * Oculta temporariamente a exibição do overlay.
   */
  public hideHoverOverlay(): void {
    if (this.hoverOverlay) {
      this.hoverOverlay.style.display = 'none';
    }
  }

  /**
   * Remove o overlay do DOM e limpa a referência.
   */
  public removeHoverOverlay(): void {
    if (this.hoverOverlay) {
      this.hoverOverlay.remove();
      this.hoverOverlay = null;
    }
  }

  /**
   * Verifica se o elemento informado pertence ao próprio painel do inspetor.
   */
  public isInsidePanel(target: HTMLElement, containerNativeElement: HTMLElement): boolean {
    return containerNativeElement.contains(target) || target.closest('app-visual-inspector') !== null;
  }

  /**
   * Gera um seletor CSS básico e exclusivo para auxílio na identificação do elemento no projeto.
   */
  public getUniqueSelector(el: HTMLElement): string {
    if (el.id) {
      return `#${el.id}`;
    }

    if (el.className && typeof el.className === 'string') {
      const classes = el.className
        .split(/\s+/)
        .filter(c => c.trim().length > 0 && !c.includes(':') && !c.startsWith('vi-') && !c.startsWith('ng-'));
      if (classes.length > 0) {
        return `${el.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }

    return el.tagName.toLowerCase();
  }

  /**
   * Realiza uma varredura nos elementos visíveis da página para compor a paleta de cores ativas do sistema.
   */
  public extractSystemColorsFromDom(styleUtils: StyleUtilsService, maxElements = 400): string[] {
    const colorsSet = new Set<string>();

    SYSTEM_DEFAULT_PALETTE.forEach(color => colorsSet.add(color.toUpperCase()));

    try {
      const allElements = document.querySelectorAll('*');
      let inspectedCount = 0;

      for (let i = 0; i < allElements.length && inspectedCount < maxElements; i++) {
        const el = allElements[i] as HTMLElement;
        if (!el || el.closest('app-visual-inspector')) continue;

        const styles = window.getComputedStyle(el);

        if (styles.backgroundColor && styles.backgroundColor !== 'transparent' && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const hex = styleUtils.rgbToHex(styles.backgroundColor);
          if (hex && hex !== '#FFFFFF' && hex !== '#000000') {
            colorsSet.add(hex.toUpperCase());
          }
        }

        if (styles.color && styles.color !== 'transparent' && styles.color !== 'rgba(0, 0, 0, 0)') {
          const hex = styleUtils.rgbToHex(styles.color);
          if (hex && hex !== '#FFFFFF' && hex !== '#000000') {
            colorsSet.add(hex.toUpperCase());
          }
        }

        if (styles.borderColor && styles.borderColor !== 'transparent' && styles.borderColor !== 'rgba(0, 0, 0, 0)') {
          const hex = styleUtils.rgbToHex(styles.borderColor);
          if (hex && hex !== '#FFFFFF' && hex !== '#000000') {
            colorsSet.add(hex.toUpperCase());
          }
        }

        inspectedCount++;
      }
    } catch (error) {
      console.warn('[DomInspectorService] Erro ao varrer cores do sistema:', error);
    }

    return Array.from(colorsSet).slice(0, 24);
  }
}
