import { Component, inject } from '@angular/core';
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
  heroTrash,
  heroShoppingBag,
} from '@ng-icons/heroicons/outline';
import { CartService } from '../../services/cart.service';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { buildWhatsAppLink } from '../../../../shared/utils/whatsapp.util';
import { DriveImageDirective } from '../../../../shared/ui/drive-image/drive-image.directive';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [NgIconComponent, PricePipe, DriveImageDirective],
  providers: [provideIcons({ heroXMark, heroPlus, heroMinus, heroTrash, heroShoppingBag })],
  templateUrl: './cart-drawer.component.html',
  animations: [
    trigger('backdrop', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms ease', style({ opacity: 1 }))]),
      transition(':leave', [animate('200ms ease', style({ opacity: 0 }))]),
    ]),
    trigger('drawer', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(0.4,0,0.2,1)', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('280ms cubic-bezier(0.4,0,0.2,1)', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
})
export class CartDrawerComponent {
  readonly cart = inject(CartService);

  sendToWhatsApp() {
    const link = buildWhatsAppLink(this.cart.items());
    window.open(link, '_blank', 'noopener');
    this.cart.clear();
    this.cart.closeCart();
  }
}
