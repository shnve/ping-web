import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapWarning } from '@app/models/warning.model';
import { MapListPanelLabels } from '@app/shared/components/map-list-panel/map-list-panel.component';
import { translatedTypeDetails } from '@app/shared/ui-utils';
import { TranslateService } from '@ngx-translate/core';

/**
 * PISAC (F4, visor "map-first"): lista de avisos visibles en el mapa.
 * Usa el panel genérico `shared-map-list-panel` y solo define el contenido de cada tarjeta.
 * Al elegir un aviso se centra el mapa y se abre su detalle.
 */
@Component({
  selector: 'app-warning-list-panel',
  templateUrl: './warning-list-panel.component.html',
  styleUrls: ['./warning-list-panel.component.scss']
})
export class WarningListPanelComponent {
  @Input() warnings: MapWarning[] = [];
  @Input() selectedWarningId: string;
  @Output() warningSelected = new EventEmitter<MapWarning>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  readonly labels: MapListPanelLabels = {
    title: 'map-panel.title',
    search: 'map-panel.search',
    collapse: 'map-panel.collapse',
    expand: 'map-panel.expand',
    empty: 'map-panel.empty',
    noResults: 'map-panel.no-results'
  };

  readonly sortFn = (a: MapWarning, b: MapWarning): number =>
    (b.year ?? 0) - (a.year ?? 0) || (b.warningNumber ?? 0) - (a.warningNumber ?? 0);

  readonly searchTextFn = (warning: MapWarning): string =>
    `${warning.nameOfSeries} ${warning.warningNumber}/${String(warning.year ?? '').slice(2)} ${this.typeDetails(warning)}`;

  constructor(private readonly translate: TranslateService) { }

  typeDetails(warning: MapWarning): string {
    return warning.warningTypeDetails ? translatedTypeDetails(this.translate, warning.warningTypeDetails) : '';
  }
}
