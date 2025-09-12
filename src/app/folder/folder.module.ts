import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FolderModalBodyComponent } from '@app/folder/components/folder-modal/folder-modal-body/folder-modal-body.component';
import { FolderModalGraphComponent } from '@app/folder/components/folder-modal/folder-modal-graph/folder-modal-graph.component';
import { FolderModalTableComponent } from '@app/folder/components/folder-modal/folder-modal-table/folder-modal-table.component';
import { FolderModalComponent } from '@app/folder/components/folder-modal/folder-modal.component';
import { FolderAdvancedFilterComponent } from '@app/folder/components/folder-tables/folder-advanced-filter/folder-advanced-filter.component';
import { FolderTableFilterBannerComponent } from '@app/folder/components/folder-tables/folder-table-filter-banner/folder-table-filter-banner.component';
import { FolderPaginatedTableComponent } from '@app/folder/components/folder-tables/folder-table/folder-table.component';
import { StudyReferenceItemComponent } from '@app/folder/components/shared/folder-modal-edit-study/study-references/study-reference-item/study-reference-item.component';
import { StudyReferencesComponent } from '@app/folder/components/shared/folder-modal-edit-study/study-references/study-references.component';
import { FolderRoutingModule } from '@app/folder/folder-routing.module';
import { FolderFormatDetailsModalTitlePipe } from '@app/folder/pipes/folder-format-details-modal-title.pipe';
import { FolderFormatNumberPipe } from '@app/folder/pipes/folder-format-number.pipe';
import { FolderReviewStatusSeverityPipe } from '@app/folder/pipes/folder-review-status-severity.pipe';
import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { SharedModule } from '@app/shared/shared.module';
import Flow from '@flowjs/flow.js';
import { FlowInjectionToken, NgxFlowModule } from '@flowjs/ngx-flow';
import { AddRowDirective } from '@shared/directives/add-row.directive';
import { ConfirmationService as PrimeConfirmationService } from 'primeng/api';
import { FolderAttachmentDownloadPageComponent } from './components/folder-attachment-download-page/folder-attachment-download-page.component';
import { FolderCreationComponent } from './components/folder-creation/folder-creation.component';
import { FolderFollowedTableFilterBannerComponent } from './components/folder-followed-tables/folder-followed-table-filter-banner/folder-followed-table-filter-banner.component';
import { FolderFollowedTableComponent } from './components/folder-followed-tables/folder-followed-table/folder-followed-table.component';
import { FolderFollowedTablesComponent } from './components/folder-followed-tables/folder-followed-tables.component';
import { FolderModalAttachmentsComponent } from './components/folder-modal/folder-modal-attachments/folder-modal-attachments.component';
import { FolderModalReferencesComponent } from './components/folder-modal/folder-modal-references/folder-modal-references.component';
import { FolderModalStudiesComponent } from './components/folder-modal/folder-modal-studies/folder-modal-studies.component';
import { FolderTablesComponent } from './components/folder-tables/folder-tables.component';
import { FolderModalEditStudyComponent } from './components/shared/folder-modal-edit-study/folder-modal-edit-study.component';
import { FolderFormatDataNamePipe } from './pipes/folder-format-data-name.pipe';

@NgModule({
  declarations: [
    FolderTablesComponent,
    FolderPaginatedTableComponent,
    FolderTableFilterBannerComponent,
    FolderAdvancedFilterComponent,
    FolderModalComponent,
    FolderModalBodyComponent,
    FolderModalGraphComponent,
    FolderModalTableComponent,
    FolderModalAttachmentsComponent,
    FolderFormatDetailsModalTitlePipe,
    FolderReviewStatusSeverityPipe,
    FolderFormatNumberPipe,
    FolderCreationComponent,
    AddRowDirective,
    FolderModalStudiesComponent,
    FolderModalEditStudyComponent,
    FolderAttachmentDownloadPageComponent,
    FolderModalReferencesComponent,
    FolderFollowedTablesComponent,
    FolderFollowedTableComponent,
    FolderFollowedTableFilterBannerComponent,
    FolderFormatDataNamePipe,
    StudyReferencesComponent,
    StudyReferenceItemComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SharedPipeModule,
    FolderRoutingModule,
    NgxFlowModule
  ],
  providers: [
    PrimeConfirmationService,
    FolderFormatDetailsModalTitlePipe,
    FolderReviewStatusSeverityPipe,
    FolderFormatNumberPipe,
    FolderFormatDataNamePipe,
    {
      provide: FlowInjectionToken,
      useValue: Flow
    }
  ],
  exports: []
})
export class FolderModule { }
