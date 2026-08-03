import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'price', standalone: true })
export class PricePipe implements PipeTransform {
  transform(value: number, currency = 'ARS', locale = 'es-AR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
