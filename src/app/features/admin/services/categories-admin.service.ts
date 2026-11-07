import { Injectable, inject } from '@angular/core';
import { SupabaseClientService } from '../../../core/services/supabase-client.service';
import type { Category } from '../../../core/models/category.model';

export type CategoryPayload = Omit<Category, 'id'>;

@Injectable({ providedIn: 'root' })
export class CategoriesAdminService {
  private readonly supabase = inject(SupabaseClientService);

  private get client() {
    if (!this.supabase.isConfigured || !this.supabase.client) {
      throw new Error('Supabase no está configurado. Verificá las credenciales en environment.ts.');
    }
    return this.supabase.client;
  }

  async getAll(): Promise<Category[]> {
    if (!this.supabase.isConfigured || !this.supabase.client) return [];
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw new Error(error.message);
    return (data as Category[]) ?? [];
  }

  async getById(id: number): Promise<Category | null> {
    if (!this.supabase.isConfigured || !this.supabase.client) return null;
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as Category;
  }

  async create(payload: CategoryPayload): Promise<Category> {
    const { data, error } = await this.client
      .from('categories')
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Category;
  }

  async update(id: number, payload: Partial<CategoryPayload>): Promise<void> {
    const { error } = await this.client
      .from('categories')
      .update(payload)
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  async delete(id: number): Promise<{ ok: boolean; reason?: string }> {
    if (!this.supabase.isConfigured || !this.supabase.client) {
      return { ok: false, reason: 'Supabase no está configurado.' };
    }

    // Check for child categories first
    const { count: childCount, error: childError } = await this.client
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', id);

    if (childError) return { ok: false, reason: childError.message };
    if (childCount && childCount > 0) {
      return {
        ok: false,
        reason: `Esta categoría tiene ${childCount} subcategoría${childCount > 1 ? 's' : ''}. Moveélas o eliminalas primero.`,
      };
    }

    // Check for associated products
    const { count, error: countError } = await this.client
      .from('products')
      .select('id_prod', { count: 'exact', head: true })
      .eq('cat_id', id);

    if (countError) return { ok: false, reason: countError.message };
    if (count && count > 0) {
      return {
        ok: false,
        reason: `Esta categoría tiene ${count} producto${count > 1 ? 's' : ''} asociado${count > 1 ? 's' : ''}. Reasignalos o eliminalos primero.`,
      };
    }

    const { error } = await this.client
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  }
}
