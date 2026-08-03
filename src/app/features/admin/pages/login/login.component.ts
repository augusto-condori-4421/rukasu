import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroEye, heroEyeSlash, heroExclamationTriangle } from '@ng-icons/heroicons/outline';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIconComponent],
  providers: [provideIcons({ heroEye, heroEyeSlash, heroExclamationTriangle })],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  loading = signal(false);
  errorMsg = signal<string | null>(null);

  async submit() {
    if (!this.email() || !this.password()) {
      this.errorMsg.set('Completá todos los campos.');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set(null);
    const { error } = await this.auth.signIn(this.email(), this.password());
    if (error) {
      this.errorMsg.set('Credenciales incorrectas. Intentá de nuevo.');
    } else {
      this.router.navigate(['/admin']);
    }
    this.loading.set(false);
  }
}
