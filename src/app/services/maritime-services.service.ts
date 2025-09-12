import { Injectable } from '@angular/core';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import MaritimeService, { MaritimeServiceBase } from '@app/models/maritime-service.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaritimeServiceService {
  constructor(private readonly maritimeServiceApi: MaritimeServicesApi) { }

  getAvailableAuthorities$(serviceId: string): Observable<MaritimeServiceBase[]> {
    return this.maritimeServiceApi.getAvailableAuthorities$(serviceId);
  }

  findByServiceIds$(ids: string[]): Observable<MaritimeService[]> {
    return this.maritimeServiceApi.findByServiceIds(ids);
  }
}
