import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPencil, heroTrash, heroPlus, heroExclamationTriangle } from '@ng-icons/heroicons/outline';
import { CategoriesAdminService } from '../../services/categories-admin.service';
import type { Category, CategoryNode } from '../../../../core/models/category.model';
import { buildCategoryTree, flattenTree } from '../../../../shared/utils/category-tree.util';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [RouterLink, NgIconComponent],
  providers: [provideIcons({ heroPencil, heroTrash, heroPlus, heroExclamationTriangle })],
  templateUrl: './categories.component.html',
})
export class AdminCategoriesComponent implements OnInit {
  private readonly service = inject(CategoriesAdminService);

  categories = signal<Category[]>([]);
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  deleting = signal<number | null>(null);

  /** Flat tree in depth-first order for rendering with indentation */
  flatTree = computed<CategoryNode[]>(() =>
    flattenTree(buildCategoryTree(this.categories()))
  );

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.loading.set(true);
    this.categories.set(await this.service.getAll());
    this.loading.set(false);
  }

  async deleteCategory(id: number) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    this.deleting.set(id);
    this.errorMsg.set(null);
    const result = await this.service.delete(id);
    if (!result.ok) {
      this.errorMsg.set(result.reason ?? 'Error al eliminar.');
    } else {
      this.successMsg.set('Categoría eliminada.');
      await this.loadCategories();
      setTimeout(() => this.successMsg.set(null), 3000);
    }
    this.deleting.set(null);
  }

  /** Visual prefix for the tree row */
  getPrefix(node: CategoryNode): string {
    if (node.depth === 0) return '';
    return '— '.repeat(node.depth);
  }
}
