import { Injectable } from '@angular/core';
import { SeriesApi } from '@app/api/series.api';
import { Serie } from '@app/models/serie.model';
import { BehaviorSubject } from 'rxjs';

/**
 * PISAC: nombres internacionales (inglés) de las series. Los avisos solo traen el nombre de la serie en español
 * (nameOfSeries); con este índice se muestra el nombre en inglés cuando la interfaz está en inglés.
 * Se carga una sola vez (GET api/series, público) la primera vez que se pide un nombre.
 */
@Injectable({
  providedIn: 'root'
})
export class SerieNamesService {
  /** Cambia al terminar la carga, para que los pipes impuros vuelvan a pintar */
  readonly loaded$ = new BehaviorSubject<boolean>(false);

  private readonly internationalNames = new Map<string, string>();
  private loading = false;

  constructor(private readonly seriesApi: SeriesApi) { }

  /** Nombre de la serie en el idioma indicado; si no hay nombre internacional, el nombre en español. */
  getName(nameOfSeries: string, lang: string): string {
    if (!nameOfSeries || lang === 'es') {
      return nameOfSeries;
    }
    this.load();
    return this.internationalNames.get(SerieNamesService.key(nameOfSeries)) || nameOfSeries;
  }

  private load(): void {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.seriesApi.getAllSeries$().subscribe({
      next: series => {
        (series ?? []).forEach((serie: Serie) => {
          if (serie?.name && serie.internationalName?.trim()) {
            this.internationalNames.set(SerieNamesService.key(serie.name), serie.internationalName.trim());
          }
        });
        this.loaded$.next(true);
      },
      // Sin conexión con la API se muestran los nombres en español; se reintenta en la siguiente petición
      error: () => this.loading = false
    });
  }

  private static key(name: string): string {
    return name.trim().toUpperCase();
  }
}
