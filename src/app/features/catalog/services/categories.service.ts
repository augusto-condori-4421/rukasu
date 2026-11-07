import { Injectable, inject, signal } from '@angular/core';
import { SupabaseClientService } from '../../../core/services/supabase-client.service';
import type { Category } from '../../../core/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly supabase = inject(SupabaseClientService);

  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  async load(): Promise<void> {
    if (!this.supabase.isConfigured) {
      this.categories.set([]);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { data, error } = await this.supabase.client!
      .from('categories')
      .select('id, name, description, parent_id')
      .order('name');

    if (error) {
      this.error.set(error.message);
    } else {
      this.categories.set((data as Category[]) ?? []);
    }
    this.loading.set(false);
  }
}
