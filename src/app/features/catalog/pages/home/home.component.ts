import {
  Component,
  inject,
  signal,
  computed,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { CategoriesService } from '../../services/categories.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CategoryFilterComponent } from '../../components/category-filter/category-filter.component';
import { ProductDetailModalComponent } from '../../components/product-detail-modal/product-detail-modal.component';
import { CartDrawerComponent } from '../../../cart/components/cart-drawer/cart-drawer.component';
import { CartService } from '../../../cart/services/cart.service';
import { HeaderComponent } from '../../../../shared/ui/header/header.component';
import { FooterComponent } from '../../../../shared/ui/footer/footer.component';
import type { ProductListItem, Product } from '../../../../core/models/product.model';
import { getSubtreeIds } from '../../../../shared/utils/category-tree.util';
import AOS from 'aos';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    HeaderComponent,
    FooterComponent,
    ProductCardComponent,
    CategoryFilterComponent,
    ProductDetailModalComponent,
    CartDrawerComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, AfterViewInit {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  readonly cartService = inject(CartService);

  products = this.productsService.products;
  categories = this.categoriesService.categories;
  loadingProducts = this.productsService.loading;
  loadingCategories = this.categoriesService.loading;

  selectedCategory = signal<number | null>(null);
  selectedProduct = signal<Product | null>(null);
  searchQuery = signal('');

  filteredProducts = computed(() => {
    let list = this.products();
    const cat = this.selectedCategory();
    const q = this.searchQuery().trim().toLowerCase();

    if (cat !== null) {
      // Include products from the selected category AND all its descendants
      const subtreeIds = new Set(getSubtreeIds(cat, this.categories()));
      list = list.filter(p => subtreeIds.has(p.cat_id));
    }

    if (q) {
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    return list;
  });

  constructor() {
    AOS.init({
      duration: 750,
      easing: 'ease-out-cubic',
      once: true,
      offset: 0,
    });
  }

  async ngOnInit() {
    await Promise.all([
      this.productsService.load(),
      this.categoriesService.load(),
    ]);
    setTimeout(() => AOS.refresh(), 50);
  }

  ngAfterViewInit() {
    setTimeout(() => AOS.refresh(), 0);
  }

  async openDetail(product: ProductListItem) {
    // Fetch full product data for the modal
    const full = await this.productsService.getById(product.id_prod);
    if (full) this.selectedProduct.set(full);
  }

  closeDetail() {
    this.selectedProduct.set(null);
  }
}
