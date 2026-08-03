import type { ProductListItem } from './product.model';

export interface CartItem {
  product: ProductListItem;
  quantity: number;
}
