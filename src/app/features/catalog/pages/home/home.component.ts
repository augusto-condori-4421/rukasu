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
import { HeaderComponent } from '../../../../shared/ui/header/header.component';
import { FooterComponent } from '../../../../shared/ui/footer/footer.component';
import type { ProductListItem, Product } from '../../../../core/models/product.model';
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
    if (cat !== null) {
      list = list.filter(p => p.cat_id === cat);
    }
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    return list;
  });

  async ngOnInit() {
    await Promise.all([
      this.productsService.load(),
      this.categoriesService.load(),
    ]);
    setTimeout(() => AOS.refresh(), 100);
  }

  ngAfterViewInit() {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
    });
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
