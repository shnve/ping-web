import { Injectable } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { forkJoin, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AreasApi } from '../api/areas.api';
import { SubAreasApi } from '../api/sub-areas.api';
import Area from '../models/area.model';
import { SubArea } from '../models/sub-area.model';
import { AreasState } from '../states/areas.state';

export type AreaSelectOption = Pick<Area, 'id' | 'name' | 'internationalName'>;

export interface AreaDropdownItem {
  label: string;
  name: string;
  internationalName: string;
  value: string;
  isSubArea: boolean;
}

export interface AreaDropdownGroup {
  label: string;
  value?: string;
  items: AreaDropdownItem[];
}

@Injectable({
  providedIn: 'root'
})
export class AreasFacade {
  selected$ = new ReplaySubject<Area>(1);

  constructor(
    private readonly areasApi: AreasApi,
    private readonly subAreasApi: SubAreasApi,
    private readonly areasState: AreasState,
    private readonly alertMessageService: AlertMessageService
  ) { }

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
    if (selectedArea) {
      this.selected$.next(selectedArea);
    }
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

  getGroupedAreaSelectOptions$(): Observable<AreaDropdownGroup[]> {
    return forkJoin({
      areas: this.getAreas$(),
      subAreas: this.subAreasApi.getSubAreas().pipe(
        catchError(() => of([] as SubArea[]))
      )
    }).pipe(
      tap(({ subAreas }) => this.areasState.setSubAreas(subAreas)),
      map(({ areas, subAreas }) => {
        const grouped: AreaDropdownGroup[] = areas.map(area => {
          const areaSubAreas = subAreas.filter(s => s.areaId === area.id);
          const items: AreaDropdownItem[] = [
            {
              label: `Toda el área (${area.name})`,
              name: `Toda el área (${area.name})`,
              internationalName: `All area (${area.internationalName || area.name})`,
              value: area.id,
              isSubArea: false
            }
          ];

          areaSubAreas.forEach(sub => {
            items.push({
              label: sub.name,
              name: sub.name,
              internationalName: sub.internationalName || sub.name,
              value: sub.id,
              isSubArea: true
            });
          });

          return {
            label: area.name,
            value: area.id,
            items
          };
        });

        // Subáreas no asignadas
        const assignedSubAreaIds = new Set(subAreas.filter(s => areas.some(a => a.id === s.areaId)).map(s => s.id));
        const unassignedSubAreas = subAreas.filter(s => !assignedSubAreaIds.has(s.id));
        if (unassignedSubAreas.length > 0) {
          grouped.push({
            label: 'Otras Subáreas',
            value: 'other',
            items: unassignedSubAreas.map(sub => ({
              label: sub.name,
              name: sub.name,
              internationalName: sub.internationalName || sub.name,
              value: sub.id,
              isSubArea: true
            }))
          });
        }

        return grouped;
      }),
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
