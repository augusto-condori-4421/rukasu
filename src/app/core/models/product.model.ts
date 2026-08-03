export interface Product {
  id_prod: number;
  cat_id: number;
  name: string;
  description: string;
  price: number;
  stock?: number | null;
  image_url_desktop: string;
  image_url_mobile: string;
  is_active: boolean;
}

/** Lightweight projection for catalog listing */
export interface ProductListItem
  extends Pick<Product, 'id_prod' | 'cat_id' | 'name' | 'price' | 'image_url_mobile' | 'image_url_desktop'> {}
