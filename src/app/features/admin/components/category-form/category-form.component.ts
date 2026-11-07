import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroExclamationTriangle } from '@ng-icons/heroicons/outline';
import { CategoriesAdminService } from '../../services/categories-admin.service';
import { CategorySelectorComponent } from '../../../../shared/components/category-selector/category-selector.component';
import type { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIconComponent, CategorySelectorComponent],
  providers: [provideIcons({ heroArrowLeft, heroExclamationTriangle })],
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit {
  private readonly service = inject(CategoriesAdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEdit = signal(false);
  editId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  name = signal('');
  description = signal('');
  parentId = signal<number | null>(null);

  /** All categories — used to populate the parent selector */
  allCategories = signal<Category[]>([]);

  /** Name of the selected parent category, for the preview hint */
  parentName = computed(() => {
    const id = this.parentId();
    if (id == null) return null;
    return this.allCategories().find(c => c.id === id)?.name ?? null;
  });

  async ngOnInit() {
    // Load all categories for the parent selector
    this.allCategories.set(await this.service.getAll());

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editId.set(+id);
      this.loading.set(true);
      const cat = await this.service.getById(+id);
      if (cat) {
        this.name.set(cat.name);
        this.description.set(cat.description);
        this.parentId.set(cat.parent_id ?? null);
      }
      this.loading.set(false);
    }
  }

  async submit() {
    if (!this.name()) {
      this.errorMsg.set('El nombre es obligatorio.');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set(null);
    try {
      const payload = {
        name: this.name(),
        description: this.description(),
        parent_id: this.parentId() ?? null,
      };
      if (this.isEdit() && this.editId()) {
        await this.service.update(this.editId()!, payload);
      } else {
        await this.service.create(payload);
      }
      this.router.navigate(['/admin/categories']);
    } catch (e: any) {
      this.errorMsg.set(e.message);
    }
    this.saving.set(false);
  }
}
