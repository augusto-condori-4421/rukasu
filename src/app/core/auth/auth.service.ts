import { Injectable, inject, signal } from '@angular/core';
import { SupabaseClientService } from '../services/supabase-client.service';
import type { Session } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseClientService);

  session = signal<Session | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    if (!this.supabase.isConfigured) return;

    // Restore existing session
    this.supabase.client!.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
      this.isAuthenticated.set(!!data.session);
    });

    // Listen for auth state changes
    this.supabase.client!.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.isAuthenticated.set(!!session);
    });
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    if (!this.supabase.isConfigured) {
      return { error: 'Supabase no está configurado.' };
    }
    const { error } = await this.supabase.client!.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async signOut(): Promise<void> {
    if (!this.supabase.isConfigured) return;
    await this.supabase.client!.auth.signOut();
  }
}
