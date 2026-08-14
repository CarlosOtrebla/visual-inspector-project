import { Component, Input, Output, EventEmitter, HostListener, ElementRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Palette,
  X,
  Target,
  Info,
  RotateCcw,
  Check,
  Loader,
  ChevronUp,
  ChevronDown
} from 'lucide-angular';

@Component({
  selector: 'app-visual-inspector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './visual-inspector.component.html',
  styleUrl: './visual-inspector.component.css'
})
export class VisualInspectorComponent implements OnDestroy {
  private readonly elementRef = inject(ElementRef);

  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();

  // Coordenadas e dimensões iniciais da janela flutuante (largura maior para duas colunas)
  public x = window.innerWidth - 540;
  public y = 80;
  public width = 520;
  public height = 450;

  // Estado de envio para a ponte local
  public isApplying = false;

  // Lógica de Arrasto
  private isDragging = false;
  private startDragX = 0;
  private startDragY = 0;
  private panelStartX = 0;
  private panelStartY = 0;

  // Lógica de Redimensionamento
  private isResizing = false;
  private startResizeX = 0;
  private startResizeY = 0;
  private panelStartWidth = 0;
  private panelStartHeight = 0;

  // Lógica de Inspeção (Mira)
  public inspectMode = false;
  public selectedElement: HTMLElement | null = null;
  public tagName = '';
  public classList = '';
  public hasGradient = false;

  // Pilha de histórico de elementos filhos selecionados antes de subir de nível
  public selectionHistory: HTMLElement[] = [];

  // Cores temporárias
  public tempBgColor = '#ffffff';
  public tempTextColor = '#000000';
  public tempBorderColor = '#cccccc';

  // Backups de cores originais para o reset individual
  private originalBgColor = '#ffffff';
  private originalTextColor = '#000000';
  private originalBorderColor = '#cccccc';
  private originalBgImage = 'none';
  private originalHasGradient = false;

  // Variáveis para o modo Gradiente
  public useGradientMode = false;
  public gradientStartColor = '#00A459';
  public gradientEndColor = '#019CDE';
  public gradientAngle = '90';

  // Propriedade ativa selecionada para edição rápida por paleta
  public activeColorField = 'bg';
  // Lista de cores detectadas em uso no sistema/DOM
  public systemColors: string[] = [];

  // Aba ativa na interface
  public activeTab = 'colors'; // 'colors' | 'layout'

  // Variáveis para as propriedades de layout e borda
  public margin = '0';
  public padding = '0';
  public borderStyle = 'solid';
  public borderWidth = '1';

  // Tipografia
  public fontSize = '16';
  public fontWeight = '400';
  public textTransform = 'none';
  public lineHeight = '1.2';
  public letterSpacing = '0';
  public textAlign = 'left';
  public fontStyle = 'normal';
  public textDecoration = 'none';

  // Layout & Display
  public display = 'block';
  public flexDirection = 'row';
  public flexWrap = 'nowrap';
  public flexGap = '0';
  public justifyContent = 'flex-start';
  public alignItems = 'stretch';

  // Margem e Padding (Geral/Lados)
  public marginMode: 'all' | 'indiv' = 'all';
  public marginTop = '0';
  public marginRight = '0';
  public marginBottom = '0';
  public marginLeft = '0';

  public paddingMode: 'all' | 'indiv' = 'all';
  public paddingTop = '0';
  public paddingRight = '0';
  public paddingBottom = '0';
  public paddingLeft = '0';

  // Bordas por Lado
  public borderWidthMode: 'all' | 'indiv' = 'all';
  public borderTopWidth = '0';
  public borderRightWidth = '0';
  public borderBottomWidth = '0';
  public borderLeftWidth = '0';

  // Radius (Geral/Cantos)
  public radiusMode: 'all' | 'indiv' = 'all';
  public borderRadius = '0';
  public borderTopLeftRadius = '0';
  public borderTopRightRadius = '0';
  public borderBottomRightRadius = '0';
  public borderBottomLeftRadius = '0';

  // Controle de lados da borda: 'all' ou combinação de 'top','right','bottom','left'
  public borderSides: { top: boolean; right: boolean; bottom: boolean; left: boolean; all: boolean } = {
    top: true, right: true, bottom: true, left: true, all: true
  };

  // Backups de layout originais para reset individual
  private originalMargin = '0';
  private originalPadding = '0';
  private originalBorderStyle = 'solid';
  private originalBorderWidth = '1';

  // Backups originais adicionais para reset
  private originalFontSize = '16';
  private originalFontWeight = '400';
  private originalTextTransform = 'none';
  private originalLineHeight = '1.2';
  private originalLetterSpacing = '0';
  private originalTextAlign = 'left';
  private originalFontStyle = 'normal';
  private originalTextDecoration = 'none';

  private originalDisplay = 'block';
  private originalFlexDirection = 'row';
  private originalFlexWrap = 'nowrap';
  private originalFlexGap = '0';
  private originalJustifyContent = 'flex-start';
  private originalAlignItems = 'stretch';

  private originalMarginTop = '0';
  private originalMarginRight = '0';
  private originalMarginBottom = '0';
  private originalMarginLeft = '0';

  private originalPaddingTop = '0';
  private originalPaddingRight = '0';
  private originalPaddingBottom = '0';
  private originalPaddingLeft = '0';

  private originalBorderTopWidth = '0';
  private originalBorderRightWidth = '0';
  private originalBorderBottomWidth = '0';
  private originalBorderLeftWidth = '0';

  private originalBorderTopLeftRadius = '0';
  private originalBorderTopRightRadius = '0';
  private originalBorderBottomRightRadius = '0';
  private originalBorderBottomLeftRadius = '0';
  private originalBorderRadius = '0';


  // Backups de gradiente originais para reset individual
  private originalGradientStartColor = '#00A459';
  private originalGradientEndColor = '#019CDE';
  private originalGradientAngle = '90';


  // Div de Overlay para indicação da mira
  private hoverOverlay: HTMLDivElement | null = null;

  static readonly icons = {
    Palette,
    X,
    Target,
    Info,
    RotateCcw,
    Check,
    Loader,
    ChevronUp,
    ChevronDown
  };

  ngOnDestroy(): void {
    this.removeHoverOverlay();
  }

  // Ações do Cabeçalho para Arrastar
  public onMouseDownHeader(event: MouseEvent): void {
    if (event.button !== 0) return; // Apenas clique esquerdo

    // Ignora arrasto se clicar em botões no cabeçalho
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;

    this.isDragging = true;
    this.startDragX = event.clientX;
    this.startDragY = event.clientY;
    this.panelStartX = this.x;
    this.panelStartY = this.y;
    event.preventDefault();
  }

