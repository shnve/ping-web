import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * PISAC (F5): envoltorio de campo de formulario. Etiqueta arriba, ayuda y error unificados
 * (sustituye a `span.field-validation-error`).
 *
 * Uso:
 * ```html
 * <pisac-field label="clave.o.texto" for="title" [required]="true" hint="clave.o.texto"
 *              error="clave.del.error" [control]="form.get('title')">
 *   <input pInputText id="title" formControlName="title" />
 * </pisac-field>
 * ```
 * - Sin `control`: el error se muestra siempre que `error` tenga valor (validación manejada fuera).
 * - Con `control`: el error se muestra solo si el control es inválido y fue tocado o modificado.
 * `label`, `hint` y `error` pasan por el pipe `translate` (clave o texto literal).
 */
@Component({
  selector: 'pisac-field',
  templateUrl: './pisac-field.component.html',
  styleUrls: ['./pisac-field.component.scss']
})
export class PisacFieldComponent {
  @Input() label: string;
  /** id del control para el atributo `for` de la etiqueta. */
  @Input() for: string;
  @Input() hint: string;
  @Input() error: string;
  @Input() required = false;
  @Input() control: AbstractControl | null;

  get showError(): boolean {
    if (!this.error) {
      return false;
    }
    return !this.control || (this.control.invalid && (this.control.touched || this.control.dirty));
  }

  get errorId(): string | null {
    return this.for ? `${this.for}-error` : null;
  }
}
