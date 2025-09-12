import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LayersApi {
  readonly api = environment.carto.getCapBaseMapUrl;
  private readonly parser: WMTSCapabilities;

  constructor(private readonly http: HttpClient) {
    this.parser = new WMTSCapabilities();
  }

  getLayersFromGetCap(showRasterMarineWithAdditionalLayerForWestAfrica = false): Observable<any> {
    const key = showRasterMarineWithAdditionalLayerForWestAfrica ? environment.baseMapKeyForShomService : environment.baseMapKey;
    return this.http.get(
      this.api.replace('{{key}}', key), { responseType: 'text' })
      .pipe(
        map((response: string) => this.parser.read(response))
      );
  }
}