  // Ações da alça de redimensionamento
  public onMouseDownResize(event: MouseEvent): void {
    if (event.button !== 0) return; // Apenas clique esquerdo
    this.isResizing = true;
    this.startResizeX = event.clientX;
    this.startResizeY = event.clientY;
    this.panelStartWidth = this.width;
    this.panelStartHeight = this.height;
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('document:mousemove', ['$event'])
  public onMouseMove(event: MouseEvent): void {
    // 1. Lógica de Drag da Janela
    if (this.isDragging) {
      const dx = event.clientX - this.startDragX;
      const dy = event.clientY - this.startDragY;

      // Limites da tela
      const maxX = window.innerWidth - this.width;
      const maxY = window.innerHeight - 80;

      this.x = Math.max(10, Math.min(this.panelStartX + dx, maxX));
      this.y = Math.max(10, Math.min(this.panelStartY + dy, maxY));
    }

    // 2. Lógica de Redimensionamento da Janela
    if (this.isResizing) {
      const dx = event.clientX - this.startResizeX;
      const dy = event.clientY - this.startResizeY;

      // Limites de tamanho
      this.width = Math.max(280, Math.min(this.panelStartWidth + dx, window.innerWidth - this.x - 20));
      this.height = Math.max(220, Math.min(this.panelStartHeight + dy, window.innerHeight - this.y - 20));
    }

    // 3. Lógica de Overlay na Mira
    if (this.inspectMode) {
      this.handleInspectMove(event);
    }
  }

  @HostListener('document:mouseup')
  public onMouseUp(): void {
    this.isDragging = false;
    this.isResizing = false;
  }

  // Intercepta o clique global para selecionar o elemento sob a mira
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (this.inspectMode) {
      const target = event.target as HTMLElement;

      // Ignora clique se for dentro do próprio painel do inspetor
      if (this.isInsidePanel(target)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      this.selectElement(target);
      this.disableInspectMode();
    }
  }

  // Abre e fecha o modo de mira
  public toggleInspectMode(): void {
    this.inspectMode = !this.inspectMode;
    if (this.inspectMode) {
      this.createHoverOverlay();
    } else {
      this.disableInspectMode();
    }
  }

  private disableInspectMode(): void {
    this.inspectMode = false;
    this.removeHoverOverlay();
  }

  private handleInspectMove(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target || this.isInsidePanel(target)) {
      if (this.hoverOverlay) {
        this.hoverOverlay.style.display = 'none';
      }
      return;
    }

    this.createHoverOverlay();
    if (this.hoverOverlay) {
      const rect = target.getBoundingClientRect();
      this.hoverOverlay.style.top = `${rect.top}px`;
      this.hoverOverlay.style.left = `${rect.left}px`;
      this.hoverOverlay.style.width = `${rect.width}px`;
      this.hoverOverlay.style.height = `${rect.height}px`;
      this.hoverOverlay.style.display = 'block';
    }
  }

  private isInsidePanel(target: HTMLElement): boolean {
    return this.elementRef.nativeElement.contains(target) || target.closest('app-visual-inspector') !== null;
  }

