import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * PISAC (F5): tarjeta de contenido con título opcional numerado (estilo Cartografía).
 *
 * Uso:
 * ```html
 * <pisac-card title="clave.o.texto" [step]="1">
 *   <div card-actions>...botones a la derecha del título...</div>
 *   ...contenido...
 * </pisac-card>
 * ```
 * - `step`: número (o texto corto) que se muestra en un círculo marino antes del título.
 * - `icon`: clase de icono (p. ej. `pi pi-server`) si no hay `step`.
 * - `subtitle`: texto secundario bajo el título.
 * `title` y `subtitle` pasan por el pipe `translate` (clave o texto literal).
 */
@Component({
  selector: 'pisac-card',
  templateUrl: './pisac-card.component.html',
  styleUrls: ['./pisac-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PisacCardComponent {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() step: number | string;
  @Input() icon: string;
}
