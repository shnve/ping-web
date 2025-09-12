import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {MapWarning} from '../models/warning.model';

@Injectable({
  providedIn: 'root'
})
export class WarningsState {
  readonly mapWarnings$ = new BehaviorSubject<MapWarning[]>([]);

  setFilteredMapWarnings(warnings: MapWarning[]) {
    this.mapWarnings$.next(warnings);
  }
}
