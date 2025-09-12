import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

const INFOSOURCE_HAZARD_ANOMALY_REPORT = '/infosource/report-hazard';
const INFOSOURCE_OTHER_ANOMALY_REPORT = '/infosource/report-other';
const INFOSOURCE_MAP_ANOMALY_REPORT = '/infosource/report-map-anomaly';
const INFOSOURCE_FUTURE_UPDATES_REPORT = '/infosource/report-future-updates';
const INFOSOURCE_PUBLICATION_ANOMALY_REPORT = '/infosource/report-publication-anomaly';

@Component({
  selector: 'infosource-creation',
  templateUrl: './infosource-creation.component.html',
  styleUrls: ['./infosource-creation.component.scss']
})
export class InfosourceCreationComponent {
  redirectPage: string;

  constructor(private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute) {
    this.activatedRoute.paramMap.subscribe(paramMap => this.redirectPage = paramMap.get('reportPageName'));
  }

  reportHazard(): void {
    this.router.navigate([INFOSOURCE_HAZARD_ANOMALY_REPORT]);
  }

  reportOtherAnomaly(): void {
    this.router.navigate([INFOSOURCE_OTHER_ANOMALY_REPORT]);
  }

  reportMapAnomaly(): void {
    this.router.navigate([INFOSOURCE_MAP_ANOMALY_REPORT]);
  }

  reportFutureUpdates(): void {
    this.router.navigate([INFOSOURCE_FUTURE_UPDATES_REPORT]);
  }

  reportPublicationAnomaly(): void {
    this.router.navigate([INFOSOURCE_PUBLICATION_ANOMALY_REPORT]);
  }

  isDangerReport(): boolean {
    return this.redirectPage === 'report-danger';
  }

  isMapAnomalyReport(): boolean {
    return this.redirectPage === 'report-map-anomaly';
  }

}
