import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'urban-signs-theme';

  readonly currentTheme = signal<Theme>('light');

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    const savedTheme = localStorage.getItem(this.storageKey);
    this.setTheme(savedTheme === 'dark' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.document.documentElement.classList.toggle('dark', theme === 'dark');
    if (isPlatformBrowser(this.platformId)) localStorage.setItem(this.storageKey, theme);
  }
}