  private createHoverOverlay(): void {
    if (this.hoverOverlay) return;

    this.hoverOverlay = document.createElement('div');
    this.hoverOverlay.style.position = 'fixed';
    this.hoverOverlay.style.pointerEvents = 'none';
    this.hoverOverlay.style.border = '2px solid #10b981'; // Verde Neon
    this.hoverOverlay.style.backgroundColor = 'rgba(16, 185, 129, 0.08)';
    this.hoverOverlay.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.4)';
    this.hoverOverlay.style.zIndex = '99999';
    this.hoverOverlay.style.display = 'none';
    this.hoverOverlay.style.borderRadius = '4px';
    document.body.appendChild(this.hoverOverlay);
  }

  private removeHoverOverlay(): void {
    if (this.hoverOverlay) {
      this.hoverOverlay.remove();
      this.hoverOverlay = null;
    }
  }

  // Faz a seleção do elemento e armazena os backups de estilo originais
  public selectElement(target: HTMLElement, keepHistory = false): void {
    if (!keepHistory) {
      this.selectionHistory = [];
    }
    this.selectedElement = target;
    this.tagName = target.tagName;
    this.classList = target.className;

    // Captura estilos e faz o backup de segurança das cores
    const styles = window.getComputedStyle(target);
    this.originalBgColor = this.rgbToHex(styles.backgroundColor);
    this.originalTextColor = this.rgbToHex(styles.color);

    // Leitura inteligente de bordas inativas/transparentes para backup
    let originalBorder = styles.borderColor;
    if (!originalBorder || originalBorder === 'transparent' || originalBorder === 'rgba(0, 0, 0, 0)' || this.rgbToHex(originalBorder) === '#FFFFFF') {
      const borderDirs = [
        { color: styles.borderBottomColor, width: styles.borderBottomWidth },
        { color: styles.borderTopColor, width: styles.borderTopWidth },
        { color: styles.borderLeftColor, width: styles.borderLeftWidth },
        { color: styles.borderRightColor, width: styles.borderRightWidth }
      ];
      const activeBorder = borderDirs.find(b => b.width && b.width !== '0px' && b.color && b.color !== 'transparent' && b.color !== 'rgba(0, 0, 0, 0)');
      if (activeBorder) {
        originalBorder = activeBorder.color;
      }
    }
    this.originalBorderColor = this.rgbToHex(originalBorder);
    this.originalBgImage = styles.backgroundImage;
    this.originalHasGradient = styles.backgroundImage.includes('gradient') || styles.background.includes('gradient');

    // Lê os estilos atuais
    this.readElementColors(target);

    // Inicializa o modo gradiente com base no elemento ou valores padrão
    this.useGradientMode = this.hasGradient;
    if (this.hasGradient && this.originalBgImage !== 'none') {
      const colorMatches = this.originalBgImage.match(/rgba?\(?[\d\s,.]+\)?|#[0-9a-fA-F]{3,8}/g);
      if (colorMatches && colorMatches.length >= 2) {
        this.gradientStartColor = this.rgbToHex(colorMatches[0]);
        this.gradientEndColor = this.rgbToHex(colorMatches[1]);
      } else if (colorMatches && colorMatches.length === 1) {
        this.gradientStartColor = this.rgbToHex(colorMatches[0]);
        this.gradientEndColor = this.rgbToHex(colorMatches[0]);
      }

      // Captura o ângulo do gradiente
      const angleMatch = this.originalBgImage.match(/(\d+)deg/);
      if (angleMatch) {
        this.gradientAngle = angleMatch[1];
      } else if (this.originalBgImage.includes('to right')) {
        this.gradientAngle = '90';
      } else if (this.originalBgImage.includes('to bottom')) {
        this.gradientAngle = '180';
      } else if (this.originalBgImage.includes('to bottom right')) {
        this.gradientAngle = '135';
      }
    } else {
      this.gradientStartColor = '#00A459';
      this.gradientEndColor = '#019CDE';
      this.gradientAngle = '90';
    }

    this.originalGradientStartColor = this.gradientStartColor;
    this.originalGradientEndColor = this.gradientEndColor;
    this.originalGradientAngle = this.gradientAngle;

    // Leitura inteligente de Tipografia
    const curFontSize = parseInt(styles.fontSize) || 16;
    this.fontSize = curFontSize.toString();
    this.originalFontSize = this.fontSize;

    const curFontWeight = styles.fontWeight;
    if (curFontWeight === 'normal' || curFontWeight === '400') this.fontWeight = '400';
    else if (curFontWeight === 'bold' || curFontWeight === '700') this.fontWeight = '700';
    else this.fontWeight = curFontWeight || '400';
    this.originalFontWeight = this.fontWeight;

    this.textTransform = styles.textTransform || 'none';
    this.originalTextTransform = this.textTransform;

    const rawLH = styles.lineHeight;
    let curLH = 1.2;
    if (rawLH && rawLH !== 'normal') {
      const parsed = parseFloat(rawLH);
      if (!isNaN(parsed)) {
        curLH = rawLH.includes('px') ? parseFloat((parsed / curFontSize).toFixed(1)) : parsed;
      }
    }
    this.lineHeight = curLH.toString();
    this.originalLineHeight = this.lineHeight;

    const rawLS = styles.letterSpacing;
    const curLS = (rawLS === 'normal') ? 0 : (parseFloat(rawLS) || 0);
    this.letterSpacing = curLS.toString();
    this.originalLetterSpacing = this.letterSpacing;

    this.textAlign = styles.textAlign || 'left';
    this.originalTextAlign = this.textAlign;

    this.fontStyle = styles.fontStyle || 'normal';
    this.originalFontStyle = this.fontStyle;

    this.textDecoration = styles.textDecoration || 'none';
    this.originalTextDecoration = this.textDecoration;

    // Leitura inteligente de Layout & Display
    this.display = styles.display || 'block';
    this.originalDisplay = this.display;

    this.flexDirection = styles.flexDirection.includes('column') ? 'column' : 'row';
    this.originalFlexDirection = this.flexDirection;

    this.flexWrap = styles.flexWrap || 'nowrap';
    this.originalFlexWrap = this.flexWrap;

    this.flexGap = (parseInt(styles.gap) || 0).toString();
    this.originalFlexGap = this.flexGap;

    this.justifyContent = styles.justifyContent || 'flex-start';
    this.originalJustifyContent = this.justifyContent;

    this.alignItems = styles.alignItems || 'stretch';
    this.originalAlignItems = this.alignItems;

    // Leitura inteligente de Margens
    this.marginTop = (parseInt(styles.marginTop) || 0).toString();
    this.originalMarginTop = this.marginTop;
    this.marginRight = (parseInt(styles.marginRight) || 0).toString();
    this.originalMarginRight = this.marginRight;
    this.marginBottom = (parseInt(styles.marginBottom) || 0).toString();
    this.originalMarginBottom = this.marginBottom;
    this.marginLeft = (parseInt(styles.marginLeft) || 0).toString();
    this.originalMarginLeft = this.marginLeft;

    this.margin = (parseInt(styles.margin) || parseInt(this.marginTop) || 0).toString();
    this.originalMargin = this.margin;

    // Leitura inteligente de Paddings
    this.paddingTop = (parseInt(styles.paddingTop) || 0).toString();
    this.originalPaddingTop = this.paddingTop;
    this.paddingRight = (parseInt(styles.paddingRight) || 0).toString();
    this.originalPaddingRight = this.paddingRight;
    this.paddingBottom = (parseInt(styles.paddingBottom) || 0).toString();
    this.originalPaddingBottom = this.paddingBottom;
    this.paddingLeft = (parseInt(styles.paddingLeft) || 0).toString();
    this.originalPaddingLeft = this.paddingLeft;

    this.padding = (parseInt(styles.padding) || parseInt(this.paddingTop) || 0).toString();
    this.originalPadding = this.padding;

    // Leitura inteligente de Largura de Bordas
    this.borderTopWidth = (parseInt(styles.borderTopWidth) || 0).toString();
    this.originalBorderTopWidth = this.borderTopWidth;
    this.borderRightWidth = (parseInt(styles.borderRightWidth) || 0).toString();
    this.originalBorderRightWidth = this.borderRightWidth;
    this.borderBottomWidth = (parseInt(styles.borderBottomWidth) || 0).toString();
    this.originalBorderBottomWidth = this.borderBottomWidth;
    this.borderLeftWidth = (parseInt(styles.borderLeftWidth) || 0).toString();
    this.originalBorderLeftWidth = this.borderLeftWidth;

    this.borderWidth = (parseInt(styles.borderWidth) || parseInt(this.borderTopWidth) || 0).toString();
    this.originalBorderWidth = this.borderWidth;

    // Leitura inteligente de Radius
    this.borderTopLeftRadius = (parseInt(styles.borderTopLeftRadius) || 0).toString();
    this.originalBorderTopLeftRadius = this.borderTopLeftRadius;
    this.borderTopRightRadius = (parseInt(styles.borderTopRightRadius) || 0).toString();
    this.originalBorderTopRightRadius = this.borderTopRightRadius;
    this.borderBottomRightRadius = (parseInt(styles.borderBottomRightRadius) || 0).toString();
    this.originalBorderBottomRightRadius = this.borderBottomRightRadius;
    this.borderBottomLeftRadius = (parseInt(styles.borderBottomLeftRadius) || 0).toString();
    this.originalBorderBottomLeftRadius = this.borderBottomLeftRadius;

    this.borderRadius = (parseInt(styles.borderRadius) || parseInt(this.borderTopLeftRadius) || 0).toString();
    this.originalBorderRadius = this.borderRadius;

    this.borderStyle = styles.borderStyle === 'none' ? 'none' : 'solid';
    this.originalBorderStyle = this.borderStyle;


    // Reseta a seleção de lados ao selecionar um novo elemento
    this.borderSides = { top: true, right: true, bottom: true, left: true, all: true };

    // Define a aba inicial padrão
    this.activeTab = 'colors';

    // Define o campo de cor ativo padrão ao selecionar um elemento
    this.activeColorField = this.useGradientMode ? 'gradientStart' : 'bg';

    // Varre e carrega as cores ativas do sistema no DOM
    this.loadSystemColors();
  }

  // Lê as cores computadas do elemento
  private readElementColors(element: HTMLElement): void {
    let current: HTMLElement | null = element;
    let bgColor = 'rgba(0, 0, 0, 0)';
    let bgImage = 'none';

    // Sobe na árvore do DOM até achar um elemento com fundo não transparente
    while (current) {
      const styles = window.getComputedStyle(current);
      if (styles.backgroundColor && styles.backgroundColor !== 'transparent' && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        bgColor = styles.backgroundColor;
      }
      if (styles.backgroundImage && styles.backgroundImage !== 'none' && styles.backgroundImage.includes('gradient')) {
        bgImage = styles.backgroundImage;
      }

      // Se achou uma cor ou gradiente, ou se chegou no body/html, interrompe
      if (bgColor !== 'rgba(0, 0, 0, 0)' || bgImage !== 'none' || current.tagName === 'BODY' || current.tagName === 'HTML') {
        break;
      }
      current = current.parentElement;
    }

    const elementStyles = window.getComputedStyle(element);

    // Se o elemento contiver gradiente, extrai a primeira cor dele para preencher a cor sólida inicial
    if (bgImage !== 'none' && bgImage.includes('gradient')) {
      const colorMatches = bgImage.match(/rgba?\(?[\d\s,.]+\)?|#[0-9a-fA-F]{3,8}/g);
      if (colorMatches && colorMatches.length > 0) {
        bgColor = colorMatches[0];
      }
    }

    // Leitura inteligente de bordas inativas/transparentes se a geral for transparente
    let borderColor = elementStyles.borderColor;
    if (!borderColor || borderColor === 'transparent' || borderColor === 'rgba(0, 0, 0, 0)' || this.rgbToHex(borderColor) === '#FFFFFF') {
      const borderDirs = [
        { color: elementStyles.borderBottomColor, width: elementStyles.borderBottomWidth },
        { color: elementStyles.borderTopColor, width: elementStyles.borderTopWidth },
        { color: elementStyles.borderLeftColor, width: elementStyles.borderLeftWidth },
        { color: elementStyles.borderRightColor, width: elementStyles.borderRightWidth }
      ];
      const activeBorder = borderDirs.find(b => b.width && b.width !== '0px' && b.color && b.color !== 'transparent' && b.color !== 'rgba(0, 0, 0, 0)');
      if (activeBorder) {
        borderColor = activeBorder.color;
      }
    }

    // Se subiu tudo e o fundo continuou transparente, assume branco
    this.tempBgColor = this.rgbToHex(bgColor === 'rgba(0, 0, 0, 0)' ? 'rgb(255, 255, 255)' : bgColor);
    this.tempTextColor = this.rgbToHex(elementStyles.color);
    this.tempBorderColor = this.rgbToHex(borderColor);

    this.hasGradient = bgImage !== 'none' || elementStyles.backgroundImage.includes('gradient');
  }

  // Converte a string de cor rgb(a) em hexadecimal Hex
  private rgbToHex(rgbStr: string): string {
    if (!rgbStr || rgbStr === 'transparent' || rgbStr === 'rgba(0, 0, 0, 0)') {
      return '#FFFFFF';
    }

    // Trata valores como 'currentColor' ou formatos de cor de borda inválidos
    if (!rgbStr.startsWith('rgb')) {
      return '#FFFFFF';
    }

    const match = rgbStr.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (!match) return '#FFFFFF';

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const a = match[4] ? parseFloat(match[4]) : 1;

    if (a === 0) return '#FFFFFF'; // Se for totalmente transparente

    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Ações de alteração de estilo em tempo real
  public updateBgColor(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.tempBgColor = val;
    if (this.selectedElement) {
      // Se tiver gradiente de fundo, remove inline para que a nova cor sólida apareça!
      this.selectedElement.style.setProperty('background-image', 'none', 'important');
      this.selectedElement.style.setProperty('background-color', val, 'important');
    }
  }

  // Lógica de Gradiente de Fundo
  public updateGradientStart(event: Event): void {
    this.gradientStartColor = (event.target as HTMLInputElement).value;
    this.updateGradient();
  }

  public updateGradientEnd(event: Event): void {
    this.gradientEndColor = (event.target as HTMLInputElement).value;
    this.updateGradient();
  }

  public updateGradient(): void {
    if (!this.selectedElement) return;
    const gradVal = `linear-gradient(${this.gradientAngle}deg, ${this.gradientStartColor}, ${this.gradientEndColor})`;
    this.selectedElement.style.setProperty('background-image', gradVal, 'important');
    this.selectedElement.style.setProperty('background-color', 'transparent', 'important');
    this.hasGradient = true;
  }

  // Atualiza o ângulo do gradiente a partir do slider de alcance
  public onAngleSliderChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.gradientAngle = input.value;
    this.updateGradient();
  }

  // Calcula o ângulo do gradiente a partir de um clique no dial circular (bússola)
  public onAngleDialClick(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;

    // Calcula o ângulo em radianos. Math.atan2(dx, -dy) mapeia 0deg para o Norte (topo)
    // e cresce no sentido horário (Leste = 90deg, Sul = 180deg, Oeste = 270deg)
    const angleRad = Math.atan2(dx, -dy);
    let angleDeg = Math.round(angleRad * (180 / Math.PI));

    // Converte ângulos negativos (de -180 a 0) para a faixa de 180 a 360
    if (angleDeg < 0) {
      angleDeg += 360;
    }

    this.gradientAngle = angleDeg.toString();
    this.updateGradient();
  }

  public toggleGradientMode(): void {
    this.useGradientMode = !this.useGradientMode;
    if (this.useGradientMode) {
      this.updateGradient();
    } else {
      if (this.selectedElement) {
        this.selectedElement.style.setProperty('background-image', 'none', 'important');
        this.selectedElement.style.setProperty('background-color', this.tempBgColor, 'important');
      }
      this.hasGradient = false;
    }
  }

  public updateTextColor(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.tempTextColor = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('color', val, 'important');
    }
  }

  public updateBorderColor(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.tempBorderColor = val;
    if (this.selectedElement) {
      // Aplica apenas nos lados selecionados
      const sides = this.getActiveBorderSides();
      sides.forEach(side => {
        this.selectedElement!.style.setProperty(`border-${side}-color`, val, 'important');
      });
    }
  }


  // Retorna rótulo dos lados de borda ativos para o centro do box-model no template
  public get activeBorderSidesLabel(): string {
    if (this.borderSides.all) return 'Todas';
    const parts: string[] = [];
    if (this.borderSides.top) parts.push('T');
    if (this.borderSides.right) parts.push('R');
    if (this.borderSides.bottom) parts.push('B');
    if (this.borderSides.left) parts.push('L');
    return parts.length > 0 ? parts.join('+') : '-';
  }

  // Retorna a lista de lados ativos para aplicação de estilos
  public getActiveBorderSides(): string[] {
    if (this.borderSides.all) return ['top', 'right', 'bottom', 'left'];
    const sides: string[] = [];
    if (this.borderSides.top) sides.push('top');
    if (this.borderSides.right) sides.push('right');
    if (this.borderSides.bottom) sides.push('bottom');
    if (this.borderSides.left) sides.push('left');
    return sides.length > 0 ? sides : ['top', 'right', 'bottom', 'left'];
  }

  // Alterna um lado individual ou o modo 'Todas'
  public toggleBorderSide(side: 'all' | 'top' | 'right' | 'bottom' | 'left'): void {
    if (side === 'all') {
      this.borderSides = { top: true, right: true, bottom: true, left: true, all: true };
    } else {
      // Ao clicar em lado individual, desativa o modo 'all'
      this.borderSides.all = false;
      this.borderSides[side] = !this.borderSides[side];
      // Se todos os lados individuais estiverem marcados, volta para 'all'
      if (this.borderSides.top && this.borderSides.right && this.borderSides.bottom && this.borderSides.left) {
        this.borderSides.all = true;
      }
    }
  }

  public toggleHasBorder(event: Event): void {
    const hasBorder = (event.target as HTMLInputElement).checked;
    this.borderStyle = hasBorder ? 'solid' : 'none';
    if (this.selectedElement) {
      const sides = this.getActiveBorderSides();
      sides.forEach(side => {
        this.selectedElement!.style.setProperty(`border-${side}-style`, this.borderStyle, 'important');
      });
      // Se ativou a borda e a espessura for 0, define como 1px nos lados ativos
      if (hasBorder && parseFloat(this.borderWidth) === 0) {
        this.borderWidth = '1';
        sides.forEach(side => {
          this.selectedElement!.style.setProperty(`border-${side}-width`, '1px', 'important');
        });
      }
    }
  }


  // Resets Individuais de Estilo
  public resetBgColor(): void {
    if (!this.selectedElement) return;

    if (this.originalHasGradient) {
      this.selectedElement.style.setProperty('background-image', this.originalBgImage, 'important');
      this.selectedElement.style.removeProperty('background-color');
    } else {
      this.selectedElement.style.setProperty('background-color', this.originalBgColor, 'important');
      this.selectedElement.style.removeProperty('background-image');
    }

    this.readElementColors(this.selectedElement);
    this.useGradientMode = this.hasGradient;
  }

  public resetTextColor(): void {
    if (!this.selectedElement) return;
    this.selectedElement.style.removeProperty('color');
    this.readElementColors(this.selectedElement);
  }

  public resetBorderColor(): void {
    if (!this.selectedElement) return;
    this.selectedElement.style.removeProperty('border-color');
    ['top', 'right', 'bottom', 'left'].forEach(side => {
      this.selectedElement!.style.removeProperty(`border-${side}-color`);
    });
    this.readElementColors(this.selectedElement);
  }

  public resetGradientStartColor(): void {
    this.gradientStartColor = this.originalGradientStartColor;
    this.updateGradient();
  }

  public resetGradientEndColor(): void {
    this.gradientEndColor = this.originalGradientEndColor;
    this.updateGradient();
  }

  public resetGradientAngle(): void {
    this.gradientAngle = this.originalGradientAngle;
    this.updateGradient();
  }

  public resetBorderStyle(): void {
    if (!this.selectedElement) return;
    this.selectedElement.style.removeProperty('border-style');
    ['top', 'right', 'bottom', 'left'].forEach(side => {
      this.selectedElement!.style.removeProperty(`border-${side}-style`);
    });
    const styles = window.getComputedStyle(this.selectedElement);
    this.borderStyle = styles.borderStyle === 'none' ? 'none' : 'solid';
  }

  public resetBorderSides(): void {
    if (!this.selectedElement) return;
    this.borderSides = { top: true, right: true, bottom: true, left: true, all: true };
    // Remove estilos inline individuais de lados para que o geral assuma
    ['top', 'right', 'bottom', 'left'].forEach(side => {
      this.selectedElement!.style.removeProperty(`border-${side}-style`);
      this.selectedElement!.style.removeProperty(`border-${side}-width`);
      this.selectedElement!.style.removeProperty(`border-${side}-color`);
    });
    // Reaplica o geral inline
    if (this.borderStyle !== 'none') {
      this.selectedElement.style.setProperty('border-style', this.borderStyle, 'important');
      this.selectedElement.style.setProperty('border-width', `${this.borderWidth}px`, 'important');
      this.selectedElement.style.setProperty('border-color', this.tempBorderColor, 'important');
    }
  }

  public resetBorderWidth(): void {
    if (!this.selectedElement) return;
    ['top', 'right', 'bottom', 'left'].forEach(side => {
      this.selectedElement!.style.removeProperty(`border-${side}-width`);
    });
    this.selectedElement.style.removeProperty('border-width');
    const styles = window.getComputedStyle(this.selectedElement);
    this.borderWidth = (parseInt(styles.borderWidth) || 0).toString();
  }

  public resetTypo(): void {
    if (!this.selectedElement) return;
    this.selectedElement.style.removeProperty('font-size');
    this.selectedElement.style.removeProperty('font-weight');
    this.selectedElement.style.removeProperty('text-transform');
    this.selectedElement.style.removeProperty('line-height');
    this.selectedElement.style.removeProperty('letter-spacing');
    this.selectedElement.style.removeProperty('text-align');
    this.selectedElement.style.removeProperty('font-style');
    this.selectedElement.style.removeProperty('text-decoration');

    // Relê estilos computados
    const styles = window.getComputedStyle(this.selectedElement);
    const curFontSize = parseInt(styles.fontSize) || 16;
    this.fontSize = curFontSize.toString();
    const curFontWeight = styles.fontWeight;
    if (curFontWeight === 'normal' || curFontWeight === '400') this.fontWeight = '400';
    else if (curFontWeight === 'bold' || curFontWeight === '700') this.fontWeight = '700';
    else this.fontWeight = curFontWeight || '400';

    this.textTransform = styles.textTransform || 'none';

    const rawLH = styles.lineHeight;
    let curLH = 1.2;
    if (rawLH && rawLH !== 'normal') {
      const parsed = parseFloat(rawLH);
      if (!isNaN(parsed)) {
        curLH = rawLH.includes('px') ? parseFloat((parsed / curFontSize).toFixed(1)) : parsed;
      }
    }
    this.lineHeight = curLH.toString();

    const rawLS = styles.letterSpacing;
    const curLS = (rawLS === 'normal') ? 0 : (parseFloat(rawLS) || 0);
    this.letterSpacing = curLS.toString();

    this.textAlign = styles.textAlign || 'left';
    this.fontStyle = styles.fontStyle || 'normal';
    this.textDecoration = styles.textDecoration || 'none';
  }

  public resetDisplayLayout(): void {
    if (!this.selectedElement) return;
    this.selectedElement.style.removeProperty('display');
    this.selectedElement.style.removeProperty('flex-direction');
    this.selectedElement.style.removeProperty('flex-wrap');
    this.selectedElement.style.removeProperty('gap');
    this.selectedElement.style.removeProperty('justify-content');
    this.selectedElement.style.removeProperty('align-items');

    // Relê estilos computados
    const styles = window.getComputedStyle(this.selectedElement);
    this.display = styles.display || 'block';
    this.flexDirection = styles.flexDirection.includes('column') ? 'column' : 'row';
    this.flexWrap = styles.flexWrap || 'nowrap';
    this.flexGap = (parseInt(styles.gap) || 0).toString();
    this.justifyContent = styles.justifyContent || 'flex-start';
    this.alignItems = styles.alignItems || 'stretch';
  }

  public resetMargin(): void {
    if (!this.selectedElement) return;
    this.selectedElement.style.removeProperty('margin');
    this.selectedElement.style.removeProperty('margin-top');
    this.selectedElement.style.removeProperty('margin-right');
    this.selectedElement.style.removeProperty('margin-bottom');
    this.selectedElement.style.removeProperty('margin-left');

    const styles = window.getComputedStyle(this.selectedElement);
    this.marginTop = (parseInt(styles.marginTop) || 0).toString();
    this.marginRight = (parseInt(styles.marginRight) || 0).toString();
    this.marginBottom = (parseInt(styles.marginBottom) || 0).toString();
    this.marginLeft = (parseInt(styles.marginLeft) || 0).toString();
    this.margin = (parseInt(styles.margin) || parseInt(this.marginTop) || 0).toString();
  }

  public resetPadding(): void {
    if (!this.selectedElement) return;
    this.selectedElement.style.removeProperty('padding');
    this.selectedElement.style.removeProperty('padding-top');
    this.selectedElement.style.removeProperty('padding-right');
    this.selectedElement.style.removeProperty('padding-bottom');
    this.selectedElement.style.removeProperty('padding-left');

    const styles = window.getComputedStyle(this.selectedElement);
    this.paddingTop = (parseInt(styles.paddingTop) || 0).toString();
    this.paddingRight = (parseInt(styles.paddingRight) || 0).toString();
    this.paddingBottom = (parseInt(styles.paddingBottom) || 0).toString();
    this.paddingLeft = (parseInt(styles.paddingLeft) || 0).toString();
    this.padding = (parseInt(styles.padding) || parseInt(this.paddingTop) || 0).toString();
  }

  public resetBorderLayout(): void {
    if (!this.selectedElement) return;
    this.selectedElement.style.removeProperty('border-style');
    this.selectedElement.style.removeProperty('border-color');
    this.selectedElement.style.removeProperty('border-width');
    this.selectedElement.style.removeProperty('border-top-width');
    this.selectedElement.style.removeProperty('border-right-width');
    this.selectedElement.style.removeProperty('border-bottom-width');
    this.selectedElement.style.removeProperty('border-left-width');
    this.selectedElement.style.removeProperty('border-radius');
    this.selectedElement.style.removeProperty('border-top-left-radius');
    this.selectedElement.style.removeProperty('border-top-right-radius');
    this.selectedElement.style.removeProperty('border-bottom-right-radius');
    this.selectedElement.style.removeProperty('border-bottom-left-radius');

    // Remove propriedades de borda para todos os lados que podem ter sido definidas antes
    ['top', 'right', 'bottom', 'left'].forEach(side => {
      this.selectedElement!.style.removeProperty(`border-${side}-style`);
      this.selectedElement!.style.removeProperty(`border-${side}-width`);
      this.selectedElement!.style.removeProperty(`border-${side}-color`);
    });

    const styles = window.getComputedStyle(this.selectedElement);
    this.borderStyle = styles.borderStyle && styles.borderStyle !== 'none' ? styles.borderStyle.split(' ')[0] : 'none';
    this.tempBorderColor = this.rgbToHex(styles.borderColor || styles.borderTopColor);
    this.borderTopWidth = (parseInt(styles.borderTopWidth) || 0).toString();
    this.borderRightWidth = (parseInt(styles.borderRightWidth) || 0).toString();
    this.borderBottomWidth = (parseInt(styles.borderBottomWidth) || 0).toString();
    this.borderLeftWidth = (parseInt(styles.borderLeftWidth) || 0).toString();
    this.borderWidth = (parseInt(styles.borderWidth) || parseInt(this.borderTopWidth) || 0).toString();

    this.borderTopLeftRadius = (parseInt(styles.borderTopLeftRadius) || 0).toString();
    this.borderTopRightRadius = (parseInt(styles.borderTopRightRadius) || 0).toString();
    this.borderBottomRightRadius = (parseInt(styles.borderBottomRightRadius) || 0).toString();
    this.borderBottomLeftRadius = (parseInt(styles.borderBottomLeftRadius) || 0).toString();
    this.borderRadius = (parseInt(styles.borderRadius) || parseInt(this.borderTopLeftRadius) || 0).toString();

    this.borderSides = { top: true, right: true, bottom: true, left: true, all: true };
  }

  // Atualizações de Tipografia
  public updateFontSize(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.fontSize = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('font-size', `${val}px`, 'important');
    }
  }

  public updateFontWeight(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.fontWeight = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('font-weight', val, 'important');
    }
  }

  public updateTextTransform(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.textTransform = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('text-transform', val, 'important');
    }
  }

  public updateLineHeight(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.lineHeight = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('line-height', val, 'important');
    }
  }

  public updateLetterSpacing(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.letterSpacing = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('letter-spacing', `${val}px`, 'important');
    }
  }

  public setTextAlign(align: string): void {
    this.textAlign = align;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('text-align', align, 'important');
    }
  }

  public toggleStyleBold(): void {
    if (!this.selectedElement) return;
    const isBold = this.fontStyleBoldActive;
    if (isBold) {
      this.fontWeight = '400';
      this.selectedElement.style.setProperty('font-weight', 'normal', 'important');
    } else {
      this.fontWeight = '700';
      this.selectedElement.style.setProperty('font-weight', 'bold', 'important');
    }
  }

  public get fontStyleBoldActive(): boolean {
    if (!this.selectedElement) return false;
    const fw = this.fontWeight;
    return fw === 'bold' || fw === '700' || fw === '800' || fw === '900';
  }

  public toggleStyleItalic(): void {
    if (!this.selectedElement) return;
    const isItalic = this.fontStyle.includes('italic');
    if (isItalic) {
      this.fontStyle = 'normal';
      this.selectedElement.style.setProperty('font-style', 'normal', 'important');
    } else {
      this.fontStyle = 'italic';
      this.selectedElement.style.setProperty('font-style', 'italic', 'important');
    }
  }

  public toggleStyleUnderline(): void {
    if (!this.selectedElement) return;
    const isUnder = this.textDecoration.includes('underline');
    if (isUnder) {
      this.textDecoration = 'none';
      this.selectedElement.style.setProperty('text-decoration', 'none', 'important');
    } else {
      this.textDecoration = 'underline';
      this.selectedElement.style.setProperty('text-decoration', 'underline', 'important');
    }
  }

  // Atualizações de Layout & Display
  public updateDisplay(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.display = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('display', val, 'important');
      if (val === 'flex') {
        this.selectedElement.style.setProperty('flex-direction', this.flexDirection, 'important');
        this.selectedElement.style.setProperty('flex-wrap', this.flexWrap, 'important');
        this.selectedElement.style.setProperty('gap', `${this.flexGap}px`, 'important');
        this.selectedElement.style.setProperty('justify-content', this.justifyContent, 'important');
        this.selectedElement.style.setProperty('align-items', this.alignItems, 'important');
      }
    }
  }

  public setFlexDirection(dir: string): void {
    this.flexDirection = dir;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('flex-direction', dir, 'important');
    }
  }

  public updateFlexWrap(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.flexWrap = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('flex-wrap', val, 'important');
    }
  }

  public updateFlexGap(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.flexGap = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('gap', `${val}px`, 'important');
    }
  }

  public updateFlexJustify(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.justifyContent = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('justify-content', val, 'important');
    }
  }

  public updateFlexAlign(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.alignItems = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('align-items', val, 'important');
    }
  }

  // Margem Geral / Lados
  public updateMarginSide(side: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (side === 'top') this.marginTop = val;
    else if (side === 'right') this.marginRight = val;
    else if (side === 'bottom') this.marginBottom = val;
    else if (side === 'left') this.marginLeft = val;

    if (this.selectedElement) {
      this.selectedElement.style.setProperty(`margin-${side}`, `${val}px`, 'important');
    }
  }

  // Padding Geral / Lados
  public updatePaddingSide(side: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (side === 'top') this.paddingTop = val;
    else if (side === 'right') this.paddingRight = val;
    else if (side === 'bottom') this.paddingBottom = val;
    else if (side === 'left') this.paddingLeft = val;

    if (this.selectedElement) {
      this.selectedElement.style.setProperty(`padding-${side}`, `${val}px`, 'important');
    }
  }

  // Border Width Lados
  public updateBorderSideWidth(side: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (side === 'top') this.borderTopWidth = val;
    else if (side === 'right') this.borderRightWidth = val;
    else if (side === 'bottom') this.borderBottomWidth = val;
    else if (side === 'left') this.borderLeftWidth = val;

    if (this.selectedElement) {
      this.selectedElement.style.setProperty(`border-${side}-width`, `${val}px`, 'important');
    }
  }

  // Radius Geral / Cantos
  public updateRadius(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.borderRadius = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('border-radius', `${val}px`, 'important');
      this.borderTopLeftRadius = this.borderTopRightRadius = this.borderBottomRightRadius = this.borderBottomLeftRadius = val;
    }
  }

  public updateRadiusSide(corner: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    let prop = '';
    if (corner === 'tl') { this.borderTopLeftRadius = val; prop = 'border-top-left-radius'; }
    else if (corner === 'tr') { this.borderTopRightRadius = val; prop = 'border-top-right-radius'; }
    else if (corner === 'br') { this.borderBottomRightRadius = val; prop = 'border-bottom-right-radius'; }
    else if (corner === 'bl') { this.borderBottomLeftRadius = val; prop = 'border-bottom-left-radius'; }

    if (this.selectedElement && prop) {
      this.selectedElement.style.setProperty(prop, `${val}px`, 'important');
    }
  }

  public updateMargin(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.margin = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('margin', `${val}px`, 'important');
      this.marginTop = this.marginRight = this.marginBottom = this.marginLeft = val;
    }
  }

  public updatePadding(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.padding = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('padding', `${val}px`, 'important');
      this.paddingTop = this.paddingRight = this.paddingBottom = this.paddingLeft = val;
    }
  }

  public updateBorderWidth(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.borderWidth = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('border-width', `${val}px`, 'important');
      this.borderTopWidth = this.borderRightWidth = this.borderBottomWidth = this.borderLeftWidth = val;
    }
  }

  public updateBorderStyleSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.borderStyle = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('border-style', val, 'important');
      // Garante que a largura de borda seja pelo menos 1 se for diferente de none
      if (val !== 'none' && parseFloat(this.borderWidth) === 0) {
        this.borderWidth = '1';
        this.selectedElement.style.setProperty('border-width', '1px', 'important');
        this.borderTopWidth = this.borderRightWidth = this.borderBottomWidth = this.borderLeftWidth = '1';
      }
    }
  }

  // Reset Geral
  public resetStyles(): void {
    if (this.selectedElement) {
      // Cores & Fundo
      this.selectedElement.style.removeProperty('background-image');
      this.selectedElement.style.removeProperty('background-color');
      this.selectedElement.style.removeProperty('color');

      // Tipografia
      this.selectedElement.style.removeProperty('font-size');
      this.selectedElement.style.removeProperty('font-weight');
      this.selectedElement.style.removeProperty('text-transform');
      this.selectedElement.style.removeProperty('line-height');
      this.selectedElement.style.removeProperty('letter-spacing');
      this.selectedElement.style.removeProperty('text-align');
      this.selectedElement.style.removeProperty('font-style');
      this.selectedElement.style.removeProperty('text-decoration');

      // Layout & Display
      this.selectedElement.style.removeProperty('display');
      this.selectedElement.style.removeProperty('flex-direction');
      this.selectedElement.style.removeProperty('flex-wrap');
      this.selectedElement.style.removeProperty('gap');
      this.selectedElement.style.removeProperty('justify-content');
      this.selectedElement.style.removeProperty('align-items');

      // Margem
      this.selectedElement.style.removeProperty('margin');
      this.selectedElement.style.removeProperty('margin-top');
      this.selectedElement.style.removeProperty('margin-right');
      this.selectedElement.style.removeProperty('margin-bottom');
      this.selectedElement.style.removeProperty('margin-left');

      // Padding
      this.selectedElement.style.removeProperty('padding');
      this.selectedElement.style.removeProperty('padding-top');
      this.selectedElement.style.removeProperty('padding-right');
      this.selectedElement.style.removeProperty('padding-bottom');
      this.selectedElement.style.removeProperty('padding-left');

      // Borda e Radius
      this.selectedElement.style.removeProperty('border-style');
      this.selectedElement.style.removeProperty('border-color');
      this.selectedElement.style.removeProperty('border-width');
      this.selectedElement.style.removeProperty('border-top-width');
      this.selectedElement.style.removeProperty('border-right-width');
      this.selectedElement.style.removeProperty('border-bottom-width');
      this.selectedElement.style.removeProperty('border-left-width');
      this.selectedElement.style.removeProperty('border-radius');
      this.selectedElement.style.removeProperty('border-top-left-radius');
      this.selectedElement.style.removeProperty('border-top-right-radius');
      this.selectedElement.style.removeProperty('border-bottom-right-radius');
      this.selectedElement.style.removeProperty('border-bottom-left-radius');

      ['top', 'right', 'bottom', 'left'].forEach(side => {
        this.selectedElement!.style.removeProperty(`border-${side}-style`);
        this.selectedElement!.style.removeProperty(`border-${side}-width`);
        this.selectedElement!.style.removeProperty(`border-${side}-color`);
      });

      this.selectElement(this.selectedElement);
    }
  }

  public setActiveField(field: string): void {
    this.activeColorField = field;
  }

  public getActiveFieldName(): string {
    switch (this.activeColorField) {
      case 'bg': return 'Fundo Sólido';
      case 'gradientStart': return 'Cor Inic. Gradiente';
      case 'gradientEnd': return 'Cor Final Gradiente';
      case 'text': return 'Texto';
      case 'border': return 'Borda';
      default: return 'Fundo Sólido';
    }
  }

  public applyPaletteColor(color: string): void {
    if (!this.selectedElement) return;

    const hex = color.toUpperCase();

    switch (this.activeColorField) {
      case 'bg':
        this.tempBgColor = hex;
        this.selectedElement.style.setProperty('background-image', 'none', 'important');
        this.selectedElement.style.setProperty('background-color', hex, 'important');
        break;
      case 'gradientStart':
        this.gradientStartColor = hex;
        this.updateGradient();
        break;
      case 'gradientEnd':
        this.gradientEndColor = hex;
        this.updateGradient();
        break;
      case 'text':
        this.tempTextColor = hex;
        this.selectedElement.style.setProperty('color', hex, 'important');
        break;
      case 'border':
        this.tempBorderColor = hex;
        this.selectedElement.style.setProperty('border-color', hex, 'important');
        break;
    }
  }

  public loadSystemColors(): void {
    const colorsSet = new Set<string>();

    // Cores padrão
    const themesPalette = [
      '#00A459', '#008B4B', '#006B3A', // Verde
      '#019CDE', '#0184BD', '#017DA4', // Azul
      '#C64135', '#B03429', '#91271E', // Vermelho
      '#393931', '#262621', '#1A1A16', // Carvão
      '#FEEF10'                         // Destaque Amarelo
    ];
    themesPalette.forEach(c => colorsSet.add(c.toUpperCase()));

    // Varre o DOM para capturar cores atualmente visíveis na página
    try {
      const allElements = document.querySelectorAll('*');
      let inspectedCount = 0;
      for (let i = 0; i < allElements.length && inspectedCount < 400; i++) {
        const el = allElements[i] as HTMLElement;
        if (!el || el.closest('app-visual-inspector')) continue;

        const styles = window.getComputedStyle(el);

        if (styles.backgroundColor && styles.backgroundColor !== 'transparent' && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const hex = this.rgbToHex(styles.backgroundColor);
          if (hex && hex !== '#FFFFFF' && hex !== '#000000') {
            colorsSet.add(hex.toUpperCase());
          }
        }

        if (styles.color && styles.color !== 'transparent' && styles.color !== 'rgba(0, 0, 0, 0)') {
          const hex = this.rgbToHex(styles.color);
          if (hex && hex !== '#FFFFFF' && hex !== '#000000') {
            colorsSet.add(hex.toUpperCase());
          }
        }

        if (styles.borderColor && styles.borderColor !== 'transparent' && styles.borderColor !== 'rgba(0, 0, 0, 0)') {
          const hex = this.rgbToHex(styles.borderColor);
          if (hex && hex !== '#FFFFFF' && hex !== '#000000') {
            colorsSet.add(hex.toUpperCase());
          }
        }
        inspectedCount++;
      }
    } catch (e) {
      console.warn('Erro ao escanear cores:', e);
    }

    this.systemColors = Array.from(colorsSet).slice(0, 24);
  }

  public closeInspector(): void {
    this.disableInspectMode();
    this.isOpen = false;
    this.onClose.emit();
  }

  /**
   * Verifica se o elemento atualmente selecionado possui um elemento pai elegível
   * para seleção (evitando selecionar a tag HTML ou o próprio painel do inspetor).
   */
  public get hasEligibleParent(): boolean {
    if (!this.selectedElement) return false;
    const parent = this.selectedElement.parentElement;
    if (!parent) return false;
    return parent.tagName !== 'HTML' && !this.isInsidePanel(parent);
  }

  /**
   * Retorna o nome da tag do elemento pai elegível para exibição amigável na interface.
   */
  public get parentTagName(): string {
    if (this.selectedElement && this.selectedElement.parentElement) {
      return this.selectedElement.parentElement.tagName;
    }
    return '';
  }

  /**
   * Seleciona o elemento pai do elemento atualmente selecionado no inspetor,
   * atualizando todo o contexto e interface de estilização.
   */
  public selectParentElement(): void {
    if (this.selectedElement && this.selectedElement.parentElement) {
      const parent = this.selectedElement.parentElement;
      if (parent.tagName !== 'HTML' && !this.isInsidePanel(parent)) {
        this.selectionHistory.push(this.selectedElement);
        this.selectElement(parent, true);
      }
    }
  }

  /**
   * Verifica se há algum elemento filho no histórico para retornar a seleção.
   */
  public get hasEligibleChild(): boolean {
    return this.selectionHistory.length > 0;
  }

  /**
   * Retorna o nome da tag do último elemento filho no histórico de navegação.
   */
  public get childTagName(): string {
    if (this.selectionHistory.length > 0) {
      return this.selectionHistory[this.selectionHistory.length - 1].tagName;
    }
    return '';
  }

  /**
   * Navega de volta na hierarquia selecionando o último elemento filho da pilha de histórico.
   */
  public selectChildElement(): void {
    if (this.selectionHistory.length > 0) {
      const child = this.selectionHistory.pop();
      if (child) {
        this.selectElement(child, true);
      }
    }
  }

  // Envia as alterações via HTTP POST para o servidor ponte local (server.js)
  public applyChangesToSource(): void {
    if (!this.selectedElement) return;

    this.isApplying = true;

    // Coleta as alterações feitas no elemento (propriedades inline modificadas)
    const modifiedStyles: { [key: string]: string } = {};
    const inlineStyleLength = this.selectedElement.style.length;
    for (let i = 0; i < inlineStyleLength; i++) {
      const styleName = this.selectedElement.style[i];
      const styleValue = this.selectedElement.style.getPropertyValue(styleName);
      modifiedStyles[styleName] = styleValue;
    }

    // Estrutura o payload de envio para a ponte local
    const elementData = {
      tagName: this.tagName,
      classList: this.classList,
      originalClasses: this.classList.split(' ').filter(c => c.trim().length > 0),
      modifiedStyles: modifiedStyles,
      outerHTML: this.selectedElement.outerHTML.substring(0, 1000), // Limita tamanho da string
      selector: this.getUniqueSelector(this.selectedElement)
    };

    console.log('[Visual Inspector] Enviando alterações para a ponte local:', elementData);

    fetch('http://localhost:4300/api/changes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(elementData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao salvar modificações no servidor ponte local.');
        }
        return response.json();
      })
      .then(data => {
        console.log('[Visual Inspector] Resposta da ponte:', data);
        alert('Alterações enviadas para a IDE Antigravity com sucesso!\nAgora peça no chat: "Aplique as alterações do Inspetor".');
      })
      .catch(err => {
        console.error('[Visual Inspector] Erro de rede ou na ponte local:', err);
        alert('Não foi possível conectar ao servidor ponte local na porta 4300!\nCertifique-se de iniciar o servidor executando "node server.js" no diretório do inspetor.');
      })
      .finally(() => {
        this.isApplying = false;
      });
  }

  // Cria um seletor CSS básico baseado no id ou classes do elemento para ajudar na identificação
  private getUniqueSelector(el: HTMLElement): string {
    if (el.id) {
      return `#${el.id}`;
    }

    if (el.className) {
      const classes = el.className.split(/\s+/)
        .filter(c => c.trim().length > 0 && !c.includes(':') && !c.startsWith('vi-') && !c.startsWith('ng-'));
      if (classes.length > 0) {
        return `${el.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }

    return el.tagName.toLowerCase();
  }
}
