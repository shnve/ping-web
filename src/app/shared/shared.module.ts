import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AreaDropdownComponent } from '@app/components/header/area-dropdown/area-dropdown.component';
import { LangDropdownComponent } from '@app/components/header/lang-dropdown/lang-dropdown.component';
import { WarningTableFacade } from '@app/facades/warnings-table.facade';
import { SigModule } from '@app/sig/sig.module';
import Flow from '@flowjs/flow.js';
import { FlowInjectionToken, NgxFlowModule } from '@flowjs/ngx-flow';
import { TranslateModule } from '@ngx-translate/core';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-gg';
import { NgPipesModule } from 'ngx-pipes';
import { AccordionModule as PrimeAccordionModule } from 'primeng/accordion';
import { ConfirmationService as PrimeConfirmationService } from 'primeng/api';
import { BadgeModule as PrimeBadgeModule } from 'primeng/badge';
import { ButtonModule as PrimeButtonModule } from 'primeng/button';
import { CalendarModule as PrimeCalendarModule } from 'primeng/calendar';
import { CardModule as PrimeCardModule } from 'primeng/card';
import { CheckboxModule as PrimeCheckboxModule } from 'primeng/checkbox';
import { ChipModule as PrimeChipModule } from 'primeng/chip';
import { ConfirmDialogModule as PrimeConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule as PrimeConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule as PrimeDialogModule } from 'primeng/dialog';
import { DropdownModule as PrimeDropdownModule } from 'primeng/dropdown';
import { EditorModule as PrimeEditorModule } from 'primeng/editor';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule as PrimeInputTextModule } from 'primeng/inputtext';
import { MenuModule as PrimeMenuModule } from 'primeng/menu';
import { MultiSelectModule as PrimeMultiSelectModule } from 'primeng/multiselect';
import { OrderListModule as PrimeOrderListModule } from 'primeng/orderlist';
import { OverlayPanelModule as PrimeOverlayModule } from 'primeng/overlaypanel';
import { PanelModule as PrimePanelModule } from 'primeng/panel';
import { PasswordModule as PrimePasswordButtonModule } from 'primeng/password';
import { RadioButtonModule as PrimeRadioButtonModule } from 'primeng/radiobutton';
import { ScrollPanelModule as PrimeScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule as PrimeSelectButtonModule } from 'primeng/selectbutton';
import { TableModule as PrimeTableModule } from 'primeng/table';
import { TabViewModule as PrimeTabViewModule } from 'primeng/tabview';
import { TagModule as PrimeTagModule } from 'primeng/tag';
import { ToggleButtonModule as PrimeToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule as PrimeTooltipModule } from 'primeng/tooltip';
import { TriStateCheckboxModule as PrimeTriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { AddNotionToFolderSelectionComponent } from './components/add-notion-to-folder-selection/add-notion-to-folder-selection.component';
import { AttachmentsComponent } from './components/attachments/attachments.component';
import { DetailsMapComponent } from './components/details-map/details-map.component';
import { DetailsModalComponent } from './components/details-modal/details-modal.component';
import { DisclaimerComponent } from './components/disclaimer/disclaimer.component';
import { FilterBannerComponent } from './components/filter-banner/filter-banner.component';
import { InfosourceIdentifierComponent } from './components/infosource-identifier/infosource-identifier.component';
import { InputDateRangeComponent } from './components/input-date-ranges/input-date-range/input-date-range.component';
import { InputDateRangesComponent } from './components/input-date-ranges/input-date-ranges.component';
import { PaginatedTableComponent } from './components/paginated-table/paginated-table.component';
import { PingPaginatorComponent } from './components/ping-paginator/ping-paginator.component';
import { SelectButtonComponent } from './components/select-button/select-button.component';
import { SharedMapComponent } from './components/shared-map/shared-map.component';
import { StaticPageLoaderComponent } from './components/static-page-loader/static-page-loader.component';
import { TableFilterBannerComponent } from './components/table-filter-banner/table-filter-banner.component';
import { UrlLinksComponent } from './components/url-links/url-links.component';
import { WarningCancellationComponent } from './components/warning-cancellation/warning-cancellation.component';
import { WarningDetailComponent } from './components/warning-detail/warning-detail.component';
import { WarningModalDetailComponent } from './components/warning-modal/warning-modal-detail/warning-modal-detail.component';
import { WarningModalComponent } from './components/warning-modal/warning-modal.component';
import { WarningTableComponent } from './components/warning-table/warning-table.component';
import { ControlUserEnabledStatusComponent } from './control-user-enabled-status/control-user-enabled-status.component';
import { DeleteUserComponent } from './delete-user/delete-user.component';
import { TemplateIdDirective } from './directives/template-id.directive';
import { EditUserFormComponent } from './edit-user-form/edit-user-form.component';
import { SelectSerieItemComponent } from './select-serie-item/select-serie-item.component';
import { SendResetPasswordEmailComponent } from './send-reset-password-email/send-reset-password-email.component';
import { AttachmentService } from './services/attachment.service';
import { EventSourceService } from './services/eventsource.service';
import { InformationService } from './services/information.service';
import { SharedPipeModule } from './shared-pipe.module';

@NgModule({
  declarations: [
    WarningTableComponent,
    WarningDetailComponent,
    WarningModalDetailComponent,
    TableFilterBannerComponent,
    SelectButtonComponent,
    FilterBannerComponent,
    TemplateIdDirective,
    SelectSerieItemComponent,
    WarningModalComponent,
    DisclaimerComponent,
    WarningCancellationComponent,
    StaticPageLoaderComponent,
    SendResetPasswordEmailComponent,
    EditUserFormComponent,
    DeleteUserComponent,
    WarningCancellationComponent,
    AttachmentsComponent,
    PaginatedTableComponent,
    DetailsModalComponent,
    DetailsMapComponent,
    InfosourceIdentifierComponent,
    InputDateRangesComponent,
    InputDateRangeComponent,
    UrlLinksComponent,
    SharedMapComponent,
    AddNotionToFolderSelectionComponent,
    ControlUserEnabledStatusComponent,
    LangDropdownComponent,
    AreaDropdownComponent,
    PingPaginatorComponent
  ],
  imports: [
    CommonModule,
    SharedPipeModule,
    SigModule,
    NgxFlowModule,
    FormsModule,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    TranslateModule.forChild(),
    PrimeChipModule,
    PrimeTableModule,
    PrimeInputTextModule,
    PrimeSelectButtonModule,
    PrimeDropdownModule,
    PrimeMultiSelectModule,
    PrimeOverlayModule,
    PrimeDialogModule,
    PrimeButtonModule,
    PrimeConfirmPopupModule,
    PrimePasswordButtonModule,
    PrimeRadioButtonModule,
    PrimeTooltipModule,
    PrimeToggleButtonModule,
    PrimeEditorModule,
    PrimeCardModule,
    NgxIntlTelInputModule,
    PrimeCheckboxModule,
    PrimeTabViewModule,
    PrimeConfirmDialogModule,
    PrimeTagModule,
    PrimeCalendarModule,
    PrimeAccordionModule,
    PrimeScrollPanelModule,
    PrimeOrderListModule,
    FieldsetModule,
    PrimeTriStateCheckboxModule,
    PrimeBadgeModule,
    PrimeMenuModule,
    NgPipesModule
  ],
  exports: [
    WarningTableComponent,
    PaginatedTableComponent,
    WarningDetailComponent,
    WarningModalDetailComponent,
    TableFilterBannerComponent,
    SelectButtonComponent,
    FilterBannerComponent,
    TemplateIdDirective,
    WarningModalComponent,
    SendResetPasswordEmailComponent,
    EditUserFormComponent,
    DeleteUserComponent,
    InfosourceIdentifierComponent,
    InputDateRangesComponent,
    InputDateRangeComponent,
    UrlLinksComponent,
    ControlUserEnabledStatusComponent,
    LangDropdownComponent,
    AreaDropdownComponent,
    PingPaginatorComponent,
    // Modules
    FormsModule,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    TranslateModule,
    PrimeChipModule,
    PrimeTableModule,
    PrimeInputTextModule,
    PrimeSelectButtonModule,
    PrimeDropdownModule,
    PrimeOverlayModule,
    PrimeDialogModule,
    PrimeButtonModule,
    PrimeConfirmDialogModule,
    PrimeConfirmPopupModule,
    PrimeMultiSelectModule,
    PrimePasswordButtonModule,
    PrimeRadioButtonModule,
    PrimeTooltipModule,
    PrimeToggleButtonModule,
    PrimeEditorModule,
    PrimeCardModule,
    NgxIntlTelInputModule,
    DisclaimerComponent,
    PrimeTabViewModule,
    AttachmentsComponent,
    PrimeTagModule,
    PrimeCalendarModule,
    PrimeCheckboxModule,
    PrimeAccordionModule,
    PrimeScrollPanelModule,
    PrimeOrderListModule,
    FieldsetModule,
    PrimeTriStateCheckboxModule,
    PrimeBadgeModule,
    AddNotionToFolderSelectionComponent,
    PrimeMenuModule,
    NgPipesModule,
    PrimePanelModule
  ],
  providers: [
    PrimeConfirmationService,
    WarningTableFacade,
    InformationService,
    EventSourceService,
    AttachmentService,
    {
      provide: FlowInjectionToken,
      useValue: Flow
    }
  ]
})
export class SharedModule { }
