import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  Renderer2,
} from '@angular/core';
import { getDriveImageCandidates, DRIVE_IMAGE_PLACEHOLDER } from '../../utils/drive-image.util';

/**
 * Directiva para mostrar imágenes de Google Drive (o cualquier URL)
 * con reintentos automáticos y fallback a placeholder.
 *
 * Uso:
 *   <img [appDriveImage]="producto.image_url_mobile" alt="Producto" />
 *
 * - Genera las URLs candidatas y pone la primera como src.
 * - Si falla (error), prueba la siguiente en la lista.
 * - Si fallan todas, muestra el placeholder.
 * - Agrega referrerpolicy="no-referrer" (Drive a veces bloquea sin esto).
 * - Reinicia los intentos cada vez que cambia la URL de entrada.
 */
@Directive({
  selector: '[appDriveImage]',
  standalone: true,
})
export class DriveImageDirective implements OnChanges {
  /** Link original que pegó el usuario (puede ser cualquier formato de Drive). */
  @Input({ required: true }) appDriveImage!: string | null | undefined;

  /** Lista de URLs candidatas para el link actual. */
  private candidates: string[] = [];
  /** Índice de la candidata que se está intentando actualmente. */
  private currentIndex = 0;
  /** Indica si ya se llegó al placeholder para evitar bucles infinitos. */
  private showingPlaceholder = false;

  constructor(
    private readonly el: ElementRef<HTMLImageElement>,
    private readonly renderer: Renderer2,
  ) {
    // Agregar referrerpolicy para evitar bloqueos de Drive
    this.renderer.setAttribute(this.el.nativeElement, 'referrerpolicy', 'no-referrer');
  }

  ngOnChanges(): void {
    this.reset();
  }

  /** Reinicia el estado y carga la primera candidata. */
  private reset(): void {
    this.candidates = getDriveImageCandidates(this.appDriveImage);
    this.currentIndex = 0;
    this.showingPlaceholder = false;

    if (this.candidates.length === 0) {
      // URL vacía o null: mostrar placeholder directamente
      this.setPlaceholder();
    } else {
      this.setSrc(this.candidates[0]);
    }
  }

  /** Maneja el evento error del <img>: intenta la siguiente candidata. */
  @HostListener('error')
  onError(): void {
    // No reintentar si ya estamos mostrando el placeholder
    if (this.showingPlaceholder) return;

    this.currentIndex++;

    if (this.currentIndex < this.candidates.length) {
      // Hay más candidatas: probar la siguiente
      this.setSrc(this.candidates[this.currentIndex]);
    } else {
      // Todas fallaron: mostrar placeholder
      this.setPlaceholder();
    }
  }

  private setSrc(url: string): void {
    this.renderer.setAttribute(this.el.nativeElement, 'src', url);
  }

  private setPlaceholder(): void {
    this.showingPlaceholder = true;
    this.setSrc(DRIVE_IMAGE_PLACEHOLDER);
  }
}
