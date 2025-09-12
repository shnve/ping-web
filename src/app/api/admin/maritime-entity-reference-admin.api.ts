import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MaritimeEntityReference } from '@app/models/maritime-entity.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MaritimeEntityReferenceApi {
    readonly adminApi = environment.baseAdminApiUrl + environment.adminApi.maritimeEntityReference;
    readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private readonly http: HttpClient) { }

    saveMaritimeEntityReference(maritimeEntityReference: MaritimeEntityReference): Observable<MaritimeEntityReference> {
        if (maritimeEntityReference.id) {
            return this.http.put<MaritimeEntityReference>(`${this.adminApi}/${maritimeEntityReference.id}`, maritimeEntityReference, this.httpOptions);
        }
        return this.http.post<MaritimeEntityReference>(`${this.adminApi}`, maritimeEntityReference, this.httpOptions);
    }

    delete(maritimeEntityReferenceId: string): Observable<void> {
        return this.http.delete<void>(`${this.adminApi}/${maritimeEntityReferenceId}`);
    }
}
