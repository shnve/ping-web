import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { SharedModule } from '@app/shared/shared.module';
import { SigModule } from '@app/sig/sig.module';
import { StaticSectionModule } from '@app/static-section/static-section.module';
import { SurveyTranslateWithListPipe } from '@app/survey/pipes/survey-translate-with-list.pipe';
import { InputTextareaModule } from "primeng/inputtextarea";
import { SharedSurveyBathyMetadataDescriptionComponent } from './components/survey-creation/shared-survey/shared-survey-bathy-metadata-description/shared-survey-bathy-metadata-description.component';
import { SharedSurveyDescriptionComponent } from './components/survey-creation/shared-survey/shared-survey-description/shared-survey-description.component';
import { SurveyDepositComponent } from './components/survey-creation/survey-deposit/survey-deposit.component';
import { SurveyTestComponent } from './components/survey-creation/survey-test/survey-test.component';
import { SurveyModalBodyComponent } from './components/survey-modal/survey-modal-body/survey-modal-body.component';
import { SurveyModalMapLegendComponent } from './components/survey-modal/survey-modal-map/survey-modal-map-legend/survey-modal-map-legend.component';
import { SurveyModalMapComponent } from './components/survey-modal/survey-modal-map/survey-modal-map.component';
import { SurveyModalComponent } from './components/survey-modal/survey-modal.component';
import { SurveyAdvancedFilterComponent } from './components/survey-tables/survey-advanced-filter/survey-advanced-filter.component';
import { SurveyPaginatedTableComponent } from './components/survey-tables/survey-paginated-table/survey-paginated-table.component';
import { SurveyTableFilterBannerComponent } from './components/survey-tables/survey-table-filter-banner/survey-table-filter-banner.component';
import { SurveyTablesComponent } from './components/survey-tables/survey-tables.component';
import { SurveyCompliantStatusPipe } from './pipes/survey-compliant-status.pipe';
import { SurveyProcessingStatusTranslationPipe } from './pipes/survey-processing-status-translation.pipe';
import { SurveyProcessingStatusPipe } from './pipes/survey-processing-status.pipe';
import { SurveyRoutingModule } from './survey-routing.module';
import { SurveyCompliantStatusTxtPipe } from './pipes/survey-compliant-status-txt.pipe';


@NgModule({
  declarations: [
    SurveyModalBodyComponent,
    SurveyModalComponent,
    SurveyTablesComponent,
    SurveyPaginatedTableComponent,
    SurveyTableFilterBannerComponent,
    SurveyAdvancedFilterComponent,
    SurveyTestComponent,
    SurveyDepositComponent,
    SurveyProcessingStatusPipe,
    SurveyProcessingStatusTranslationPipe,
    SurveyCompliantStatusPipe,
    SharedSurveyDescriptionComponent,
    SharedSurveyBathyMetadataDescriptionComponent,
    SurveyTranslateWithListPipe,
    SurveyModalMapComponent,
    SurveyModalMapLegendComponent,
    SurveyCompliantStatusTxtPipe
  ],
  imports: [
    CommonModule,
    SharedModule,
    SharedPipeModule,
    SigModule,
    SurveyRoutingModule,
    InputTextareaModule,
    StaticSectionModule
  ],
  providers: [
    SurveyProcessingStatusTranslationPipe
  ]
})
export class SurveyModule { }
