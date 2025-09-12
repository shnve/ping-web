import { Injectable } from '@angular/core';
import { WarningAdminApi } from '@app/api/admin/warning-admin.api';
import { AuthService } from '@app/auth/auth.service';
import { AdminJsonWarning, MainWarningPart, WarningReferenceCategoryEnum } from '@app/models/warning.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WarningsFacade {
  constructor(private readonly warningAdminApi: WarningAdminApi,
    private readonly authService: AuthService) { }

  getById$(id: string): Observable<AdminJsonWarning> {
    return this.warningAdminApi.getById$(id);
  }

  getCancellable$(serieId: string): Observable<MainWarningPart[]> {
    return this.warningAdminApi.getCancellable$(serieId);
  }

  getReplaceable$(serieId: string): Observable<MainWarningPart[]> {
    return this.warningAdminApi.getReplaceable$(serieId);
  }

  getReferenceable$(): Observable<MainWarningPart[]> {
    return this.warningAdminApi.getReferenceable$();
  }

  publish$(id: string): Observable<void> {
    return this.warningAdminApi.publish$(id, this.authService.getToken());
  }

  setReviewed$(id: string): Observable<void> {
    return this.warningAdminApi.setReviewed$(id);  // TODO
  }

  delete$(id: string): Observable<void> {
    return this.warningAdminApi.delete$(id, this.authService.getToken());
  }

  cancel$(id: string): Observable<string> {
    return this.warningAdminApi.cancel$(id, this.authService.getToken());
  }

  clone$(id: string, serieId: string, warningReferenceCategoryEnum?: WarningReferenceCategoryEnum, warningStatus?: string): Observable<string> {
    return this.warningAdminApi.clone$(id, serieId, warningReferenceCategoryEnum, warningStatus);
  }
}
