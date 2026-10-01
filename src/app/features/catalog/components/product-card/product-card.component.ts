import { Component, input, output, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPlus, heroEye } from '@ng-icons/heroicons/outline';
import type { ProductListItem } from '../../../../core/models/product.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { CartService } from '../../../cart/services/cart.service';
import { DriveImageDirective } from '../../../../shared/ui/drive-image/drive-image.directive';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [NgIconComponent, PricePipe, DriveImageDirective],
  providers: [provideIcons({ heroPlus, heroEye })],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  readonly product = input.required<ProductListItem>();
  readonly openDetail = output<ProductListItem>();

  private readonly cart = inject(CartService);

  addToCart(event: Event) {
    event.stopPropagation();
    this.cart.add(this.product());
  }

  viewDetail() {
    this.openDetail.emit(this.product());
  }
}
