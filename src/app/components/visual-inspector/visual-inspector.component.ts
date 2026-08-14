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

import { DomInspectorService } from '../../services/dom-inspector.service';
import { StyleUtilsService } from '../../services/style-utils.service';
import { InspectorBridgeService } from '../../services/inspector-bridge.service';
import { BorderSides, InspectorBridgePayload, InspectorTab, SpacingMode } from '../../models/inspector.model';

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
  // Injeção de dependências via inject() do Angular
  private readonly elementRef = inject(ElementRef);
  private readonly domInspector = inject(DomInspectorService);
  private readonly styleUtils = inject(StyleUtilsService);
  private readonly inspectorBridge = inject(InspectorBridgeService);

  @Input() public isOpen = false;
  @Output() public onClose = new EventEmitter<void>();

  // Coordenadas e dimensões da janela flutuante
  public x = window.innerWidth - 540;
  public y = 80;
  public width = 520;
  public height = 450;

  // Estado de sincronização com a ponte
  public isApplying = false;

  // Controle de Arraste da Janela
  private isDragging = false;
  private startDragX = 0;
  private startDragY = 0;
  private panelStartX = 0;
  private panelStartY = 0;

  // Controle de Redimensionamento da Janela
  private isResizing = false;
  private startResizeX = 0;
  private startResizeY = 0;
  private panelStartWidth = 0;
  private panelStartHeight = 0;

  // Estado de Inspeção e Elemento Selecionado
  public inspectMode = false;
  public selectedElement: HTMLElement | null = null;
  public tagName = '';
  public classList = '';
  public hasGradient = false;

  // Pilha de histórico para navegação na hierarquia DOM
  public selectionHistory: HTMLElement[] = [];

  // Cores temporárias aplicadas no elemento
  public tempBgColor = '#FFFFFF';
  public tempTextColor = '#000000';
  public tempBorderColor = '#CCCCCC';

  // Backups para reset individual de cores
  private originalBgColor = '#FFFFFF';
  private originalTextColor = '#000000';
  private originalBorderColor = '#CCCCCC';
  private originalBgImage = 'none';
  private originalHasGradient = false;

  // Estado do Modo Gradiente
  public useGradientMode = false;
  public gradientStartColor = '#00A459';
  public gradientEndColor = '#019CDE';
  public gradientAngle = '90';

  // Backups de gradiente
  private originalGradientStartColor = '#00A459';
  private originalGradientEndColor = '#019CDE';
  private originalGradientAngle = '90';

  // Campo ativo na paleta e lista de cores detectadas no DOM
  public activeColorField = 'bg';
  public systemColors: string[] = [];

  // Controle de Abas ('colors' | 'layout')
  public activeTab: InspectorTab = 'colors';

  // Variáveis de Estilo de Layout e Borda
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

  // Layout & Display Flexbox
  public display = 'block';
  public flexDirection = 'row';
  public flexWrap = 'nowrap';
  public flexGap = '0';
  public justifyContent = 'flex-start';
  public alignItems = 'stretch';

  // Margens por lado
  public marginMode: SpacingMode = 'all';
  public marginTop = '0';
  public marginRight = '0';
  public marginBottom = '0';
  public marginLeft = '0';

  // Padding por lado
  public paddingMode: SpacingMode = 'all';
  public paddingTop = '0';
  public paddingRight = '0';
  public paddingBottom = '0';
  public paddingLeft = '0';

  // Bordas por lado
  public borderWidthMode: SpacingMode = 'all';
  public borderTopWidth = '0';
  public borderRightWidth = '0';
  public borderBottomWidth = '0';
  public borderLeftWidth = '0';

  // Radius por canto
  public radiusMode: SpacingMode = 'all';
  public borderRadius = '0';
  public borderTopLeftRadius = '0';
  public borderTopRightRadius = '0';
  public borderBottomRightRadius = '0';
  public borderBottomLeftRadius = '0';

  // Lados da borda selecionados
  public borderSides: BorderSides = {
    top: true, right: true, bottom: true, left: true, all: true
  };

  // Backups para resetação de layout
  private originalMargin = '0';
  private originalPadding = '0';
  private originalBorderStyle = 'solid';
  private originalBorderWidth = '1';

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

  static readonly icons = {
    Palette, X, Target, Info, RotateCcw, Check, Loader, ChevronUp, ChevronDown
  };

  ngOnDestroy(): void {
    this.domInspector.removeHoverOverlay();
  }

  // Eventos de Arrasto do Cabeçalho
  public onMouseDownHeader(event: MouseEvent): void {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;

    this.isDragging = true;
    this.startDragX = event.clientX;
    this.startDragY = event.clientY;
    this.panelStartX = this.x;
    this.panelStartY = this.y;
    event.preventDefault();
  }

  // Eventos de Redimensionamento
  public onMouseDownResize(event: MouseEvent): void {
    if (event.button !== 0) return;
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
    if (this.isDragging) {
      const dx = event.clientX - this.startDragX;
      const dy = event.clientY - this.startDragY;
      const maxX = window.innerWidth - this.width;
      const maxY = window.innerHeight - 80;

      this.x = Math.max(10, Math.min(this.panelStartX + dx, maxX));
      this.y = Math.max(10, Math.min(this.panelStartY + dy, maxY));
    }

    if (this.isResizing) {
      const dx = event.clientX - this.startResizeX;
      const dy = event.clientY - this.startResizeY;

      this.width = Math.max(280, Math.min(this.panelStartWidth + dx, window.innerWidth - this.x - 20));
      this.height = Math.max(220, Math.min(this.panelStartHeight + dy, window.innerHeight - this.y - 20));
    }

    if (this.inspectMode) {
      this.handleInspectMove(event);
    }
  }

  @HostListener('document:mouseup')
  public onMouseUp(): void {
    this.isDragging = false;
    this.isResizing = false;
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (this.inspectMode) {
      const target = event.target as HTMLElement;

      if (this.domInspector.isInsidePanel(target, this.elementRef.nativeElement)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      this.selectElement(target);
      this.disableInspectMode();
    }
  }

  public toggleInspectMode(): void {
    this.inspectMode = !this.inspectMode;
    if (this.inspectMode) {
      this.domInspector.createHoverOverlay();
    } else {
      this.disableInspectMode();
    }
  }

  private disableInspectMode(): void {
    this.inspectMode = false;
    this.domInspector.removeHoverOverlay();
  }

  private handleInspectMove(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target || this.domInspector.isInsidePanel(target, this.elementRef.nativeElement)) {
      this.domInspector.hideHoverOverlay();
      return;
    }

    this.domInspector.updateHoverOverlayPosition(target);
  }

  // Seleção e inicialização dos dados do elemento alvo
  public selectElement(target: HTMLElement, keepHistory = false): void {
    if (!keepHistory) {
      this.selectionHistory = [];
    }
    this.selectedElement = target;
    this.tagName = target.tagName;
    this.classList = target.className;

    const styles = window.getComputedStyle(target);
    this.originalBgColor = this.styleUtils.rgbToHex(styles.backgroundColor);
    this.originalTextColor = this.styleUtils.rgbToHex(styles.color);

    let originalBorder = styles.borderColor;
    if (!originalBorder || originalBorder === 'transparent' || originalBorder === 'rgba(0, 0, 0, 0)' || this.styleUtils.rgbToHex(originalBorder) === '#FFFFFF') {
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
    this.originalBorderColor = this.styleUtils.rgbToHex(originalBorder);
    this.originalBgImage = styles.backgroundImage;
    this.originalHasGradient = styles.backgroundImage.includes('gradient') || styles.background.includes('gradient');

    this.readElementColors(target);

    this.useGradientMode = this.hasGradient;
    if (this.hasGradient && this.originalBgImage !== 'none') {
      const parsedGrad = this.styleUtils.parseLinearGradient(this.originalBgImage);
      this.gradientStartColor = parsedGrad.startColor;
      this.gradientEndColor = parsedGrad.endColor;
      this.gradientAngle = parsedGrad.angle;
    } else {
      this.gradientStartColor = '#00A459';
      this.gradientEndColor = '#019CDE';
      this.gradientAngle = '90';
    }

    this.originalGradientStartColor = this.gradientStartColor;
    this.originalGradientEndColor = this.gradientEndColor;
    this.originalGradientAngle = this.gradientAngle;

    // Tipografia
    const curFontSize = this.styleUtils.parsePxValue(styles.fontSize, 16);
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

    // Display & Flexbox
    this.display = styles.display || 'block';
    this.originalDisplay = this.display;

    this.flexDirection = styles.flexDirection.includes('column') ? 'column' : 'row';
    this.originalFlexDirection = this.flexDirection;

    this.flexWrap = styles.flexWrap || 'nowrap';
    this.originalFlexWrap = this.flexWrap;

    this.flexGap = this.styleUtils.parsePxValue(styles.gap, 0).toString();
    this.originalFlexGap = this.flexGap;

    this.justifyContent = styles.justifyContent || 'flex-start';
    this.originalJustifyContent = this.justifyContent;

    this.alignItems = styles.alignItems || 'stretch';
    this.originalAlignItems = this.alignItems;

    // Margens
    this.marginTop = this.styleUtils.parsePxValue(styles.marginTop, 0).toString();
    this.originalMarginTop = this.marginTop;
    this.marginRight = this.styleUtils.parsePxValue(styles.marginRight, 0).toString();
    this.originalMarginRight = this.marginRight;
    this.marginBottom = this.styleUtils.parsePxValue(styles.marginBottom, 0).toString();
    this.originalMarginBottom = this.marginBottom;
    this.marginLeft = this.styleUtils.parsePxValue(styles.marginLeft, 0).toString();
    this.originalMarginLeft = this.marginLeft;

    this.margin = (this.styleUtils.parsePxValue(styles.margin, 0) || this.styleUtils.parsePxValue(this.marginTop, 0)).toString();
    this.originalMargin = this.margin;

    // Paddings
    this.paddingTop = this.styleUtils.parsePxValue(styles.paddingTop, 0).toString();
    this.originalPaddingTop = this.paddingTop;
    this.paddingRight = this.styleUtils.parsePxValue(styles.paddingRight, 0).toString();
    this.originalPaddingRight = this.paddingRight;
    this.paddingBottom = this.styleUtils.parsePxValue(styles.paddingBottom, 0).toString();
    this.originalPaddingBottom = this.paddingBottom;
    this.paddingLeft = this.styleUtils.parsePxValue(styles.paddingLeft, 0).toString();
    this.originalPaddingLeft = this.paddingLeft;

    this.padding = (this.styleUtils.parsePxValue(styles.padding, 0) || this.styleUtils.parsePxValue(this.paddingTop, 0)).toString();
    this.originalPadding = this.padding;

    // Bordas e Radius
    this.borderTopWidth = this.styleUtils.parsePxValue(styles.borderTopWidth, 0).toString();
    this.originalBorderTopWidth = this.borderTopWidth;
    this.borderRightWidth = this.styleUtils.parsePxValue(styles.borderRightWidth, 0).toString();
    this.originalBorderRightWidth = this.borderRightWidth;
    this.borderBottomWidth = this.styleUtils.parsePxValue(styles.borderBottomWidth, 0).toString();
    this.originalBorderBottomWidth = this.borderBottomWidth;
    this.borderLeftWidth = this.styleUtils.parsePxValue(styles.borderLeftWidth, 0).toString();
    this.originalBorderLeftWidth = this.borderLeftWidth;

    this.borderWidth = (this.styleUtils.parsePxValue(styles.borderWidth, 0) || this.styleUtils.parsePxValue(this.borderTopWidth, 0)).toString();
    this.originalBorderWidth = this.borderWidth;

    this.borderTopLeftRadius = this.styleUtils.parsePxValue(styles.borderTopLeftRadius, 0).toString();
    this.originalBorderTopLeftRadius = this.borderTopLeftRadius;
    this.borderTopRightRadius = this.styleUtils.parsePxValue(styles.borderTopRightRadius, 0).toString();
    this.originalBorderTopRightRadius = this.borderTopRightRadius;
    this.borderBottomRightRadius = this.styleUtils.parsePxValue(styles.borderBottomRightRadius, 0).toString();
    this.originalBorderBottomRightRadius = this.borderBottomRightRadius;
    this.borderBottomLeftRadius = this.styleUtils.parsePxValue(styles.borderBottomLeftRadius, 0).toString();
    this.originalBorderBottomLeftRadius = this.borderBottomLeftRadius;

    this.borderRadius = (this.styleUtils.parsePxValue(styles.borderRadius, 0) || this.styleUtils.parsePxValue(this.borderTopLeftRadius, 0)).toString();
    this.originalBorderRadius = this.borderRadius;

    this.borderStyle = styles.borderStyle === 'none' ? 'none' : 'solid';
    this.originalBorderStyle = this.borderStyle;

    this.borderSides = { top: true, right: true, bottom: true, left: true, all: true };
    this.activeTab = 'colors';
    this.activeColorField = this.useGradientMode ? 'gradientStart' : 'bg';

    this.loadSystemColors();
  }

  private readElementColors(element: HTMLElement): void {
    let current: HTMLElement | null = element;
    let bgColor = 'rgba(0, 0, 0, 0)';
    let bgImage = 'none';

    while (current) {
      const styles = window.getComputedStyle(current);
      if (styles.backgroundColor && styles.backgroundColor !== 'transparent' && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        bgColor = styles.backgroundColor;
      }
      if (styles.backgroundImage && styles.backgroundImage !== 'none' && styles.backgroundImage.includes('gradient')) {
        bgImage = styles.backgroundImage;
      }

      if (bgColor !== 'rgba(0, 0, 0, 0)' || bgImage !== 'none' || current.tagName === 'BODY' || current.tagName === 'HTML') {
        break;
      }
      current = current.parentElement;
    }

    const elementStyles = window.getComputedStyle(element);

    if (bgImage !== 'none' && bgImage.includes('gradient')) {
      const colorMatches = bgImage.match(/rgba?\(?[\d\s,.]+\)?|#[0-9a-fA-F]{3,8}/g);
      if (colorMatches && colorMatches.length > 0) {
        bgColor = colorMatches[0];
      }
    }

    let borderColor = elementStyles.borderColor;
    if (!borderColor || borderColor === 'transparent' || borderColor === 'rgba(0, 0, 0, 0)' || this.styleUtils.rgbToHex(borderColor) === '#FFFFFF') {
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

    this.tempBgColor = this.styleUtils.rgbToHex(bgColor === 'rgba(0, 0, 0, 0)' ? 'rgb(255, 255, 255)' : bgColor);
    this.tempTextColor = this.styleUtils.rgbToHex(elementStyles.color);
    this.tempBorderColor = this.styleUtils.rgbToHex(borderColor);
    this.hasGradient = bgImage !== 'none' || elementStyles.backgroundImage.includes('gradient');
  }

  // Atualização das Cores em Tempo Real
  public updateBgColor(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.tempBgColor = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('background-image', 'none', 'important');
      this.selectedElement.style.setProperty('background-color', val, 'important');
    }
  }

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

  public onAngleSliderChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.gradientAngle = input.value;
    this.updateGradient();
  }

  public onAngleDialClick(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angleDeg = this.styleUtils.calculateAngleFromCoordinates(centerX, centerY, event.clientX, event.clientY);

    this.gradientAngle = angleDeg.toString();
    this.updateGradient();
  }

  public toggleGradientMode(): void {
    this.useGradientMode = !this.useGradientMode;
    if (this.useGradientMode) {
      this.activeColorField = 'gradientStart';
      this.updateGradient();
    } else {
      this.activeColorField = 'bg';
      if (this.selectedElement) {
        this.selectedElement.style.setProperty('background-image', 'none', 'important');
        this.selectedElement.style.setProperty('background-color', this.tempBgColor, 'important');
      }
    }
  }

  public resetBgColor(): void {
    if (!this.selectedElement) return;

    if (this.originalHasGradient && this.originalBgImage !== 'none') {
      this.selectedElement.style.setProperty('background-image', this.originalBgImage, 'important');
      this.selectedElement.style.removeProperty('background-color');
      this.hasGradient = true;
      this.useGradientMode = true;
      this.gradientStartColor = this.originalGradientStartColor;
      this.gradientEndColor = this.originalGradientEndColor;
      this.gradientAngle = this.originalGradientAngle;
    } else {
      this.tempBgColor = this.originalBgColor;
      this.selectedElement.style.setProperty('background-color', this.tempBgColor, 'important');
      this.selectedElement.style.setProperty('background-image', 'none', 'important');
      this.hasGradient = false;
      this.useGradientMode = false;
    }
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

  public updateTextColor(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.tempTextColor = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('color', val, 'important');
    }
  }

  public resetTextColor(): void {
    if (!this.selectedElement) return;
    this.tempTextColor = this.originalTextColor;
    this.selectedElement.style.setProperty('color', this.tempTextColor, 'important');
  }

  public updateBorderColor(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.tempBorderColor = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('border-color', val, 'important');
    }
  }

  public resetBorderColor(): void {
    if (!this.selectedElement) return;
    this.tempBorderColor = this.originalBorderColor;
    this.selectedElement.style.setProperty('border-color', this.tempBorderColor, 'important');
  }

  // Manipulação de Propriedades de Layout, Espaçamento e Borda
  public updateMargin(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.margin = val;
    this.marginTop = val;
    this.marginRight = val;
    this.marginBottom = val;
    this.marginLeft = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('margin', `${val}px`, 'important');
    }
  }

  public updateMarginSide(side: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const capitalized = side.charAt(0).toUpperCase() + side.slice(1);
    (this as unknown as Record<string, string>)[`margin${capitalized}`] = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty(`margin-${side}`, `${val}px`, 'important');
    }
  }

  public updatePadding(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.padding = val;
    this.paddingTop = val;
    this.paddingRight = val;
    this.paddingBottom = val;
    this.paddingLeft = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('padding', `${val}px`, 'important');
    }
  }

  public updatePaddingSide(side: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const capitalized = side.charAt(0).toUpperCase() + side.slice(1);
    (this as unknown as Record<string, string>)[`padding${capitalized}`] = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty(`padding-${side}`, `${val}px`, 'important');
    }
  }

  public updateBorderStyle(style: string): void {
    this.borderStyle = style;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('border-style', style, 'important');
    }
  }

  public updateBorderStyleSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.updateBorderStyle(val);
  }

  public updateBorderWidth(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.borderWidth = val;
    this.borderTopWidth = val;
    this.borderRightWidth = val;
    this.borderBottomWidth = val;
    this.borderLeftWidth = val;
    if (this.selectedElement) {
      this.applyBorderStyles();
    }
  }

  public updateBorderWidthSide(side: 'Top' | 'Right' | 'Bottom' | 'Left', event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this[`border${side}Width`] = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty(`border-${side.toLowerCase()}-width`, `${val}px`, 'important');
    }
  }

  public updateBorderSideWidth(side: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const capitalized = side.charAt(0).toUpperCase() + side.slice(1);
    (this as unknown as Record<string, string>)[`border${capitalized}Width`] = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty(`border-${side}-width`, `${val}px`, 'important');
    }
  }

  public updateBorderRadius(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.borderRadius = val;
    this.borderTopLeftRadius = val;
    this.borderTopRightRadius = val;
    this.borderBottomRightRadius = val;
    this.borderBottomLeftRadius = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('border-radius', `${val}px`, 'important');
    }
  }

  public updateRadius(event: Event): void {
    this.updateBorderRadius(event);
  }

  public updateBorderRadiusCorner(corner: 'TopLeft' | 'TopRight' | 'BottomRight' | 'BottomLeft', event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this[`border${corner}Radius`] = val;
    if (this.selectedElement) {
      const formattedCorner = corner.replace(/([A-Z])/g, '-$1').toLowerCase();
      this.selectedElement.style.setProperty(`border${formattedCorner}-radius`, `${val}px`, 'important');
    }
  }

  public updateRadiusSide(corner: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    let cornerProp = '';
    let cssCorner = '';

    switch (corner) {
      case 'tl': cornerProp = 'borderTopLeftRadius'; cssCorner = 'border-top-left-radius'; break;
      case 'tr': cornerProp = 'borderTopRightRadius'; cssCorner = 'border-top-right-radius'; break;
      case 'br': cornerProp = 'borderBottomRightRadius'; cssCorner = 'border-bottom-right-radius'; break;
      case 'bl': cornerProp = 'borderBottomLeftRadius'; cssCorner = 'border-bottom-left-radius'; break;
    }

    if (cornerProp) {
      (this as unknown as Record<string, string>)[cornerProp] = val;
      if (this.selectedElement) {
        this.selectedElement.style.setProperty(cssCorner, `${val}px`, 'important');
      }
    }
  }

  public toggleBorderSide(side: 'top' | 'right' | 'bottom' | 'left' | 'all'): void {
    if (side === 'all') {
      const nextState = !this.borderSides.all;
      this.borderSides = { top: nextState, right: nextState, bottom: nextState, left: nextState, all: nextState };
    } else {
      this.borderSides[side] = !this.borderSides[side];
      this.borderSides.all = this.borderSides.top && this.borderSides.right && this.borderSides.bottom && this.borderSides.left;
    }
    if (this.selectedElement) {
      this.applyBorderStyles();
    }
  }

  private applyBorderStyles(): void {
    if (!this.selectedElement) return;

    const sides: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];

    if (this.borderSides.all) {
      this.selectedElement.style.setProperty('border-style', this.borderStyle, 'important');
      this.selectedElement.style.setProperty('border-width', `${this.borderWidth}px`, 'important');
      this.selectedElement.style.setProperty('border-color', this.tempBorderColor, 'important');
    } else {
      sides.forEach(s => {
        if (this.borderSides[s]) {
          this.selectedElement!.style.setProperty(`border-${s}-style`, this.borderStyle, 'important');
          this.selectedElement!.style.setProperty(`border-${s}-width`, `${this.getSideWidth(s)}px`, 'important');
          this.selectedElement!.style.setProperty(`border-${s}-color`, this.tempBorderColor, 'important');
        } else {
          this.selectedElement!.style.setProperty(`border-${s}-width`, '0px', 'important');
        }
      });
    }
  }

  private getSideWidth(side: 'top' | 'right' | 'bottom' | 'left'): string {
    switch (side) {
      case 'top': return this.borderTopWidth;
      case 'right': return this.borderRightWidth;
      case 'bottom': return this.borderBottomWidth;
      case 'left': return this.borderLeftWidth;
    }
  }

  // Tipografia e Modificadores Visuais
  public updateFontSize(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.fontSize = val;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('font-size', `${val}px`, 'important');
    }
  }

  public updateFontWeight(weightOrEvent: string | Event): void {
    const weight = typeof weightOrEvent === 'string' ? weightOrEvent : (weightOrEvent.target as HTMLSelectElement).value;
    this.fontWeight = weight;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('font-weight', weight, 'important');
    }
  }

  public updateTextTransform(transformOrEvent: string | Event): void {
    const transform = typeof transformOrEvent === 'string' ? transformOrEvent : (transformOrEvent.target as HTMLSelectElement).value;
    this.textTransform = transform;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('text-transform', transform, 'important');
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

  public updateTextAlign(align: string): void {
    this.textAlign = align;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('text-align', align, 'important');
    }
  }

  public setTextAlign(align: string): void {
    this.updateTextAlign(align);
  }

  public get fontStyleBoldActive(): boolean {
    return this.fontWeight === '700' || this.fontWeight === 'bold';
  }

  public toggleStyleBold(): void {
    this.updateFontWeight(this.fontStyleBoldActive ? '400' : '700');
  }

  public toggleStyleItalic(): void {
    this.updateFontStyle(this.fontStyle === 'italic' ? 'normal' : 'italic');
  }

  public toggleStyleUnderline(): void {
    this.updateTextDecoration(this.textDecoration.includes('underline') ? 'none' : 'underline');
  }

  public resetTypo(): void {
    if (!this.selectedElement) return;
    this.fontSize = this.originalFontSize;
    this.fontWeight = this.originalFontWeight;
    this.textTransform = this.originalTextTransform;
    this.lineHeight = this.originalLineHeight;
    this.letterSpacing = this.originalLetterSpacing;
    this.textAlign = this.originalTextAlign;
    this.fontStyle = this.originalFontStyle;
    this.textDecoration = this.originalTextDecoration;

    this.selectedElement.style.removeProperty('font-size');
    this.selectedElement.style.removeProperty('font-weight');
    this.selectedElement.style.removeProperty('text-transform');
    this.selectedElement.style.removeProperty('line-height');
    this.selectedElement.style.removeProperty('letter-spacing');
    this.selectedElement.style.removeProperty('text-align');
    this.selectedElement.style.removeProperty('font-style');
    this.selectedElement.style.removeProperty('text-decoration');
  }

  public updateFontStyle(style: string): void {
    this.fontStyle = style;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('font-style', style, 'important');
    }
  }

  public updateTextDecoration(decoration: string): void {
    this.textDecoration = decoration;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('text-decoration', decoration, 'important');
    }
  }

  public updateDisplay(dispOrEvent: string | Event): void {
    const disp = typeof dispOrEvent === 'string' ? dispOrEvent : (dispOrEvent.target as HTMLSelectElement).value;
    this.display = disp;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('display', disp, 'important');
    }
  }

  public resetDisplayLayout(): void {
    if (!this.selectedElement) return;
    this.display = this.originalDisplay;
    this.flexDirection = this.originalFlexDirection;
    this.flexWrap = this.originalFlexWrap;
    this.flexGap = this.originalFlexGap;
    this.justifyContent = this.originalJustifyContent;
    this.alignItems = this.originalAlignItems;

    this.selectedElement.style.removeProperty('display');
    this.selectedElement.style.removeProperty('flex-direction');
    this.selectedElement.style.removeProperty('flex-wrap');
    this.selectedElement.style.removeProperty('gap');
    this.selectedElement.style.removeProperty('justify-content');
    this.selectedElement.style.removeProperty('align-items');
  }

  public setFlexDirection(dir: string): void {
    this.updateFlexDirection(dir);
  }

  public updateFlexDirection(dir: string): void {
    this.flexDirection = dir;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('flex-direction', dir, 'important');
    }
  }

  public updateFlexWrap(wrapOrEvent: string | Event): void {
    const wrap = typeof wrapOrEvent === 'string' ? wrapOrEvent : (wrapOrEvent.target as HTMLSelectElement).value;
    this.flexWrap = wrap;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('flex-wrap', wrap, 'important');
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
    this.updateJustifyContent(val);
  }

  public updateJustifyContent(justify: string): void {
    this.justifyContent = justify;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('justify-content', justify, 'important');
    }
  }

  public updateFlexAlign(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.updateAlignItems(val);
  }

  public updateAlignItems(align: string): void {
    this.alignItems = align;
    if (this.selectedElement) {
      this.selectedElement.style.setProperty('align-items', align, 'important');
    }
  }

  // Resetações Individuais de Estilo
  public resetMargin(): void {
    if (!this.selectedElement) return;
    this.margin = this.originalMargin;
    this.marginTop = this.originalMarginTop;
    this.marginRight = this.originalMarginRight;
    this.marginBottom = this.originalMarginBottom;
    this.marginLeft = this.originalMarginLeft;

    this.selectedElement.style.removeProperty('margin');
    ['top', 'right', 'bottom', 'left'].forEach(s => this.selectedElement!.style.removeProperty(`margin-${s}`));
  }

  public resetPadding(): void {
    if (!this.selectedElement) return;
    this.padding = this.originalPadding;
    this.paddingTop = this.originalPaddingTop;
    this.paddingRight = this.originalPaddingRight;
    this.paddingBottom = this.originalPaddingBottom;
    this.paddingLeft = this.originalPaddingLeft;

    this.selectedElement.style.removeProperty('padding');
    ['top', 'right', 'bottom', 'left'].forEach(s => this.selectedElement!.style.removeProperty(`padding-${s}`));
  }

  public resetBorder(): void {
    if (!this.selectedElement) return;
    this.borderWidth = this.originalBorderWidth;
    this.borderStyle = this.originalBorderStyle;
    this.tempBorderColor = this.originalBorderColor;
    this.borderRadius = this.originalBorderRadius;

    this.selectedElement.style.removeProperty('border');
    this.selectedElement.style.removeProperty('border-width');
    this.selectedElement.style.removeProperty('border-style');
    this.selectedElement.style.removeProperty('border-color');
    this.selectedElement.style.removeProperty('border-radius');

    ['top', 'right', 'bottom', 'left'].forEach(side => {
      this.selectedElement!.style.removeProperty(`border-${side}`);
      this.selectedElement!.style.removeProperty(`border-${side}-style`);
      this.selectedElement!.style.removeProperty(`border-${side}-width`);
      this.selectedElement!.style.removeProperty(`border-${side}-color`);
    });

    this.selectElement(this.selectedElement);
  }

  public resetBorderLayout(): void {
    this.resetBorder();
  }

  public resetStyles(): void {
    if (!this.selectedElement) return;
    this.resetBgColor();
    this.resetTextColor();
    this.resetBorder();
    this.resetMargin();
    this.resetPadding();
    this.resetTypo();
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
    this.systemColors = this.domInspector.extractSystemColorsFromDom(this.styleUtils);
  }

  public closeInspector(): void {
    this.disableInspectMode();
    this.isOpen = false;
    this.onClose.emit();
  }

  // Navegação Hierárquica no DOM
  public get hasEligibleParent(): boolean {
    if (!this.selectedElement) return false;
    const parent = this.selectedElement.parentElement;
    return !!parent && parent.tagName !== 'BODY' && parent.tagName !== 'HTML' && !parent.closest('app-visual-inspector');
  }

  public get parentTagName(): string {
    if (this.selectedElement && this.selectedElement.parentElement) {
      return this.selectedElement.parentElement.tagName;
    }
    return '';
  }

  public selectParentElement(): void {
    if (this.selectedElement && this.hasEligibleParent) {
      const parent = this.selectedElement.parentElement;
      if (parent) {
        this.selectionHistory.push(this.selectedElement);
        this.selectElement(parent, true);
      }
    }
  }

  public get hasEligibleChild(): boolean {
    return this.selectionHistory.length > 0;
  }

  public get childTagName(): string {
    if (this.selectionHistory.length > 0) {
      return this.selectionHistory[this.selectionHistory.length - 1].tagName;
    }
    return '';
  }

  public selectChildElement(): void {
    if (this.selectionHistory.length > 0) {
      const child = this.selectionHistory.pop();
      if (child) {
        this.selectElement(child, true);
      }
    }
  }

  // Envio do payload para o servidor ponte
  public applyChangesToSource(): void {
    if (!this.selectedElement) return;

    this.isApplying = true;

    const modifiedStyles: Record<string, string> = {};
    const inlineStyleLength = this.selectedElement.style.length;

    for (let i = 0; i < inlineStyleLength; i++) {
      const styleName = this.selectedElement.style[i];
      const styleValue = this.selectedElement.style.getPropertyValue(styleName);
      modifiedStyles[styleName] = styleValue;
    }

    const elementData: InspectorBridgePayload = {
      tagName: this.tagName,
      classList: this.classList,
      originalClasses: this.classList.split(' ').filter(c => c.trim().length > 0),
      modifiedStyles: modifiedStyles,
      outerHTML: this.selectedElement.outerHTML.substring(0, 1000),
      selector: this.domInspector.getUniqueSelector(this.selectedElement)
    };

    console.log('[Visual Inspector] Enviando alterações para a ponte local:', elementData);

    this.inspectorBridge.sendChanges(elementData).subscribe({
      next: (data) => {
        console.log('[Visual Inspector] Resposta da ponte:', data);
        alert('Alterações enviadas para a IDE Antigravity com sucesso!\nAgora peça no chat: "Aplique as alterações do Inspetor".');
        this.isApplying = false;
      },
      error: (err) => {
        console.error('[Visual Inspector] Erro ao enviar alterações:', err);
        alert(err.message || 'Não foi possível conectar ao servidor ponte local na porta 4300!');
        this.isApplying = false;
      }
    });
  }
}
