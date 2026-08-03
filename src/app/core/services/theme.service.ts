import { Injectable, signal } from '@angular/core';

type Theme = 'dark' | 'light';
const STORAGE_KEY = 'rukasu-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal<boolean>(true);

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: Theme = saved ?? (prefersDark ? 'dark' : 'light');
    this.isDark.set(initial === 'dark');
    this._apply();
  }

  toggle(): void {
    this.isDark.update(v => !v);
    localStorage.setItem(STORAGE_KEY, this.isDark() ? 'dark' : 'light');
    this._apply();
  }

  private _apply(): void {
    const html = document.documentElement;
    if (this.isDark()) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }
}
