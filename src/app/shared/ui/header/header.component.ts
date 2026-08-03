import {
  Component,
  inject,
  signal,
  HostListener,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroShoppingCart,
  heroMoon,
  heroSun,
  heroBars3,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { ThemeService } from '../../../core/services/theme.service';
import { CartService } from '../../../features/cart/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIconComponent],
  providers: [provideIcons({ heroShoppingCart, heroMoon, heroSun, heroBars3, heroXMark })],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly theme = inject(ThemeService);
  readonly cart = inject(CartService);

  isScrolled = signal(false);
  mobileMenuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleTheme() { this.theme.toggle(); }
  toggleMobile() { this.mobileMenuOpen.update(v => !v); }
  closeMobile() { this.mobileMenuOpen.set(false); }
}
