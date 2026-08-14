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
    <!-- Elementos de Teste do Dashboard Mock para Inspecionar -->
    <div class="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800" style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
      <!-- Header -->
      <header class="text-white px-8 py-4.5 flex items-center justify-between shadow-lg" style="background: linear-gradient(135deg, #090d16 0%, #111827 100%); color: #ffffff; border-bottom: 1px solid rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: space-between; padding: 18px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div class="flex items-center gap-3" style="display: flex; align-items: center; gap: 12px;">
          <div style="background: rgba(16, 185, 129, 0.1); padding: 8px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center;">
            <lucide-icon name="palette" class="w-5 h-5 text-emerald-400" style="color: #10b981; width: 20px; height: 20px;"></lucide-icon>
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span class="font-extrabold text-base tracking-tight" style="font-weight: 900; font-size: 1.05rem; letter-spacing: -0.01em; line-height: 1;">
              Visual <span style="color: #10b981;">Inspector</span>
            </span>
            <span style="font-size: 9px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.08em; line-height: 1;">
              Demo Workspace v1.0
            </span>
          </div>
        </div>
        <div class="flex items-center gap-5 text-xs font-semibold" style="display: flex; align-items: center; gap: 20px; font-size: 0.75rem;">
          <!-- Badge de Status -->
          <div style="display: flex; align-items: center; gap: 8px; padding: 5px 12px; background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 9999px; color: #34d399; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
            <span class="status-dot" style="width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px #10b981;"></span>
            Live Sandbox
          </div>
        </div>
      </header>

      <!-- Layout Dividido -->
      <div class="flex flex-1" style="display: flex; flex: 1;">
        <!-- Sidebar -->
        <aside class="w-64 bg-slate-900 text-slate-350 p-6 flex flex-col gap-4 border-r border-slate-800" style="width: 240px; background-color: #0f172a; border-right: 1px solid #1e293b; padding: 24px; display: flex; flex-direction: column; gap: 16px; color: #cbd5e1;">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-500" style="font-size: 0.75rem; font-weight: 900; color: #64748b; letter-spacing: 0.1em; text-transform: uppercase;">Componentes</h3>
          <nav class="flex flex-col gap-1.5" style="display: flex; flex-direction: column; gap: 6px;">
            <a class="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer" style="background-color: #1e293b; color: white; padding: 8px 12px; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer;">Visão Geral</a>
            <a class="hover:bg-slate-850 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer" style="padding: 8px 12px; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer;">Configurações</a>
            <a class="hover:bg-slate-850 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer" style="padding: 8px 12px; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer;">Modelos de Design</a>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-8 flex flex-col gap-6" style="flex: 1; padding: 32px; display: flex; flex-direction: column; gap: 24px;">
          <div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight" style="font-size: 1.5rem; font-weight: 900; color: #1e293b;">Área de Demonstração</h2>
            <p class="text-sm text-slate-500 font-medium" style="font-size: 0.875rem; color: #64748b;">Use a mira do Inspetor de Cores para clicar e customizar qualquer um dos elementos abaixo em tempo real.</p>
          </div>

          <!-- Grade de Cards de Teste -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
            
            <!-- Card Verde -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition" style="background-color: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600" style="width: 40px; height: 40px; border-radius: 12px; background-color: #d1fae5; color: #059669; display: flex; align-items: center; justify-content: center;">
                <lucide-icon name="palette" class="w-5 h-5" style="width: 20px; height: 20px;"></lucide-icon>
              </div>
              <h3 class="text-base font-extrabold text-slate-800" style="font-size: 1rem; font-weight: 800; color: #1e293b;">Card de Suporte</h3>
              <p class="text-xs text-slate-500 leading-relaxed font-medium" style="font-size: 0.75rem; color: #64748b; line-height: 1.625;">
                Este card tem um fundo branco padrão, texto em cinza e pode ter sua borda, margem e espaçamento interno modificados.
              </p>
            </div>

            <!-- Card Azul (Linear Gradient) -->
            <div class="text-white rounded-2xl p-6 flex flex-col gap-3 shadow-md hover:shadow-lg transition" style="background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 12px; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white" style="width: 40px; height: 40px; border-radius: 12px; background-color: rgba(255,255,255,0.2); color: white; display: flex; align-items: center; justify-content: center;">
                <lucide-icon name="info" class="w-5 h-5" style="width: 20px; height: 20px;"></lucide-icon>
              </div>
              <h3 class="text-base font-extrabold" style="font-size: 1rem; font-weight: 800;">Card de Informações</h3>
              <p class="text-xs text-sky-100 leading-relaxed font-medium" style="font-size: 0.75rem; color: #e0f2fe; line-height: 1.625;">
                Este card usa um gradiente CSS linear padrão. O Inspetor de Cores irá ler e extrair as cores de parada e o ângulo originais automaticamente na bússola!
              </p>
            </div>

            <!-- Card Vermelho -->
            <div class="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600" style="width: 40px; height: 40px; border-radius: 12px; background-color: #ffe4e6; color: #e11d48; display: flex; align-items: center; justify-content: center;">
                <lucide-icon name="x" class="w-5 h-5" style="width: 20px; height: 20px;"></lucide-icon>
              </div>
              <h3 class="text-base font-extrabold text-rose-800" style="font-size: 1rem; font-weight: 800; color: #9f1239;">Card de Alerta</h3>
              <p class="text-xs text-rose-600 leading-relaxed font-medium" style="font-size: 0.75rem; color: #e11d48; line-height: 1.625;">
                Este card indica uma área de alerta com estilos em rosa. Tente inspecioná-lo para reajustar o preenchimento interno (padding).
              </p>
            </div>
          </div>

          <!-- Seção de Customização de Rodapé -->
          <footer class="mt-auto bg-slate-800 text-slate-400 p-4 rounded-xl flex items-center justify-between text-xs font-semibold border border-slate-700" style="background-color: #1e293b; color: #94a3b8; border: 1px solid #334155; padding: 16px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; margin-top: auto; font-size: 0.75rem;">
            <span>© 2026 Visual Inspector Workspace</span>
            <span class="text-emerald-400" style="color: #34d399;">Pronto para Reuso e Desenvolvimento</span>
          </footer>
        </main>
      </div>

      <!-- Botão Flutuante Ativador no Canto Inferior Direito -->
      <button
        (click)="isOpen.set(!isOpen())"
        class="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-slate-900 border border-slate-850 shadow-2xl text-emerald-400 hover:text-emerald-300 hover:scale-105 transition-all flex items-center justify-center cursor-pointer z-40 active:scale-95"
        style="position: fixed; bottom: 24px; right: 24px; width: 48px; height: 48px; border-radius: 50%; background-color: #0f172a; border: 1px solid #1e293b; box-shadow: 0 10px 25px rgba(0,0,0,0.3); color: #34d399; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;"
        title="Abrir Inspetor de Cores"
      >
        <lucide-icon name="palette" class="w-5 h-5" style="width: 20px; height: 20px;"></lucide-icon>
      </button>

      <!-- Componente do Inspetor Flutuante -->
      <app-visual-inspector 
        [isOpen]="isOpen()" 
        (onClose)="isOpen.set(false)"
      ></app-visual-inspector>
    </div>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% {
        opacity: 0.4;
        transform: scale(0.9);
      }
      50% {
        opacity: 1;
        transform: scale(1.25);
        box-shadow: 0 0 14px #10b981;
      }
    }
    .status-dot {
      animation: pulse 1.8s infinite ease-in-out;
    }
  `]
})
export class App {
  public readonly isOpen = signal(true); // Inicializa aberto para demonstração imediata
}
