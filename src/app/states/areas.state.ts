import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import Area from '../models/area.model';
import { SubArea } from '../models/sub-area.model';

@Injectable({
  providedIn: 'root'
})
export class AreasState {
  public readonly areas$ = new BehaviorSubject<Area[]>(null);
  public readonly subAreas$ = new BehaviorSubject<SubArea[]>(null);

  setAreas(areas: Area[]) {
    this.areas$.next(areas);
  }

  setSubAreas(subAreas: SubArea[]) {
    this.subAreas$.next(subAreas);
  }

  getAreaById(searchId: string): Area {
    const area = this.areas$.getValue()?.find(({id}) => searchId === id);
    if (area) {
      return area;
    }
    const subArea = this.subAreas$.getValue()?.find(({id}) => searchId === id);
    if (subArea) {
      return {
        id: subArea.id,
        name: subArea.name,
        internationalName: subArea.internationalName || subArea.name,
        geom: subArea.geom,
        country: 'VE',
        areaId: subArea.areaId
      } as Area;
    }
    return null;
  }

  getSubAreaById(searchId: string): SubArea {
    return this.subAreas$.getValue()?.find(({id}) => searchId === id);
  }
}
