import { Injectable, inject, signal } from '@angular/core';
import { SupabaseClientService } from '../../../core/services/supabase-client.service';
import type { Product, ProductListItem } from '../../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly supabase = inject(SupabaseClientService);

  products = signal<ProductListItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  async load(): Promise<void> {
    if (!this.supabase.isConfigured) {
      this.products.set([]);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { data, error } = await this.supabase.client!
      .from('products')
      .select('id_prod, cat_id, name, price, image_url_mobile, image_url_desktop')
      .eq('is_active', true)
      .order('name');

    if (error) {
      this.error.set(error.message);
    } else {
      this.products.set((data as ProductListItem[]) ?? []);
    }
    this.loading.set(false);
  }

  async getById(id: number): Promise<Product | null> {
    if (!this.supabase.isConfigured) return null;
    const { data, error } = await this.supabase.client!
      .from('products')
      .select('*')
      .eq('id_prod', id)
      .eq('is_active', true)
      .single();
    if (error || !data) return null;
    return data as Product;
  }
}
