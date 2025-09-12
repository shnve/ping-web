import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SeriesApi } from '../api/series.api';
import { Serie } from '../models/serie.model';

@Injectable({
  providedIn: 'root'
})
export class SeriesFacade {
  constructor(private readonly serieApi: SeriesApi) {}

  getSeriesByAreaId$(areaId: string): Observable<Serie[]> {
    return this.serieApi.getSeriesByAreaId$(areaId).pipe(
      map(series => (
          series.map(serie => {
            if (!serie.internationalName) {
              return {
                ...serie,
                internationalName: serie.name
              };
            }
            return serie;
          })
        )
      ));
  }
}
