import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
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
