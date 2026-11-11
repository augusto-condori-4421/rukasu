import { Injectable, signal, computed } from '@angular/core';
import type { CartItem } from '../../../core/models/cart-item.model';
import type { ProductListItem } from '../../../core/models/product.model';

const STORAGE_KEY = 'rukasu-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this._load());

  /** Read-only view of cart items */
  items = this._items.asReadonly();

  /** Total number of units in cart */
  totalUnits = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0)
  );

  /** Total price */
  totalPrice = computed(() =>
    this._items().reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  );

  isOpen = signal(false);

  /** Toast: name of the last product added. Cleared after a timeout. */
  toastProductName = signal<string | null>(null);
  private _toastTimer: ReturnType<typeof setTimeout> | null = null;

  openCart(): void { this.isOpen.set(true); }
  closeCart(): void { this.isOpen.set(false); }
  toggleCart(): void { this.isOpen.update(v => !v); }

  add(product: ProductListItem): void {
    this._items.update(items => {
      const existing = items.find(i => i.product.id_prod === product.id_prod);
      if (existing) {
        return items.map(i =>
          i.product.id_prod === product.id_prod
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...items, { product, quantity: 1 }];
    });
    this._save();

    // Show toast instead of opening drawer
    this.toastProductName.set(product.name);
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toastProductName.set(null), 2500);
  }

  remove(productId: number): void {
    this._items.update(items => items.filter(i => i.product.id_prod !== productId));
    this._save();
  }

  updateQty(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this._items.update(items =>
      items.map(i =>
        i.product.id_prod === productId ? { ...i, quantity } : i
      )
    );
    this._save();
  }

  clear(): void {
    this._items.set([]);
    this._save();
  }

  private _save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items()));
    } catch {
      // localStorage not available
    }
  }

  private _load(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }
}
