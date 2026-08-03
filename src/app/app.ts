import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit {
  private readonly theme = inject(ThemeService);

  ngOnInit() {
    // ThemeService constructor already applies the initial theme class.
    // Injecting here ensures it's created (singleton) on app start.
  }
}
