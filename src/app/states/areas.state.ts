import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import Area from '../models/area.model';

@Injectable({
  providedIn: 'root'
})
export class AreasState {
  public readonly areas$ = new BehaviorSubject<Area[]>(null);

  setAreas(areas: Area[]) {
    this.areas$.next(areas);
  }

  getAreaById(searchId: string): Area {
    return this.areas$.getValue().find(({id}) => searchId === id);
  }
}
