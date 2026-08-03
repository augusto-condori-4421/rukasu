import { Injectable, inject } from '@angular/core';
import { SupabaseClientService } from '../../../core/services/supabase-client.service';
import type { Product } from '../../../core/models/product.model';

export type ProductPayload = Omit<Product, 'id_prod'>;

@Injectable({ providedIn: 'root' })
export class ProductsAdminService {
  private readonly supabase = inject(SupabaseClientService);

  private get client() {
    if (!this.supabase.isConfigured || !this.supabase.client) {
      throw new Error('Supabase no está configurado. Verificá las credenciales en environment.ts.');
    }
    return this.supabase.client;
  }

  async getAll(): Promise<Product[]> {
    if (!this.supabase.isConfigured || !this.supabase.client) return [];
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .order('name');
    if (error) throw new Error(error.message);
    return (data as Product[]) ?? [];
  }

  async getById(id: number): Promise<Product | null> {
    if (!this.supabase.isConfigured || !this.supabase.client) return null;
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('id_prod', id)
      .single();
    if (error || !data) return null;
    return data as Product;
  }

  async create(payload: ProductPayload): Promise<Product> {
    const { data, error } = await this.client
      .from('products')
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Product;
  }

  async update(id: number, payload: Partial<ProductPayload>): Promise<void> {
    const { error } = await this.client
      .from('products')
      .update(payload)
      .eq('id_prod', id);
    if (error) throw new Error(error.message);
  }

  async delete(id: number): Promise<void> {
    const product = await this.getById(id);
    if (product) {
      await this._tryDeleteStorageFile(product.image_url_desktop);
      await this._tryDeleteStorageFile(product.image_url_mobile);
    }
    const { error } = await this.client
      .from('products')
      .delete()
      .eq('id_prod', id);
    if (error) throw new Error(error.message);
  }

  /** Upload image to storage, returns public URL */
  async uploadImage(
    productId: number,
    file: File,
    variant: 'desktop' | 'mobile'
  ): Promise<string> {
    const path = `products/${productId}/${variant}.webp`;
    const { error } = await this.client.storage
      .from('rukasu-img')
      .upload(path, file, { upsert: true, contentType: 'image/webp' });
    if (error) throw new Error(error.message);
    const { data } = this.client.storage
      .from('rukasu-img')
      .getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
  }

  private async _tryDeleteStorageFile(url: string): Promise<void> {
    if (!url || !url.includes('rukasu-img')) return;
    try {
      // Extract path from public URL
      const marker = '/rukasu-img/';
      const idx = url.indexOf(marker);
      if (idx === -1) return;
      const path = url.slice(idx + marker.length);
      await this.supabase.client!.storage.from('rukasu-img').remove([path]);
    } catch {
      // Ignore — may be external URL or already deleted
    }
  }
}
