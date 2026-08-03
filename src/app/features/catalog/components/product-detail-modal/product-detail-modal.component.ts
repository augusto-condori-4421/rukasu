import {
  Component,
  input,
  output,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroXMark,
  heroPlus,
  heroMinus,
  heroShoppingCart,
} from '@ng-icons/heroicons/outline';
import type { Product } from '../../../../core/models/product.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { CartService } from '../../../cart/services/cart.service';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [NgIconComponent, PricePipe],
  providers: [provideIcons({ heroXMark, heroPlus, heroMinus, heroShoppingCart })],
  templateUrl: './product-detail-modal.component.html',
  animations: [
    trigger('backdrop', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms ease', style({ opacity: 1 }))]),
      transition(':leave', [animate('200ms ease', style({ opacity: 0 }))]),
    ]),
    trigger('panel', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(16px)' }),
        animate('250ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'scale(0.95) translateY(8px)' })),
      ]),
    ]),
  ],
})
export class ProductDetailModalComponent {
  readonly product = input.required<Product>();
  readonly close = output<void>();

  private readonly cart = inject(CartService);
  quantity = signal(1);

  isOutOfStock = computed(() => {
    const s = this.product().stock;
    return s !== null && s !== undefined && s <= 0;
  });

  incQty() { if (!this.isOutOfStock()) this.quantity.update(v => v + 1); }
  decQty() { if (this.quantity() > 1 && !this.isOutOfStock()) this.quantity.update(v => v - 1); }

  addToCart() {
    if (this.isOutOfStock()) return;
    for (let i = 0; i < this.quantity(); i++) {
      this.cart.add(this.product());
    }
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).id === 'modal-backdrop') {
      this.close.emit();
    }
  }
}
