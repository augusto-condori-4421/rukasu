import { Component, input, output, computed } from '@angular/core';
import type { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  templateUrl: './category-filter.component.html',
})
export class CategoryFilterComponent {
  readonly categories = input.required<Category[]>();
  readonly selected = input<number | null>(null);
  readonly selectionChange = output<number | null>();

  select(id: number | null) {
    this.selectionChange.emit(id);
  }
}
