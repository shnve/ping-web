import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

/**
 * PISAC (F5): estado vacío / mensaje informativo dentro de una página.
 * Sustituye a los `p-messages` de "No hay serie / zona seleccionada" (fuente de 1.5rem).
 *
 * Uso:
 * ```html
 * <pisac-empty-state icon="pi pi-filter" title="table.no-serie-selected" message="clave.o.texto">
 *   <button pButton label="..."></button>   <!-- acciones opcionales -->
 * </pisac-empty-state>
 * ```
 * - `severity`: `info` (marino, por defecto) o `warn` (naranja).
 * - `compact`: versión en línea, sin el bloque central grande.
 * `title` y `message` pasan por el pipe `translate` (clave o texto literal).
 */
@Component({
  selector: 'pisac-empty-state',
  templateUrl: './pisac-empty-state.component.html',
  styleUrls: ['./pisac-empty-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PisacEmptyStateComponent {
  @Input() icon = 'pi pi-info-circle';
  /** Evita que el atributo estático `title` del host muestre la clave como tooltip nativo. */
  @HostBinding('attr.title') readonly hostTitle = null;
  @Input() title: string;
  @Input() message: string;
  @Input() severity: 'info' | 'warn' = 'info';
  @Input() compact = false;
}
