import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

const INFOSOURCE_DANGER_REPORT = '/infosource/creation/report-danger';
const INFOSOURCE_MAP_ANOMALY_REPORT = '/infosource/creation/report-map-anomaly';
const INFOSOURCE_ACTIVITY_FORECAST_REPORT = '/infosource/report-activity-forecast';
const INFOSOURCE_BATHY_DATA_REPORT = '/infosource/report-bathy-data';

@Component({
  selector: 'infosource-choice',
  templateUrl: './infosource-choice.component.html',
  styleUrls: ['./infosource-choice.component.scss']
})
export class InfosourceChoiceComponent implements OnInit {

  enableForecastBtn: boolean;
  enableBathyDataBtn: boolean;

  constructor(private readonly confirmationService: ConfirmationService,
    private readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly router: Router) { }

  ngOnInit(): void {
    this.enableForecastBtn = this.authService.hasRoleServiceUser() || this.authService.isPublicUserWithProAccount();
    this.enableBathyDataBtn = this.authService.isSurveyOwnerOnAnyServiceWithAdminOrOperatorRole() && environment.enableSurveyModule === 'true';
  }

  confirmReport(event: Event): void {
    this.confirmationService.confirm({
      target: event.target,
      header: this.translate.instant('infosource.choice.new-danger-confirmation.header'),
      message: this.translate.instant('infosource.choice.new-danger-confirmation.message'),
      acceptLabel: this.translate.instant('infosource.choice.new-danger-confirmation.acceptLabel'),
      rejectLabel: this.translate.instant('infosource.choice.new-danger-confirmation.rejectLabel'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.continueReport();
      }
    });
  }

  private continueReport(): void {
    this.router.navigate([INFOSOURCE_DANGER_REPORT]);
  }

  updateMapOrPublication() {
    this.router.navigate([INFOSOURCE_MAP_ANOMALY_REPORT]);
  }

  reportActivityForecast(): void {
    this.router.navigate([INFOSOURCE_ACTIVITY_FORECAST_REPORT]);
  }

  reportBathyData(): void {
    this.router.navigate([INFOSOURCE_BATHY_DATA_REPORT]);
  }
}
