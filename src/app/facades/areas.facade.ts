import { Injectable } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AreasApi } from '../api/areas.api';
import Area from '../models/area.model';
import { AreasState } from '../states/areas.state';

export type AreaSelectOption = Pick<Area, 'id' | 'name' | 'internationalName'>;

@Injectable({
  providedIn: 'root'
})
export class AreasFacade {
  selected$ = new ReplaySubject<Area>(1);

  constructor(private readonly areasApi: AreasApi,
    private readonly areasState: AreasState,
    private readonly alertMessageService: AlertMessageService) { }

  getAreas$(): Observable<Area[]> {
    return this.areasApi.getAreas()
      .pipe(
        tap((areas: Area[]) => this.areasState.setAreas(areas))
      );
  }

  getAreasByServices$(serviceIds: string[]): Observable<Area[]> {
    return this.areasApi.getAreasByServices(serviceIds)
      .pipe(
        tap((areas: Area[]) => this.areasState.setAreas(areas))
      );
  }

  selectAreaById(id: string): Area {
    const selectedArea = this.areasState.getAreaById(id);
    this.selected$.next(selectedArea);
    return selectedArea;
  }

  getSelectedArea$(): Observable<Area> {
    return this.selected$.asObservable();
  }

  getAreaSelectOptions$(): Observable<AreaSelectOption[]> {
    return this.getAreas$().pipe(
      map<Area[], AreaSelectOption[]>(areas =>
        areas.map<AreaSelectOption>(area => {
          return {
            id: area.id,
            name: area.name,
            internationalName: area.internationalName || area.name,
          };
        })
      ),
      catchError(err => {
        this.alertMessageService.add({
          severity: 'error',
          summary: 'message.summary.error',
          sticky: true,
          detail: 'message.error.api.cannot-get-areas'
        });
        return throwError(err);
      })
    );
  }
}
