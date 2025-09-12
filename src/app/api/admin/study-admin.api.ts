import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StudyBase, FolderStudy, StudyStatusEnum } from '@app/models/study.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class StudyApi {
    readonly apiUpdateStatus = environment.baseAdminApiUrl + environment.adminApi.studies.updateStatus;
    readonly apiCreate = environment.baseAdminApiUrl + environment.adminApi.studies.create;
    readonly apiDelete = environment.baseAdminApiUrl + environment.adminApi.studies.delete;

    readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private readonly httpClient: HttpClient) { }

    saveStudy$(study: StudyBase): Observable<FolderStudy> {
        if (study.id) {
            return this.httpClient.put<FolderStudy>(`${this.apiCreate}/${study.id}`, study, this.httpOptions);
        }

        return this.httpClient.post<FolderStudy>(`${this.apiCreate}`, study, this.httpOptions);
    }

    updateStatus$(id: string, status: StudyStatusEnum): Observable<void> {
        return this.httpClient.put<void>(this.apiUpdateStatus.replace('{{id}}', id), status, {
            params: new HttpParams().set('status', status)
        });
    }

    delete$(studyId: string): Observable<void> {
        return this.httpClient.delete<void>(this.apiDelete.replace('{{id}}', studyId), {});
    }
}
