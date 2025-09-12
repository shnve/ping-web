import { MaritimeServiceInfosourceRecipient } from '@app/models/maritime-service.model';
import { default as formatDate } from 'date-fns/format';
import { Observable } from 'rxjs';
import { AbstractGeoregulationApi } from '../api/abstract-georegulation.api';
import { GeoregulationsMapApiParams } from '../api/georegulation.api';
import { GeoregulationDisplayType, GeoregulationMapFilterValues } from '../models/georegulation-filters.model';
import { GeoregulationType, JsonGeoregulationModalDetails, MapGeoregulation } from '../models/georegulation.model';

export abstract class AbstractGeoregulationService {

  constructor(protected readonly georegulationApi: AbstractGeoregulationApi) { }

  abstract getModalDetails$(id: string): Observable<JsonGeoregulationModalDetails>;

  abstract getMapGeoregulations$(georegulationType: GeoregulationType, issuingServiceId: string): Observable<MapGeoregulation[]>;

  abstract publish$(id: string): Observable<void>;

  abstract repeal$(id: string): Observable<void>;

  abstract getRecipients$(id: string): Observable<MaritimeServiceInfosourceRecipient[]>;

  abstract send$(id: string, recipientIds: string[]): Observable<void>;

  abstract delete$(id: string): Observable<void>;

  abstract clone$(id: string, clonedGeoregulationNumberText: string): Observable<string>;

  getFilteredMapGeoregulations$(filter?: GeoregulationMapFilterValues): Observable<MapGeoregulation[]> {
    return this.georegulationApi.getFilteredMapGeoregulations$(AbstractGeoregulationService.convertMapFilterToRequestParams(filter));
  }

  downloadGeometries$(georegulationId: string, format: string, lang = 'fr'): Observable<Blob> {
    return this.georegulationApi.downloadGeometries$(georegulationId, format, lang);
  }

  protected static convertMapFilterToRequestParams(filter: GeoregulationMapFilterValues): GeoregulationsMapApiParams {
    if (!filter) { return null; }
    const params: GeoregulationsMapApiParams = {};

    params.permanent = filter.displayTypes?.includes(GeoregulationDisplayType.PERMANENT);
    params.temporary = filter.displayTypes?.includes(GeoregulationDisplayType.TEMPORARY);
    params.allTerritorialSea = filter.displayTypes?.includes(GeoregulationDisplayType.ALL_TERRITORIAL_SEA);
    params.notAllTerritorialSea = filter.displayTypes?.includes(GeoregulationDisplayType.NOT_ALL_TERRITORIAL_SEA);
    params.seasonalPeriod = filter.displayTypes?.includes(GeoregulationDisplayType.SEASONAL_PERIOD);
    params.notSeasonalPeriod = filter.displayTypes?.includes(GeoregulationDisplayType.NOT_SEASONAL_PERIOD);

    if (filter.concernedActivities?.length) {
      params.concernedActivities = filter.concernedActivities.join(',');
    }

    if (filter.period?.startDate) {
      params.dateStart = formatDate(filter.period.startDate, 'yyyy-MM-dd');
    }

    if (filter.period?.endDate) {
      params.dateEnd = formatDate(filter.period.endDate, 'yyyy-MM-dd');
    }

    if (filter.publishDate) {
      params.publishedFromIncludingDate = formatDate(filter.publishDate, 'yyyy-MM-dd');
    }
    return params;
  }
}
