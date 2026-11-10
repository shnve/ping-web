import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * PISAC (F5): cabecera de página.
 * Generaliza la cabecera de Cartografía: icono, título, subtítulo y acciones a la derecha.
 *
 * Uso:
 * ```html
 * <pisac-page-header icon="pi pi-compass" title="clave.o.texto" subtitle="clave.o.texto">
 *   <button actions pButton label="Actualizar"></button>
 * </pisac-page-header>
 * ```
 * `title` y `subtitle` pasan por el pipe `translate`: aceptan claves de traducción o texto literal.
 * `variant`: `gradient` (marino con franja naranja, para pantallas principales) o `light` (listas y
 * formularios de administración).
 */
@Component({
  selector: 'pisac-page-header',
  templateUrl: './pisac-page-header.component.html',
  styleUrls: ['./pisac-page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PisacPageHeaderComponent {
  @Input() icon: string;
  @Input() title: string;
  @Input() subtitle: string;
  @Input() variant: 'gradient' | 'light' = 'gradient';
}
