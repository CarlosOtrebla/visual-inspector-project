import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { 
  LucideAngularModule,
  Palette,
  X,
  Target,
  Info,
  RotateCcw,
  Check,
  Loader
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    importProvidersFrom(
      LucideAngularModule.pick({
        Palette,
        X,
        Target,
        Info,
        RotateCcw,
        Check,
        Loader
      })
    )
  ]
};
