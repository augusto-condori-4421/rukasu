import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase.config';

@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  private readonly _client: SupabaseClient | null = null;

  constructor() {
    if (supabaseConfig.url && supabaseConfig.anonKey) {
      this._client = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    }
  }

  get client(): SupabaseClient | null {
    return this._client;
  }

  get isConfigured(): boolean {
    return !!this._client;
  }
}
