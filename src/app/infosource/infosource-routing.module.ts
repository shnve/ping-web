import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FutureUpdatesComponent } from './components/future-updates/future-updates.component';
import { InfosourceChoiceComponent } from './components/infosource-choice/infosource-choice.component';
import { InfosourceCreationComponent } from './components/infosource-creation/infosource-creation.component';
import { InfosourceHomeComponent } from './components/infosource-home/infosource-home.component';
import { InfosourceTablesComponent } from './components/infosource-tables/infosource-tables.component';
import { MapAnomalyReportComponent } from './components/map-anomaly/map-anomaly-report.component';
import { ReportActivityForecastComponent } from './components/report-activity-forecast/report-activity-forecast.component';
import { ReportBathyDataComponent } from './components/report-bathy-data/report-bathy-data.component';
import { ReportBathyDangerComponent } from './components/report-danger-bathy/report-bathy-danger.component';
import { HazardReportFormComponent } from './components/report-hazard/report-hazard-form.component';
import { ReportOtherFormComponent } from './components/report-other-form/report-other-form.component';
import { ReportPublicationFormComponent } from './components/report-publication-form/report-publication-form.component';


const routes: Routes = [
  {
    path: '',
    component: InfosourceHomeComponent,
    data: {
      breadcrumb: 'menu.infosource.home'
    }
  },
  {
    path: 'choice',
    component: InfosourceChoiceComponent,
    data: {
      breadcrumb: 'menu.infosource.new-contribution'
    }
  },
  {
    path: 'creation/:reportPageName',
    component: InfosourceCreationComponent,
    data: {
      breadcrumb: 'menu.infosource.creation'
    }
  },
  {
    path: 'report-hazard',
    component: HazardReportFormComponent,
    data: {
      breadcrumb: 'menu.infosource.report-hazard'
    }
  },
  {
    path: 'report-hazard/:id',
    component: HazardReportFormComponent,
    data: {
      breadcrumb: 'menu.infosource.report-hazard'
    }
  },
  {
    path: 'report-other',
    component: ReportOtherFormComponent,
    data: {
      breadcrumb: 'menu.infosource.report-other'
    }
  },
  {
    path: 'report-other/:id',
    component: ReportOtherFormComponent,
    data: {
      breadcrumb: 'menu.infosource.report-other'
    }
  },
  {
    path: 'report-future-updates',
    component: FutureUpdatesComponent,
    data: {
      breadcrumb: 'menu.infosource.future-updates'
    }
  },
  {
    path: 'report-future-updates/:id',
    component: FutureUpdatesComponent,
    data: {
      breadcrumb: 'menu.infosource.future-updates'
    }
  },
  {
    path: 'report-map-anomaly',
    component: MapAnomalyReportComponent,
    data: {
      breadcrumb: 'menu.infosource.map-anomaly-report'
    }
  },
  {
    path: 'report-map-anomaly/:id',
    component: MapAnomalyReportComponent,
    data: {
      breadcrumb: 'menu.infosource.map-anomaly-report'
    }
  },
  {
    path: 'report-publication-anomaly',
    component: ReportPublicationFormComponent,
    data: {
      breadcrumb: 'menu.infosource.report-publication'
    }
  },
  {
    path: 'report-publication-anomaly/:id',
    component: ReportPublicationFormComponent,
    data: {
      breadcrumb: 'menu.infosource.report-publication'
    }
  },
  {
    path: 'report-activity-forecast',
    component: ReportActivityForecastComponent,
    data: {
      breadcrumb: 'menu.infosource.report-activity-forecast'
    }
  },
  {
    path: 'report-activity-forecast/:id',
    component: ReportActivityForecastComponent,
    data: {
      breadcrumb: 'menu.infosource.report-activity-forecast'
    }
  },
  {
    path: 'report-bathy-danger/:id',
    component: ReportBathyDangerComponent,
    data: {
      breadcrumb: 'menu.infosource.report-bathy-danger'
    }
  },
  {
    path: 'report-bathy-data',
    component: ReportBathyDataComponent,
    data: {
      breadcrumb: 'menu.infosource.report-bathy-data'
    }
  },
  {
    path: 'tables',
    component: InfosourceTablesComponent,
    data: {
      breadcrumb: 'menu.infosource.my-contributions'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InfosourceRoutingModule { }
