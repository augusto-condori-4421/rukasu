import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroExclamationTriangle } from '@ng-icons/heroicons/outline';
import { CategoriesAdminService } from '../../services/categories-admin.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIconComponent],
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

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editId.set(+id);
      this.loading.set(true);
      const cat = await this.service.getById(+id);
      if (cat) {
        this.name.set(cat.name);
        this.description.set(cat.description);
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
      if (this.isEdit() && this.editId()) {
        await this.service.update(this.editId()!, { name: this.name(), description: this.description() });
      } else {
        await this.service.create({ name: this.name(), description: this.description() });
      }
      this.router.navigate(['/admin/categories']);
    } catch (e: any) {
      this.errorMsg.set(e.message);
    }
    this.saving.set(false);
  }
}
