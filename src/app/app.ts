import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualInspectorComponent } from './components/visual-inspector/visual-inspector.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    VisualInspectorComponent,
    LucideAngularModule
  ],
  template: `
    <!-- Container Principal do Workspace de Demonstração -->
    <div class="demo-app-container">
      
      <!-- Cabeçalho Principal -->
      <header class="demo-header">
        <div class="demo-brand">
          <div class="demo-brand-icon">
            <lucide-icon name="palette" class="w-5 h-5"></lucide-icon>
          </div>
          <div class="demo-brand-text">
            <span class="demo-brand-title">
              Visual <span>Inspector</span>
            </span>
            <span class="demo-brand-subtitle">
              Demo Workspace v1.0
            </span>
          </div>
        </div>

        <div class="demo-status-badge">
          <span class="status-dot"></span>
          Live Sandbox Active
        </div>
      </header>

      <!-- Layout de Corpo Dividido -->
      <div class="demo-body">
        
        <!-- Barra Lateral (Sidebar) -->
        <aside class="demo-sidebar">
          <h3 class="demo-sidebar-title">Componentes do Sistema</h3>
          <nav class="demo-nav">
            <a class="demo-nav-item active">
              <lucide-icon name="target" class="w-4 h-4"></lucide-icon>
              <span>Visão Geral</span>
            </a>
            <a class="demo-nav-item">
              <lucide-icon name="info" class="w-4 h-4"></lucide-icon>
              <span>Configurações</span>
            </a>
            <a class="demo-nav-item">
              <lucide-icon name="palette" class="w-4 h-4"></lucide-icon>
              <span>Modelos de Design</span>
            </a>
          </nav>
        </aside>

        <!-- Área de Conteúdo Principal -->
        <main class="demo-main">
          
          <div class="demo-hero">
            <h2 class="demo-hero-title">Área de Demonstração Interativa</h2>
            <p class="demo-hero-subtitle">
              Ative a mira do Inspetor de Cores no canto inferior para selecionar e customizar visualmente qualquer elemento em tempo real.
            </p>
          </div>

          <!-- Grade de Cards de Teste -->
          <div class="demo-grid">
            
            <!-- Card 1: Suporte -->
            <div class="demo-card demo-card-white">
              <div class="demo-icon-box-emerald">
                <lucide-icon name="palette" class="w-5 h-5"></lucide-icon>
              </div>
              <h3 class="demo-card-title">Card de Suporte</h3>
              <p class="demo-card-desc">
                Este card tem um fundo branco padrão, texto em cinza e pode ter sua cor de fundo, bordas e espaçamentos internos modificados.
              </p>
            </div>

            <!-- Card 2: Informações (Gradiente) -->
            <div class="demo-card demo-card-gradient">
              <div class="demo-icon-box-glass">
                <lucide-icon name="info" class="w-5 h-5"></lucide-icon>
              </div>
              <h3 class="demo-card-title" style="color: #ffffff;">Card de Informações</h3>
              <p class="demo-card-desc" style="color: #e0f2fe;">
                Este card utiliza um gradiente CSS linear. O Inspetor detectará e extrairá as cores de início, fim e o ângulo original automaticamente na bússola!
              </p>
            </div>

            <!-- Card 3: Alerta -->
            <div class="demo-card demo-card-rose">
              <div class="demo-icon-box-rose">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </div>
              <h3 class="demo-card-title" style="color: #9f1239;">Card de Alerta</h3>
              <p class="demo-card-desc" style="color: #e11d48;">
                Este card indica um alerta com estilos suaves em tons de rosa. Inspecione-o para reajustar o preenchimento interno (padding) ou alterar o arredondamento.
              </p>
            </div>

          </div>

          <!-- Rodapé do Workspace -->
          <footer class="demo-footer">
            <span>© 2026 Visual Inspector Workspace</span>
            <span class="demo-footer-badge">Pronto para Reuso e Desenvolvimento</span>
          </footer>

        </main>
      </div>

      <!-- Botão Flutuante Ativador -->
      <button
        (click)="isOpen.set(!isOpen())"
        class="demo-floating-btn"
        title="Abrir Inspetor de Cores"
      >
        <lucide-icon name="palette" class="w-6 h-6"></lucide-icon>
      </button>

      <!-- Componente do Inspetor Flutuante -->
      <app-visual-inspector 
        [isOpen]="isOpen()" 
        (onClose)="isOpen.set(false)"
      ></app-visual-inspector>

    </div>
  `
})
export class App {
  public readonly isOpen = signal(true);
}
