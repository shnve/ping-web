import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InfosourceModule } from '@app/infosource/infosource.module';
import { InfosourcePartHasLocalisationPipe } from '@app/infosource/pipes/infosource-part-has-localisation.pipe';
import { FormatTypeGeneralPipe } from '@app/shared/pipes/format-type-general.pipe';
import { FormatWarningNumberPipe } from '@app/shared/pipes/format-warning-number.pipe';
import { FormatWarningsNumberToCancelPipe } from '@app/shared/pipes/format-warnings-number-to-cancel.pipe';
import { GetNumberForSearchedPartPipe } from '@app/shared/pipes/get-number-for-searched-part.pipe';
import { HasGeometriesPipe } from '@app/shared/pipes/has-geometries.pipe';
import { TranslateStatusPipe } from '@app/shared/pipes/translate-status.pipe';
import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { SharedModule } from '@app/shared/shared.module';
import { SigModule } from '@app/sig/sig.module';
import Flow from '@flowjs/flow.js';
import { FlowInjectionToken, NgxFlowModule } from '@flowjs/ngx-flow';
import { TranslateInPipe } from '@shared/pipes/translateIn.pipe';
import { CardModule as PrimeCardModule } from 'primeng/card';
import { CheckboxModule as PrimeCheckboxModule } from 'primeng/checkbox';
import { DataViewModule as PrimeDateViewModule } from 'primeng/dataview';
import { InputTextModule as PrimeInputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { OrderListModule as PrimeOrderListModule } from 'primeng/orderlist';
import { StepsModule as PrimeStepsModule } from 'primeng/steps';
import { TagModule as PrimeTagModule } from 'primeng/tag';
import { TriStateCheckboxModule as PrimeTriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { AdminWarningRoutingModule } from './admin-warning-routing.module';
import { FeaturePartFormComponent } from './components/feature-part-form/feature-part-form.component';
import { InputInformationComponent } from './components/feature-part-form/input-information/input-information.component';
import { FeaturePartsListComponent } from './components/feature-parts-list/feature-parts-list.component';
import { GeometriesFormComponent } from './components/geometries-form/geometries-form.component';
import { InfosourcesListItemComponent } from './components/infosources-list/infosources-list-item/infosources-list-item.component';
import { InfosourcesListComponent } from './components/infosources-list/infosources-list.component';
import { DiffusionStepComponent } from './components/steps/diffusion-step/diffusion-step.component';
import { DiffusionNavtexConfigurationComponent } from './components/steps/diffusion-step/diffusion-type/diffusion-navtex/diffusion-navtex-configuration/diffusion-navtex-configuration.component';
import { DiffusionNavtexComponent } from './components/steps/diffusion-step/diffusion-type/diffusion-navtex/diffusion-navtex.component';
import { DiffusionTelexComponent } from './components/steps/diffusion-step/diffusion-type/diffusion-telex/diffusion-telex.component';
import { FinalizationStepComponent } from './components/steps/finalization-step/finalization-step.component';
import { LastUpdateInfosComponent } from './components/steps/last-update-infos/last-update-infos.component';
import { AttachmentsStepComponent } from './components/steps/links-and-attachments-step/attachments-step/attachments-step.component';
import { LinksAndAttachmentsStepComponent } from './components/steps/links-and-attachments-step/links-and-attachments-step.component';
import { LinksStepComponent } from './components/steps/links-and-attachments-step/links-step/links-step.component';
import { LocalityComponent } from './components/steps/prerequisites-step/locality/locality.component';
import { PrerequisitesStepComponent } from './components/steps/prerequisites-step/prerequisites-step.component';
import { PublicsReferencesStepComponent } from './components/steps/publics-references-step/publics-references-step.component';
import { StepTransitionButtonComponent } from './components/steps/step-transition-button/step-transition-button.component';
import { StepperComponent } from './components/steps/stepper/stepper.component';
import { TableAdminAdvancedFilterComponent } from './components/table-admin-advanced-filter/table-admin-advanced-filter.component';
import { CreationPageComponent } from './pages/creation-page/creation-page.component';
import { TablesPageComponent } from './pages/tables-page/tables-page.component';
import { InfosourceFormatListItemTitlePipe } from './pipes/infosource-format-list-item-title.pipe';
import { MessagesModule } from 'primeng/messages';
import { StepSaveButtonComponent } from './components/steps/step-save-button/step-save-button.component';

@NgModule({
  declarations: [
    StepperComponent,
    CreationPageComponent,
    TablesPageComponent,
    PrerequisitesStepComponent,
    LinksStepComponent,
    DiffusionStepComponent,
    AttachmentsStepComponent,
    FinalizationStepComponent,
    TableAdminAdvancedFilterComponent,
    LastUpdateInfosComponent,
    FeaturePartFormComponent,
    InputInformationComponent,
    FeaturePartsListComponent,
    GeometriesFormComponent,
    DiffusionTelexComponent,
    DiffusionNavtexComponent,
    DiffusionNavtexConfigurationComponent,
    LocalityComponent,
    StepTransitionButtonComponent,
    InfosourcesListComponent,
    InfosourcesListItemComponent,
    InfosourceFormatListItemTitlePipe,
    LinksAndAttachmentsStepComponent,
    PublicsReferencesStepComponent,
    StepSaveButtonComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SharedPipeModule,
    SigModule,
    PrimeCardModule,
    PrimeStepsModule,
    AdminWarningRoutingModule,
    PrimeTagModule,
    PrimeDateViewModule,
    PrimeCheckboxModule,
    PrimeTriStateCheckboxModule,
    NgxFlowModule,
    PrimeInputTextModule,
    PrimeOrderListModule,
    ListboxModule,
    InfosourceModule,
    MessagesModule
  ],
  providers: [
    {
      provide: FlowInjectionToken,
      useValue: Flow
    },
    FormatWarningNumberPipe,
    FormatWarningsNumberToCancelPipe,
    FormatTypeGeneralPipe,
    TranslateInPipe,
    InfosourceFormatListItemTitlePipe,
    InfosourcePartHasLocalisationPipe,
    HasGeometriesPipe,
    GetNumberForSearchedPartPipe,
    TranslateStatusPipe
  ]
})

export class AdminWarningModule { }
