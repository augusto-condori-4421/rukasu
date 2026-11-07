import {
  Component,
  input,
  output,
  signal,
  computed,
  OnChanges,
  SimpleChanges,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Category, CategoryNode } from '../../../core/models/category.model';
import { buildCategoryTree, flattenTree, getDescendantIds } from '../../utils/category-tree.util';

/**
 * Reusable hierarchical category selector.
 *
 * Usage:
 *   <app-category-selector
 *     [allCategories]="categories()"
 *     [selectedId]="catId()"
 *     [excludeId]="editId"       <!-- optional: excludes this id + its descendants -->
 *     [placeholder]="'Seleccioná una categoría'"
 *     (selectionChange)="catId.set($event)"
 *   />
 */
@Component({
  selector: 'app-category-selector',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative" (keydown.escape)="close()">

      <!-- Trigger button -->
      <button
        type="button"
        (click)="toggleOpen()"
        class="w-full flex items-center justify-between gap-2
               bg-surface-2 border border-border rounded-lg px-3.5 py-2.5
               text-sm text-foreground focus:outline-none focus:border-accent
               focus:ring-1 focus:ring-accent/30 transition-all text-left"
        [class.border-accent]="isOpen()"
        [class.ring-1]="isOpen()"
        [class.ring-accent\/30]="isOpen()"
      >
        <span class="truncate" [class.text-muted]="selectedId() == null">
          @if (selectedId() != null && selectedNode()) {
            <span class="font-medium text-foreground">{{ selectedNode()!.name }}</span>
            @if (selectedNode()!.depth > 0) {
              <span class="text-muted text-xs ml-1.5">· {{ selectedNode()!.path }}</span>
            }
          } @else {
            {{ placeholder() }}
          }
        </span>
        <div class="flex items-center gap-1 shrink-0">
          @if (selectedId() != null) {
            <span
              (click)="clearSelection($event)"
              role="button"
              tabindex="0"
              (keydown.enter)="clearSelection($event)"
              aria-label="Limpiar selección"
              class="text-muted hover:text-foreground text-xs px-1 py-0.5 rounded hover:bg-surface cursor-pointer"
            >✕</span>
          }
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               stroke-width="2" stroke="currentColor"
               class="w-4 h-4 text-muted transition-transform duration-200"
               [class.rotate-180]="isOpen()">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
          </svg>
        </div>
      </button>

      <!-- Dropdown panel -->
      @if (isOpen()) {
        <div class="absolute z-50 mt-1.5 w-full bg-surface border border-border rounded-xl
                    shadow-[0_8px_32px_rgba(0,0,0,0.25)] overflow-hidden">

          <!-- Search input -->
          <div class="p-2 border-b border-border">
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   stroke-width="2" stroke="currentColor"
                   class="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/>
              </svg>
              <input
                #searchInput
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Buscar categoría..."
                class="w-full bg-surface-2 border border-border rounded-lg pl-8 pr-3 py-1.5
                       text-sm text-foreground placeholder:text-muted/50
                       focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
            </div>
          </div>

          <!-- Option: sin categoría padre (only shown when it makes sense) -->
          @if (allowNull()) {
            <button
              type="button"
              (click)="select(null)"
              class="w-full text-left px-3.5 py-2 text-sm transition-colors
                     hover:bg-surface-2"
              [class.bg-accent\/10]="selectedId() === null"
              [class.text-accent]="selectedId() === null"
              [class.text-muted]="selectedId() !== null"
            >
              <span class="italic">— Sin categoría padre —</span>
            </button>
          }

          <!-- Category list -->
          <div class="max-h-56 overflow-y-auto">
            @if (filteredFlat().length === 0) {
              <div class="px-3.5 py-4 text-sm text-muted text-center">Sin resultados</div>
            }
            @for (node of filteredFlat(); track node.id) {
              <button
                type="button"
                (click)="select(node.id)"
                class="w-full text-left px-3.5 py-2 text-sm transition-colors hover:bg-surface-2 flex items-center gap-1.5"
                [class.bg-accent\/10]="selectedId() === node.id"
                [class.text-accent]="selectedId() === node.id"
                [class.text-foreground]="selectedId() !== node.id"
                [style.padding-left.px]="14 + node.depth * 16"
              >
                <!-- Hierarchy visual indicator -->
                @if (node.depth > 0) {
                  <span class="text-muted/50 text-xs font-mono shrink-0">
                    @if (isLastChild(node)) { └── } @else { ├── }
                  </span>
                } @else {
                  <span class="w-2 h-2 rounded-full bg-accent/60 shrink-0 inline-block"></span>
                }
                <span class="truncate">{{ node.name }}</span>
                @if (node.children.length > 0) {
                  <span class="ml-auto text-muted/40 text-[10px] font-mono shrink-0">{{ node.children.length }}</span>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class CategorySelectorComponent implements OnChanges {
  private readonly elRef = inject(ElementRef);

  readonly allCategories = input.required<Category[]>();
  readonly selectedId = input<number | null>(null);
  readonly excludeId = input<number | null>(null);   // excludes this + descendants (for edit)
  readonly placeholder = input('Seleccioná una categoría');
  readonly allowNull = input(false);                 // show "— Sin categoría padre —" option

  readonly selectionChange = output<number | null>();

  isOpen = signal(false);
  searchTerm = '';

  /** Flat list built from the tree, excluding excludeId + its descendants */
  private flatList = computed<CategoryNode[]>(() => {
    const cats = this.allCategories();
    const excludeId = this.excludeId();
    let filtered = cats;
    if (excludeId != null) {
      const bannedIds = new Set([excludeId, ...getDescendantIds(excludeId, cats)]);
      filtered = cats.filter(c => !bannedIds.has(c.id));
    }
    const tree = buildCategoryTree(filtered);
    return flattenTree(tree);
  });

  filteredFlat = computed<CategoryNode[]>(() => {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.flatList();
    // When searching, show ALL matching nodes regardless of depth
    return this.flatList().filter(n =>
      n.name.toLowerCase().includes(q) || n.path.toLowerCase().includes(q)
    );
  });

  selectedNode = computed<CategoryNode | null>(() => {
    const id = this.selectedId();
    if (id == null) return null;
    return this.flatList().find(n => n.id === id) ?? null;
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['allCategories']) {
      this.searchTerm = '';
    }
  }

  toggleOpen() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.searchTerm = '';
    }
  }

  close() {
    this.isOpen.set(false);
    this.searchTerm = '';
  }

  select(id: number | null) {
    this.selectionChange.emit(id);
    this.close();
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    this.selectionChange.emit(null);
  }

  /** Heuristic: a node is a "last child" if no sibling comes after it alphabetically at same parent */
  isLastChild(node: CategoryNode): boolean {
    const siblings = this.flatList().filter(n => n.parent_id === node.parent_id && n.depth === node.depth);
    return siblings[siblings.length - 1]?.id === node.id;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isOpen() && !this.elRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}

