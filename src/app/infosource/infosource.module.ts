import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { SharedModule } from '@app/shared/shared.module';
import { SigModule } from '@app/sig/sig.module';
import { StaticSectionModule } from '@app/static-section/static-section.module';
import { CalendarModule as PrimeCalendarModule } from 'primeng/calendar';
import { PanelModule } from 'primeng/panel';
import { FutureUpdatesComponent } from './components/future-updates/future-updates.component';
import { InfosourceChoiceComponent } from './components/infosource-choice/infosource-choice.component';
import { InfosourceCreationComponent } from './components/infosource-creation/infosource-creation.component';
import { InfosourceDetailsMapComponent } from './components/infosource-details-map/infosource-details-map.component';
import { InfosourceHomeComponent } from './components/infosource-home/infosource-home.component';
import { InfosourceMapComponent } from './components/infosource-map/infosource-map.component';
import { InfosourceModalBodyComponent } from './components/infosource-modal/infosource-modal-body/infosource-modal-body.component';
import { InfosourceModalStatusByServiceComponent } from './components/infosource-modal/infosource-modal-status-by-service/infosource-modal-status-by-service.component';
import { InfosourceModalComponent } from './components/infosource-modal/infosource-modal.component';
import { InfosourcePartsMapComponent } from './components/infosource-parts-map/infosource-parts-map.component';
import { InfosourceFeaturePartFormComponent } from './components/infosource-parts/infosource-feature-part-form/infosource-feature-part-form.component';
import { InfosourceInputInformationComponent } from './components/infosource-parts/infosource-feature-part-form/infosource-input-information/infosource-input-information.component';
import { InfosourceFeaturePartsListComponent } from './components/infosource-parts/infosource-feature-parts-list/infosource-feature-parts-list.component';
import { InfosourcePartsComponent } from './components/infosource-parts/infosource-parts.component';
import { InfosourceAdvancedFilterComponent } from './components/infosource-tables/infosource-advanced-filter/infosource-advanced-filter.component';
import { InfosourceTableFilterBannerComponent } from './components/infosource-tables/infosource-table-filter-banner/infosource-table-filter-banner.component';
import { InfosourceTableRecipientComponent } from './components/infosource-tables/infosource-table-recipient/infosource-table-recipient.component';
import { InfosourcePaginatedTableComponent } from './components/infosource-tables/infosource-table/infosource-table.component';
import { InfosourceTablesComponent } from './components/infosource-tables/infosource-tables.component';
import { MapAnomalyReportComponent } from './components/map-anomaly/map-anomaly-report.component';
import { ReportActivityForecastComponent } from './components/report-activity-forecast/report-activity-forecast.component';
import { ReportBathyDataComponent } from './components/report-bathy-data/report-bathy-data.component';
import { ReportBathyDangerComponent } from './components/report-danger-bathy/report-bathy-danger.component';
import { HazardReportFormComponent } from './components/report-hazard/report-hazard-form.component';
import { ReportOtherFormComponent } from './components/report-other-form/report-other-form.component';
import { ReportPublicationFormComponent } from './components/report-publication-form/report-publication-form.component';
import { SharedReportFormComponent } from './components/shared-report/shared-report-form.component';
import { InfosourceRoutingModule } from './infosource-routing.module';
import { CanUpdateServiceStatusPipe } from './pipes/can-update-service-status.pipe';
import { InfosourceFormatDateRangePipe } from './pipes/infosource-format-date-range.pipe';
import { InfosourceFormatDetailsModalTitlePipe } from './pipes/infosource-format-details-modal-title.pipe';
import { InfosourceFormatInformationPipe } from './pipes/infosource-format-information.pipe';
import { InfosourceNatureTranslationPipe } from './pipes/infosource-nature-translation.pipe';
import { InfosourcePartFormatDetailsModalObjectSortPipe } from './pipes/infosource-part-format-details-modal-object-sort.pipe';
import { InfosourcePartFormatDetailsModalObjectPipe } from './pipes/infosource-part-format-details-modal-object.pipe';
import { InfosourcePartHasLocalisationPipe } from './pipes/infosource-part-has-localisation.pipe';
import { InfosourceServiceStatusPipe } from './pipes/infosource-service-status.pipe';
import { InfosourceStatusSeverityPipe } from './pipes/infosource-status-severity.pipe';
import { InfosourceStatusTranslationPipe } from './pipes/infosource-status-translation.pipe';


@NgModule({
  declarations: [
    InfosourceChoiceComponent,
    InfosourceCreationComponent,
    InfosourceMapComponent,
    HazardReportFormComponent,
    InfosourceHomeComponent,
    InfosourcePaginatedTableComponent,
    InfosourceTableFilterBannerComponent,
    InfosourceNatureTranslationPipe,
    InfosourceStatusSeverityPipe,
    InfosourceTablesComponent,
    InfosourceAdvancedFilterComponent,
    InfosourceTablesComponent,
    SharedReportFormComponent,
    ReportOtherFormComponent,
    InfosourceModalComponent,
    InfosourceModalBodyComponent,
    InfosourceDetailsMapComponent,
    InfosourceFormatDetailsModalTitlePipe,
    InfosourceStatusTranslationPipe,
    InfosourceFormatDateRangePipe,
    InfosourceFormatInformationPipe,
    InfosourceServiceStatusPipe,
    MapAnomalyReportComponent,
    FutureUpdatesComponent,
    ReportPublicationFormComponent,
    InfosourceTableRecipientComponent,
    InfosourceModalStatusByServiceComponent,
    CanUpdateServiceStatusPipe,
    InfosourcePartHasLocalisationPipe,
    InfosourcePartFormatDetailsModalObjectPipe,
    InfosourcePartFormatDetailsModalObjectSortPipe,
    ReportActivityForecastComponent,
    InfosourcePartsComponent,
    InfosourceFeaturePartFormComponent,
    InfosourceFeaturePartsListComponent,
    InfosourceInputInformationComponent,
    InfosourcePartsMapComponent,
    ReportBathyDataComponent,
    ReportBathyDangerComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SigModule,
    PrimeCalendarModule,
    SharedPipeModule,
    InfosourceRoutingModule,
    PanelModule,
    StaticSectionModule
  ],
  providers: [
    InfosourceFormatDetailsModalTitlePipe,
    InfosourceStatusTranslationPipe,
    InfosourceFormatDateRangePipe,
    InfosourceFormatInformationPipe,
    InfosourceServiceStatusPipe,
    InfosourcePartHasLocalisationPipe,
    InfosourcePartFormatDetailsModalObjectPipe,
    InfosourcePartFormatDetailsModalObjectSortPipe
  ],
  exports: [
    InfosourceModalComponent,
    InfosourceModalBodyComponent,
    InfosourceDetailsMapComponent,
    InfosourcePartHasLocalisationPipe,
    InfosourcePartFormatDetailsModalObjectPipe,
    InfosourcePartFormatDetailsModalObjectSortPipe
  ]
})
export class InfosourceModule { }
