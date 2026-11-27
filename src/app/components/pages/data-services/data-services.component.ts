import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataServiceSerie, SeriesApi } from '@app/api/series.api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

/** Una serie con sus accesos por idioma, ya armados para la tabla. */
export interface DataServiceRow {
  name: string;
  internationalName: string;
  accesses: Array<{ lang: string; restUrl: string; secomId: string }>;
}

/**
 * PISAC: página pública «Servicios de datos» (/static/data-services). Sustituye a la página estática del mismo nombre:
 * la tabla de series se arma con las series S-124 del sistema (GET api/series/s124), así que una serie nueva aparece
 * sola. Las direcciones son relativas: sirven en cualquier servidor siempre que Nginx publique /nw y /secom.
 */
@Component({
  selector: 'app-data-services',
  templateUrl: './data-services.component.html',
  styleUrls: ['./data-services.component.scss']
})
export class DataServicesComponent implements OnInit, OnDestroy {
  /** Versión de la API REST S-124 que se enlaza (v2 = S-124 edición 2.0.0) */
  static readonly REST_VERSION = 'v2';

  rows: DataServiceRow[] = [];
  state: 'loading' | 'ready' | 'error' = 'loading';
  copiedId: string | null = null;

  readonly ihoRegistryUrl = 'https://registry.iho.int/productspec/list.do';
  readonly contactEmail = 'shnayunav@shn.gob.ve';

  private subscription: Subscription;
  private copiedTimer: ReturnType<typeof setTimeout>;

  constructor(
    private readonly seriesApi: SeriesApi,
    private readonly translate: TranslateService
  ) { }

  get swaggerUrl(): string {
    const lang = this.translate.currentLang === 'en' ? 'en' : 'es';
    return `/swagger-ui/index.html?lang=${lang}`;
  }

  ngOnInit(): void {
    this.subscription = this.seriesApi.getS124Series$().subscribe({
      next: series => {
        this.rows = (series ?? []).map(serie => DataServicesComponent.toRow(serie));
        this.state = 'ready';
      },
      error: () => this.state = 'error'
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    clearTimeout(this.copiedTimer);
  }

  /** Copia el identificador SECOM. El portal puede ir por http (sin API de portapapeles): se usa el método clásico. */
  copy(text: string): void {
    const done = () => {
      this.copiedId = text;
      clearTimeout(this.copiedTimer);
      this.copiedTimer = setTimeout(() => this.copiedId = null, 2000);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => this.copyWithTextarea(text) && done());
    } else if (this.copyWithTextarea(text)) {
      done();
    }
  }

  private copyWithTextarea(text: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    document.body.removeChild(textarea);
    return copied;
  }

  /** Mismas reglas que el backend: SecomService (instancia = nombre en minúsculas con _ + _idioma) y S124Controller. */
  static toRow(serie: DataServiceSerie): DataServiceRow {
    const instanceBase = serie.name.toLowerCase().replace(/ /g, '_');
    return {
      name: serie.name,
      internationalName: serie.internationalName,
      accesses: (serie.languages ?? []).map(lang => ({
        lang,
        restUrl: `/nw/${DataServicesComponent.REST_VERSION}/Get_NW_Messages?nameOfSeries=${encodeURIComponent(serie.name)}&lang=${lang}`,
        secomId: `${instanceBase}_${lang}`
      }))
    };
  }
}
