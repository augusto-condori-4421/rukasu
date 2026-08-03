import {
  Component,
  input,
  output,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCloudArrowUp, heroPhoto, heroXMark } from '@ng-icons/heroicons/outline';

export type ImageVariant = 'desktop' | 'mobile';

export interface ImageResult {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [NgIconComponent],
  providers: [provideIcons({ heroCloudArrowUp, heroPhoto, heroXMark })],
  templateUrl: './image-uploader.component.html',
})
export class ImageUploaderComponent {
  readonly variant = input.required<ImageVariant>();
  readonly currentUrl = input<string>('');
  readonly imageChange = output<ImageResult | null>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  preview = signal<string | null>(null);
  isDragging = signal(false);

  get label() {
    return this.variant() === 'desktop' ? 'Imagen desktop (≥768px)' : 'Imagen mobile (<768px)';
  }

  get inputId() {
    return `file-input-${this.variant()}`;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  private async processFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    // Convert to WebP using canvas
    const webpFile = await this.toWebP(file);
    const previewUrl = URL.createObjectURL(webpFile);
    this.preview.set(previewUrl);
    this.imageChange.emit({ file: webpFile, previewUrl });
  }

  clear() {
    this.preview.set(null);
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
    this.imageChange.emit(null);
  }

  private toWebP(file: File): Promise<File> {
    return new Promise(resolve => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        // Limit max dimension
        const maxW = this.variant() === 'desktop' ? 1600 : 800;
        let { width, height } = img;
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url);
          const webpFile = new File([blob!], `${this.variant()}.webp`, { type: 'image/webp' });
          resolve(webpFile);
        }, 'image/webp', 0.88);
      };
      img.src = url;
    });
  }
}
