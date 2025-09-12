import { Injectable } from '@angular/core';
import { SerieType } from '@app/models/serie.model';
import { default as formatDate } from 'date-fns/format';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarningApi, WarningsMapApiParams } from '../api/warning.api';
import { WarningFactory } from '../core/warning/warning.factory';
import { MapFilterValues } from '../models/warning-filters.model';
import { GlobalWarningType, JsonMapWarning, JsonWarning, MapWarning } from '../models/warning.model';
import { WarningsState } from '../states/warnings.state';

@Injectable({
  providedIn: 'root'
})
export class MapWarningsFacade {
  constructor(private readonly warningApi: WarningApi,
    private readonly warningsState: WarningsState,
    private readonly warningFactory: WarningFactory) { }

  getFiltredMapWarnings$(filter?: MapFilterValues): Observable<MapWarning[]> {
    return this.warningApi.getMapWarnings$(
      filter ?
        MapWarningsFacade.convertFilterToRequestParams(filter) : null
    ).pipe(
      // Convert JsonMapWarnings to MapWarnings
      map<JsonMapWarning[], MapWarning[]>(warningsJson => {
        const warnings = this.convertJsonWarningsToWarnings(warningsJson);
        this.warningsState.setFilteredMapWarnings(warnings);
        return warnings;
      })
    );
  }

  getFilteredMapWarningsBySerie$(serieId: string) {
    return this.warningApi.getMapWarningsBySerie$(serieId)
      .pipe(map<JsonMapWarning[], MapWarning[]>(
        warningsJson => this.convertJsonWarningsToWarnings(warningsJson)
      ));
  }

  static convertFilterToRequestParams(filter: MapFilterValues): WarningsMapApiParams {
    const params: WarningsMapApiParams = {};

    const globalWarningType = filter.displayTypes?.filter(type => type in GlobalWarningType);
    const serieType = filter.displayTypes?.filter(type => type in SerieType);

    if (filter.period?.startDate) {
      params.dateStart = formatDate(filter.period.startDate, 'yyyy-MM-dd');
    }
    if (filter.period?.endDate) {
      params.dateEnd = formatDate(filter.period.endDate, 'yyyy-MM-dd');
    }
    if (filter.publishDate) {
      params.publishedFromIncludingDate = formatDate(filter.publishDate, 'yyyy-MM-dd');
    }
    if (globalWarningType?.length) {
      params.globalWarningType = globalWarningType.join(',');
    }
    if (serieType?.length) {
      params.serieType = serieType.join(',');
    }
    return params;
  }

  private convertJsonWarningsToWarnings(warningsJson: JsonMapWarning[]): MapWarning[] {
    return warningsJson.map(this.warningFactory.create.bind(this.warningFactory) as () => MapWarning);
  }

  getWarningById$(warningId: string): Observable<JsonWarning> {
    return this.warningApi.getWarningById$(warningId);
  }
}
