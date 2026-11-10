import {
  Component, ContentChild, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef
} from '@angular/core';

const MOBILE_BREAKPOINT = 768;

/** Claves de traducción del panel (título, buscador, estados vacíos y botones de plegar/desplegar). */
export interface MapListPanelLabels {
  title: string;
  search: string;
  collapse: string;
  expand: string;
  empty: string;
  noResults: string;
}

/**
 * PISAC (F4, visor "map-first"): panel lateral plegable y genérico con la lista de elementos visibles
 * en el mapa (avisos, regulaciones...). Incluye buscador, contador, estado plegado guardado en
 * `localStorage` y una pestaña flotante para reabrirlo. El contenido de cada tarjeta lo define quien
 * usa el panel mediante un `<ng-template let-item>` proyectado.
 */
@Component({
  selector: 'shared-map-list-panel',
  templateUrl: './map-list-panel.component.html',
  styleUrls: ['./map-list-panel.component.scss']
})
export class MapListPanelComponent<T extends { id: string }> implements OnInit, OnChanges {
  @Input() items: T[] = [];
  @Input() selectedId: string;
  @Input() labels: MapListPanelLabels;
  /** Clave de `localStorage` para recordar si el panel está plegado (una por vista). */
  @Input() storageKey = 'pisac.mapPanel.collapsed';
  /** Texto en el que se busca para cada elemento. */
  @Input() searchTextFn: (item: T) => string = () => '';
  /** Orden de la lista (por defecto, el que llega). */
  @Input() sortFn: (a: T, b: T) => number;
  @Output() itemSelected = new EventEmitter<T>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  @ContentChild(TemplateRef) cardTemplate: TemplateRef<{ $implicit: T }>;

  @HostBinding('class.collapsed') collapsed = false;

  searchText = '';
  filteredItems: T[] = [];

  ngOnInit(): void {
    const stored = localStorage.getItem(this.storageKey);
    this.collapsed = stored !== null ? stored === 'true' : window.innerWidth < MOBILE_BREAKPOINT;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.items || changes.sortFn || changes.searchTextFn) {
      this.applyFilter();
    }
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
    localStorage.setItem(this.storageKey, String(this.collapsed));
    this.collapsedChange.emit(this.collapsed);
  }

  applyFilter(): void {
    const query = this.normalize(this.searchText);
    const sorted = this.sortFn ? [...(this.items ?? [])].sort(this.sortFn) : [...(this.items ?? [])];
    this.filteredItems = query
      ? sorted.filter(item => this.normalize(this.searchTextFn(item)).includes(query))
      : sorted;
  }

  select(item: T): void {
    this.itemSelected.emit(item);
  }

  trackById(_index: number, item: T): string {
    return item.id;
  }

  private normalize(text: string): string {
    return (text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
