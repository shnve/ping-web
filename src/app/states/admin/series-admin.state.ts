import {Injectable} from '@angular/core';
import {Serie} from '@app/models/serie.model';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeriesAdminState {
  public readonly series$ = new BehaviorSubject<Serie[]>(null);
  protected loaded = false;

  setSeries(series: Serie[]) {
    this.series$.next(series);
    this.loaded = true;
  }

  isLoaded() {
    return this.loaded;
  }

  getSeries(): Serie[] {
    return this.series$.getValue();
  }

  getSeries$(): Observable<Serie[]> {
    return this.series$;
  }
}
