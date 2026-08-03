import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPencil, heroTrash, heroPlus, heroExclamationTriangle, heroEye, heroEyeSlash } from '@ng-icons/heroicons/outline';
import { ProductsAdminService } from '../../services/products-admin.service';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import type { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [RouterLink, NgIconComponent, PricePipe],
  providers: [provideIcons({ heroPencil, heroTrash, heroPlus, heroExclamationTriangle, heroEye, heroEyeSlash })],
  templateUrl: './products.component.html',
})
export class AdminProductsComponent implements OnInit {
  private readonly service = inject(ProductsAdminService);

  products = signal<Product[]>([]);
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  deleting = signal<number | null>(null);

  async ngOnInit() {
    await this.loadProducts();
  }

  async loadProducts() {
    this.loading.set(true);
    try {
      this.products.set(await this.service.getAll());
    } catch (e: any) {
      this.errorMsg.set(e.message);
    }
    this.loading.set(false);
  }

  async toggleActive(product: Product) {
    try {
      await this.service.update(product.id_prod, { is_active: !product.is_active });
      await this.loadProducts();
    } catch (e: any) {
      this.errorMsg.set(e.message);
    }
  }

  async deleteProduct(id: number) {
    if (!confirm('¿Eliminar este producto?')) return;
    this.deleting.set(id);
    this.errorMsg.set(null);
    try {
      await this.service.delete(id);
      this.successMsg.set('Producto eliminado.');
      await this.loadProducts();
      setTimeout(() => this.successMsg.set(null), 3000);
    } catch (e: any) {
      this.errorMsg.set(e.message);
    }
    this.deleting.set(null);
  }
}
