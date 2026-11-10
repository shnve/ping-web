import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PisacCardComponent } from './card/pisac-card.component';
import { PisacEmptyStateComponent } from './empty-state/pisac-empty-state.component';
import { PisacFieldComponent } from './field/pisac-field.component';
import { PisacPageHeaderComponent } from './page-header/pisac-page-header.component';

/**
 * PISAC (F5): componentes base del sistema de diseño PISAC.
 * Lo reexporta `SharedModule`, así que está disponible en todos los módulos que lo importan.
 * Ver docs-internos/Plan_Accion_Rediseno_Visual_PISAC.md (F5.1).
 */
const COMPONENTS = [
  PisacPageHeaderComponent,
  PisacCardComponent,
  PisacEmptyStateComponent,
  PisacFieldComponent
];

@NgModule({
  declarations: COMPONENTS,
  imports: [CommonModule, TranslateModule.forChild()],
  exports: COMPONENTS
})
export class PisacUiModule { }
