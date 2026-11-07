import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroExclamationTriangle } from '@ng-icons/heroicons/outline';
import { ProductsAdminService } from '../../services/products-admin.service';
import { CategoriesAdminService } from '../../services/categories-admin.service';
import { ImageUploaderComponent, type ImageResult } from '../image-uploader/image-uploader.component';
import { CategorySelectorComponent } from '../../../../shared/components/category-selector/category-selector.component';
import type { Category } from '../../../../core/models/category.model';
import { getDriveImageCandidates } from '../../../../shared/utils/drive-image.util';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIconComponent, ImageUploaderComponent, CategorySelectorComponent],
  providers: [provideIcons({ heroArrowLeft, heroExclamationTriangle })],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  private readonly productsService = inject(ProductsAdminService);
  private readonly categoriesService = inject(CategoriesAdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEdit = signal(false);
  editId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  errorMsg = signal<string | null>(null);
  categories = signal<Category[]>([]);

  // Form fields
  name = signal('');
  description = signal('');
  price = signal<number | null>(null);
  stock = signal<number | null>(null);
  catId = signal<number | null>(null);
  isActive = signal(true);

  // Image handling
  /** Existing URLs from DB (for edit mode) */
  existingDesktopUrl = signal('');
  existingMobileUrl = signal('');
  /** New files to upload */
  desktopFile = signal<File | null>(null);
  mobileFile = signal<File | null>(null);
  /** URL externas (alternativa a subida de archivo) */
  desktopExternalUrl = signal('');
  mobileExternalUrl = signal('');
  useExternalDesktop = signal(true);
  useExternalMobile = signal(true);

  async ngOnInit() {
    // Load categories first
    this.categories.set(await this.categoriesService.getAll());

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editId.set(+id);
      this.loading.set(true);
      const prod = await this.productsService.getById(+id);
      if (prod) {
        this.name.set(prod.name);
        this.description.set(prod.description);
        this.price.set(prod.price);
        this.stock.set(prod.stock ?? null);
        this.catId.set(prod.cat_id);
        this.isActive.set(prod.is_active);
        this.existingDesktopUrl.set(prod.image_url_desktop);
        this.existingMobileUrl.set(prod.image_url_mobile);
        // Pre-fill the single URL field with the existing image URL
        this.desktopExternalUrl.set(prod.image_url_desktop || prod.image_url_mobile);
      }
      this.loading.set(false);
    }
  }

  onDesktopImageChange(result: ImageResult | null) {
    this.desktopFile.set(result?.file ?? null);
  }

  onMobileImageChange(result: ImageResult | null) {
    this.mobileFile.set(result?.file ?? null);
  }

  async submit() {
    if (!this.name() || !this.price() || !this.catId()) {
      this.errorMsg.set('Nombre, precio y categoría son obligatorios.');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set(null);

    try {
      // Resolve image URLs — single URL used for both desktop and mobile
      const rawUrl = this.desktopExternalUrl() || this.existingDesktopUrl();
      const candidates = getDriveImageCandidates(rawUrl);
      const resolvedUrl = candidates[0] ?? rawUrl;
      let desktopUrl = resolvedUrl;
      let mobileUrl = resolvedUrl;

      if (this.isEdit() && this.editId()) {
        // Update record first to get valid ID
        await this.productsService.update(this.editId()!, {
          name: this.name(),
          description: this.description(),
          price: this.price()!,
          stock: this.stock(),
          cat_id: this.catId()!,
          is_active: this.isActive(),
          image_url_desktop: desktopUrl,
          image_url_mobile: mobileUrl,
        });

        // Upload new files if provided
        if (this.desktopFile() && !this.useExternalDesktop()) {
          desktopUrl = await this.productsService.uploadImage(this.editId()!, this.desktopFile()!, 'desktop');
        }
        if (this.mobileFile() && !this.useExternalMobile()) {
          mobileUrl = await this.productsService.uploadImage(this.editId()!, this.mobileFile()!, 'mobile');
        }

        // Update again with final URLs if they changed
        if (desktopUrl !== this.existingDesktopUrl() || mobileUrl !== this.existingMobileUrl()) {
          await this.productsService.update(this.editId()!, {
            image_url_desktop: desktopUrl,
            image_url_mobile: mobileUrl,
          });
        }
      } else {
        // Create new
        const created = await this.productsService.create({
          name: this.name(),
          description: this.description(),
          price: this.price()!,
          stock: this.stock(),
          cat_id: this.catId()!,
          is_active: this.isActive(),
          image_url_desktop: desktopUrl,
          image_url_mobile: mobileUrl,
        });

        // Upload images with the new product ID
        if (this.desktopFile() && !this.useExternalDesktop()) {
          desktopUrl = await this.productsService.uploadImage(created.id_prod, this.desktopFile()!, 'desktop');
        }
        if (this.mobileFile() && !this.useExternalMobile()) {
          mobileUrl = await this.productsService.uploadImage(created.id_prod, this.mobileFile()!, 'mobile');
        }

        if (desktopUrl || mobileUrl) {
          await this.productsService.update(created.id_prod, {
            image_url_desktop: desktopUrl,
            image_url_mobile: mobileUrl,
          });
        }
      }

      this.router.navigate(['/admin/products']);
    } catch (e: any) {
      this.errorMsg.set(e.message);
    }

    this.saving.set(false);
  }
}
