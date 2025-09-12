import { Injectable } from '@angular/core';
import { EpsgApi } from '@app/api/epsg.api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EpsgService {
  constructor(private readonly epsgApi: EpsgApi) { }
  
  getEpsgCodes$(geometric: boolean): Observable<string[]> {
    return this.epsgApi.getEpsgCodes$(geometric);
  }
}