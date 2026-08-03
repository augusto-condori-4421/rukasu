import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroHome,
  heroTag,
  heroSquares2x2,
  heroArrowRightOnRectangle,
  heroBars3,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIconComponent],
  providers: [provideIcons({ heroHome, heroTag, heroSquares2x2, heroArrowRightOnRectangle, heroBars3, heroXMark })],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  isMobileOpen = signal(false);

  toggleMobile() { this.isMobileOpen.update(v => !v); }
  closeMobile() { this.isMobileOpen.set(false); }

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/admin/login']);
  }
}
