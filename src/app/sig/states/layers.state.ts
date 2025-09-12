import { Injectable } from '@angular/core';
import { default as CartoLayer } from '@shom2/carto/core/Layer';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayersState {
  private layers$ = new BehaviorSubject<CartoLayer[]>(null);
  private loaded = false;

  addLayers(layers: CartoLayer[]): CartoLayer[] {
    this.layers$.next(layers);
    this.loaded = true;
    return layers;
  }

  reinitializeLayers(): void {
    this.layers$ = new BehaviorSubject<CartoLayer[]>(null);
    this.setLoaded(false);
  }

  getLayers$(): Observable<CartoLayer[]> {
    return this.layers$.asObservable();
  }

  isLoaded() {
    return this.loaded;
  }

  setLoaded(loaded: boolean) {
    this.loaded = loaded;
  }
}
