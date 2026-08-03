import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroSquares2x2, heroTag, heroArrowRight } from '@ng-icons/heroicons/outline';
import { ProductsAdminService } from '../../services/products-admin.service';
import { CategoriesAdminService } from '../../services/categories-admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgIconComponent],
  providers: [provideIcons({ heroSquares2x2, heroTag, heroArrowRight })],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly productsAdmin = inject(ProductsAdminService);
  private readonly categoriesAdmin = inject(CategoriesAdminService);

  totalProducts = signal(0);
  totalCategories = signal(0);
  loading = signal(true);

  async ngOnInit() {
    const [products, categories] = await Promise.all([
      this.productsAdmin.getAll(),
      this.categoriesAdmin.getAll(),
    ]);
    this.totalProducts.set(products.length);
    this.totalCategories.set(categories.length);
    this.loading.set(false);
  }
}
