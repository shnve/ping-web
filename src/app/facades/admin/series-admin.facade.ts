import { Injectable } from '@angular/core';
import { SeriesAdminApi } from '@app/api/admin/series-admin.api';
import { AuthService } from '@app/auth/auth.service';
import { ServiceRole } from '@app/models/pro-user.model';
import { Serie } from '@app/models/serie.model';
import { SeriesAdminState } from '@app/states/admin/series-admin.state';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeriesAdminFacade {
  constructor(private readonly seriesAdminApi: SeriesAdminApi,
              private readonly seriesAdminState: SeriesAdminState,
              private readonly authService: AuthService
    ) {}

  /**
   * Get series for a specific service id
   * @param serviceIds 
   * @param options.refresh : false - Get from state if it exists, or from server api if not
   *                        : true - Allways gets data from server api
   * @returns 
   */
  getSeriesByServiceIds$(serviceIds: string[], options: { refresh: boolean } = { refresh: false }): Observable<Serie[]> {
    if (!options.refresh && this.seriesAdminState.isLoaded()) {
      return this.seriesAdminState.getSeries$();
    }
    return this.seriesAdminApi.getSeriesByServiceIds$(serviceIds).pipe(
      map(series => this.mapSeries(series)),
      tap((series: Serie[]) => this.seriesAdminState.setSeries(series))
    );
  }

  getSeriesForCurrentService$(serviceId: string): Observable<Serie[]> {
    return this.seriesAdminApi.getSeriesByServiceIds$([serviceId]);
  }

  getSeriesWithOperatorOrAdminRole$(): Observable<Serie[]> {
    const serviceIds = this.authService.getAuthenticatedUser()?.serviceRoles
      ?.filter(roles => [ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN].includes(roles.serviceRole))
      .map(serviceRole => serviceRole.serviceId);
    return this.seriesAdminApi.getSeriesByServiceIds$(serviceIds);
  }

  isWarningNumberAvailable$(serieId: string, warningNumber: number, year: number): Observable<boolean> {
    return this.seriesAdminApi.isWarningNumberAvailable$(serieId, warningNumber, year);
  }

  nextAvailableNumber$(serieId: string, year: number): Observable<number> {
    return this.seriesAdminApi.nextAvailableNumber$(serieId, year);
  }

  mapSeries(series: Serie[]) {
    return series.map(serie => {
      if (serie.internationalName) {
        return serie;
      }
      return {
        ...serie,
        internationalName: serie.name
      };
    });
  }

  getSeriesByUser$(): Observable<Serie[]> {
    return this.seriesAdminApi.getSeriesByUser$().pipe(
      map(series => this.mapSeries(series))
    );
  }
}
