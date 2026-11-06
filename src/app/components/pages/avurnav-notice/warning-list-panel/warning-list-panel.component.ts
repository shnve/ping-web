import { Component, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MapWarning } from '@app/models/warning.model';
import { translatedTypeDetails } from '@app/shared/ui-utils';
import { TranslateService } from '@ngx-translate/core';

const COLLAPSED_STORAGE_KEY = 'pisac.mapPanel.collapsed';
const MOBILE_BREAKPOINT = 768;

/**
 * PISAC (F4, visor "map-first"): panel lateral con la lista de avisos visibles en el mapa.
 * La lista se sincroniza con el mapa: al elegir un aviso se centra el mapa y se abre su detalle.
 */
@Component({
  selector: 'app-warning-list-panel',
  templateUrl: './warning-list-panel.component.html',
  styleUrls: ['./warning-list-panel.component.scss']
})
export class WarningListPanelComponent implements OnInit, OnChanges {
  @Input() warnings: MapWarning[] = [];
  @Input() selectedWarningId: string;
  @Output() warningSelected = new EventEmitter<MapWarning>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  @HostBinding('class.collapsed') collapsed = false;

  searchText = '';
  filteredWarnings: MapWarning[] = [];

  constructor(private readonly translate: TranslateService) { }

  ngOnInit(): void {
    const stored = localStorage.getItem(COLLAPSED_STORAGE_KEY);
    this.collapsed = stored !== null ? stored === 'true' : window.innerWidth < MOBILE_BREAKPOINT;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.warnings) {
      this.applyFilter();
    }
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(this.collapsed));
    this.collapsedChange.emit(this.collapsed);
  }

  applyFilter(): void {
    const query = this.normalize(this.searchText);
    const sorted = [...(this.warnings ?? [])].sort((a, b) =>
      (b.year ?? 0) - (a.year ?? 0) || (b.warningNumber ?? 0) - (a.warningNumber ?? 0));
    this.filteredWarnings = query
      ? sorted.filter(warning => this.normalize(this.searchableText(warning)).includes(query))
      : sorted;
  }

  select(warning: MapWarning): void {
    this.warningSelected.emit(warning);
  }

  typeDetails(warning: MapWarning): string {
    return warning.warningTypeDetails ? translatedTypeDetails(this.translate, warning.warningTypeDetails) : '';
  }

  trackById(_index: number, warning: MapWarning): string {
    return warning.id;
  }

  private searchableText(warning: MapWarning): string {
    return `${warning.nameOfSeries} ${warning.warningNumber}/${String(warning.year ?? '').slice(2)} ${this.typeDetails(warning)}`;
  }

  private normalize(text: string): string {
    return (text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
