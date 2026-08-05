import type { CartItem } from '../../core/models/cart-item.model';
import { whatsappConfig } from '../../core/config/whatsapp.config';

/**
 * Builds a WhatsApp wa.me link with a prellenado order message.
 */
export function buildWhatsAppLink(items: CartItem[]): string {
  const lines = items.map(item => {
    const price = formatARS(item.product.price);
    return `• ${item.product.name} x${item.quantity} — ${price} c/u`;
  });

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const message = [
    '¡Hola! Quiero hacer el siguiente pedido:',
    '',
    ...lines,
    '',
    `TOTAL APROX: ${formatARS(total)}`,
    '',
    '¿Podemos coordinar los detalles?',
  ].join('\n');

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${whatsappConfig.ownerNumber}?text=${encoded}`;
}

function formatARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
}
