import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
// main.ts
(window as any).global = window;
// ... resto del código
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
