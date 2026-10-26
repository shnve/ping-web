import { JsonWarningAdminDetails } from '@admin-warning/models/creation-warning.model';
import { CreationService } from '@admin-warning/services/creation.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WarningAdminApi } from '@app/api/admin/warning-admin.api';
import { Localize } from '@app/core/localize';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'aw-creation-page',
  templateUrl: './creation-page.component.html',
  styleUrls: ['./creation-page.component.scss']
})
@Localize()
export class CreationPageComponent implements OnInit, OnDestroy {

  warning$: Observable<JsonWarningAdminDetails>;

  warningSubscription: Subscription;

  warningStatus: string;

  constructor(private readonly translate: TranslateService,
    private readonly creationService: CreationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly warningAdminApi: WarningAdminApi) {
    this.warning$ = this.activatedRoute.paramMap
      .pipe(
        map(paramMap => {
          this.creationService.initWarningData();
          return paramMap.get('warningId');
        }),
        filter(warningId => warningId !== null),
        switchMap(warningId => {
          localStorage.setItem('warningId', warningId);
          return this.warningAdminApi.getWarningById$(warningId);
        }),
        tap(warning => this.warningStatus = this.translate.instant(warning.status))
      );
  }

  ngOnInit(): void {
    this.warningSubscription = this.warning$.subscribe(
      warningAdminDetails => this.creationService.setJsonWarningAdminDetails(warningAdminDetails)
    );
  }

  ngOnDestroy(): void {
    if (this.warningSubscription) { this.warningSubscription.unsubscribe(); }
  }

  onChangeLang(event: any): void {
    // Método vacío implementado para cumplir con la interfaz de Angular
  }

}
