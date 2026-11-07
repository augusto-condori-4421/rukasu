import { Component, input, output, computed } from '@angular/core';
import type { Category } from '../../../../core/models/category.model';
import { buildCategoryTree, flattenTree, getSubtreeIds } from '../../../../shared/utils/category-tree.util';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  templateUrl: './category-filter.component.html',
})
export class CategoryFilterComponent {
  readonly categories = input.required<Category[]>();
  readonly selected = input<number | null>(null);
  readonly selectionChange = output<number | null>();

  /** Only root-level categories (parent_id = null or undefined) */
  rootCategories = computed(() =>
    this.categories().filter(c => c.parent_id == null)
  );

  /**
   * If a category is selected, find its root ancestor.
   * Used to know which root is "active" for showing subcategories.
   */
  activeRootId = computed<number | null>(() => {
    const sel = this.selected();
    if (sel == null) return null;
    return this.findRootId(sel);
  });

  /**
   * Direct children of the currently active root category.
   * Shown as a secondary row of pills.
   */
  visibleChildren = computed<Category[]>(() => {
    const rootId = this.activeRootId();
    if (rootId == null) return [];
    return this.categories().filter(c => c.parent_id === rootId);
  });

  /**
   * If a subcategory is selected, show its children too (3rd level etc.)
   */
  visibleGrandchildren = computed<Category[]>(() => {
    const sel = this.selected();
    if (sel == null) return [];
    const selCat = this.categories().find(c => c.id === sel);
    if (!selCat || selCat.parent_id == null) return [];
    // Only show children of the selected if it's not a root
    const isRoot = selCat.parent_id == null;
    if (isRoot) return [];
    return this.categories().filter(c => c.parent_id === sel);
  });

  select(id: number | null) {
    this.selectionChange.emit(id);
  }

  private findRootId(catId: number): number | null {
    const all = this.categories();
    let current = all.find(c => c.id === catId);
    while (current && current.parent_id != null) {
      current = all.find(c => c.id === current!.parent_id);
    }
    return current?.id ?? null;
  }

  /** Whether a category ID is in the selection subtree (selected or ancestor of selected) */
  isInPath(id: number): boolean {
    const sel = this.selected();
    if (sel == null) return false;
    if (sel === id) return true;
    // Walk up the ancestors of sel
    const all = this.categories();
    let current = all.find(c => c.id === sel);
    while (current && current.parent_id != null) {
      if (current.parent_id === id) return true;
      current = all.find(c => c.id === current!.parent_id);
    }
    return false;
  }
}
