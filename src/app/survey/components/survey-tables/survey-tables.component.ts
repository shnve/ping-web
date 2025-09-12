import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import MaritimeService, { MaritimeServiceBase } from '@app/models/maritime-service.model';
import { MaritimeServiceService } from '@app/services/maritime-services.service';
import { ChipValue } from '@app/shared/components/filter-banner/filter-banner.component';
import { PaginatedTableComponent } from '@app/shared/components/paginated-table/paginated-table.component';
import { SelectButtonOption } from '@app/shared/components/select-button/select-button.component';
import { PageInfo, SortInfo } from '@app/shared/models/paginated-table-view.model';
import { NotificationState } from '@app/states/notification.state';
import { TableState } from '@app/states/table.state';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { SurveyTableFilterValues, defaultValuesSurveyTableFilter } from '@app/survey/models/survey-filters.model';
import { TableSurvey } from '@app/survey/models/survey-table.model';
import { SurveyFileComplianceAnalysisState, SurveyStateEnum } from '@app/survey/models/survey.model';
import { SurveyProcessingStatusTranslationPipe } from '@app/survey/pipes/survey-processing-status-translation.pipe';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { format } from 'date-fns';
import { tap } from 'rxjs/operators';
import { surveyServiceProvider } from '../../providers/survey.service.provider';
import { AbstractSurveyService } from '../../services/survey.service';

const DESC = -1;

@Component({
  selector: 'survey-tables',
  templateUrl: './survey-tables.component.html',
  styleUrls: ['./survey-tables.component.scss'],
  providers: [
    { provide: TableState },
    surveyServiceProvider,
    SurveyProcessingStatusTranslationPipe
  ]
})
export class SurveyTablesComponent implements OnInit, OnDestroy {
  private readonly scavenger = new Scavenger(this);

  @ViewChild('surveyTable') surveyTable: PaginatedTableComponent<TableSurvey>;
  tableLoading = false;
  columns = {};
  selectedState: SurveyStateEnum;
  tabs: SelectButtonOption[] = [];
  tabsClass = 'three-tabs';
  services: MaritimeServiceBase[] = [];
  selectedService: MaritimeServiceBase = null;
  surveys: TableSurvey[] = [];
  totalSurveys = 0;
  showModal = false;
  selectedSurveyIds: string[];
  hasRoleServiceUser: boolean;
  NOT_AVAILABLE = SurveyFileComplianceAnalysisState.NOT_AVAILABLE;
  PENDING = SurveyFileComplianceAnalysisState.PENDING;
  NOT_COMPLIANT = SurveyFileComplianceAnalysisState.NOT_COMPLIANT;
  protected readonly TRANSMITTED = SurveyStateEnum.TRANSMITTED;
  public readonly filterState: ModelItemFilterState<SurveyTableFilterValues>;
  protected isBri: boolean;

  constructor(protected readonly tableState: TableState,
    private readonly alertMessageService: AlertMessageService,
    private readonly authService: AuthService,
    private readonly maritimeServiceService: MaritimeServiceService,
    private readonly route: ActivatedRoute,
    private readonly surveyService: AbstractSurveyService,
    private readonly notificationState: NotificationState,
    private readonly translate: TranslateService,
    private readonly surveyProcessingStatusTranslationPipe: SurveyProcessingStatusTranslationPipe) {
    this.filterState = new ModelItemFilterState<SurveyTableFilterValues>();
    this.filterState.initFilter(defaultValuesSurveyTableFilter);
    this.notificationState.getNotificationObjectId$().pipe(this.scavenger.collect()).subscribe((surveyId: string) => this.displayModal([{ id: surveyId }]));
  }

  ngOnInit(): void {
    this.hasRoleServiceUser = this.authService.hasRoleServiceUser();
    this.isBri = this.authService.isBri();

    if (this.isBri) {
      this.tabsClass = 'one-tab';
      this.tabs = [{
        code: SurveyStateEnum.TRANSMITTED,
        translateKey: 'survey-management.tabs.transmitted-bri'
      }];
    } else {
      this.tabs = [{
        code: SurveyStateEnum.TEST,
        translateKey: 'survey-management.tabs.test'
      }, {
        code: SurveyStateEnum.DRAFT,
        translateKey: 'survey-management.tabs.draft'
      }, {
        code: SurveyStateEnum.TRANSMITTED,
        translateKey: 'survey-management.tabs.transmitted'
      }];
    }

    const columnsForTransmittedState = [
      { field: 'identifier', translateKey: 'survey-table.columns.identifier', sortable: true },
      { field: 'nameAndLocation', translateKey: 'survey-table.columns.name-and-location', sortable: true },
      { field: 'period', translateKey: 'survey-table.columns.period', sortable: true },
      { field: 'compliant', translateKey: 'survey-table.columns.compliant', sortable: true },
      { field: 'testStatus', translateKey: 'survey-table.columns.test-status' },
      { field: 'transmissionStatus', translateKey: 'survey-table.columns.transmission-status', sortable: true },
      { field: 'expectedDeletionDate', translateKey: 'survey-table.columns.expected-deletion-date', sortable: true }
    ];

    const columnsForTransmittedBriState = [
      { field: 'identifier', translateKey: 'survey-table.columns.identifier', sortable: true },
      { field: 'shomId', translateKey: 'survey-table.columns.shom-id', sortable: true },
      { field: 'nameAndLocation', translateKey: 'survey-table.columns.name-and-location', sortable: true },
      { field: 'producerOrganization', translateKey: 'survey-table.columns.producer-organization', sortable: true },
      { field: 'ownerOrganization', translateKey: 'survey-table.columns.owner-organization', sortable: true },
      { field: 'period', translateKey: 'survey-table.columns.period', sortable: true },
      { field: 'compliant', translateKey: 'survey-table.columns.compliant', sortable: true },
      { field: 'transmissionStatus', translateKey: 'survey-table.columns.transmission-status', sortable: true },
      { field: 'expectedDeletionDate', translateKey: 'survey-table.columns.expected-deletion-date', sortable: true },
      { field: 'briInternalComment', translateKey: 'survey-table.columns.bri-internal-comment' }
    ];

    if (this.isBri) {
      this.columns = {
        TRANSMITTED: columnsForTransmittedBriState
      };
    } else {
      this.columns = {
        TEST: [
          { field: 'identifier', translateKey: 'survey-table.columns.identifier', sortable: true },
          { field: 'nameAndLocation', translateKey: 'survey-table.columns.name-and-location', sortable: true },
          { field: 'period', translateKey: 'survey-table.columns.period', sortable: true },
          { field: 'compliant', translateKey: 'survey-table.columns.compliant', sortable: true },
          { field: 'testStatus', translateKey: 'survey-table.columns.test-status' },
          { field: 'expectedDeletionDate', translateKey: 'survey-table.columns.expected-deletion-date', sortable: true }
        ],
        DRAFT: [
          { field: 'identifier', translateKey: 'survey-table.columns.identifier', sortable: true },
          { field: 'nameAndLocation', translateKey: 'survey-table.columns.name-and-location', sortable: true },
          { field: 'period', translateKey: 'survey-table.columns.period', sortable: true },
          { field: 'compliant', translateKey: 'survey-table.columns.compliant', sortable: true },
          { field: 'lastUpdate', translateKey: 'survey-table.columns.last-update', sortable: true },
          { field: 'expectedDeletionDate', translateKey: 'survey-table.columns.expected-deletion-date', sortable: true }
        ],
        TRANSMITTED: columnsForTransmittedState
      };
    }
    this.selectedState = SurveyStateEnum.TRANSMITTED;

    if (this.hasRoleServiceUser && !this.isBri) {
      this.maritimeServiceService.findByServiceIds$(this.getServices())
        .pipe(this.scavenger.collect())
        .subscribe(
          services => this.receiveServices(services),
          (err: Error) => this.handleErrorLoadingServices(err)
        );
    } else {
      this.loadSurveys();
    }
    const surveyToDisplayId = this.route.snapshot.paramMap.get('surveyId');
    if (surveyToDisplayId) {
      this.displayModal([{ id: surveyToDisplayId }]);
    }
  }

  ngOnDestroy(): void { }

  private loadSurveys(): void {
    if (this.hasRoleServiceUser && !this.filterState.getValues().service && !this.isBri) {
      this.tableLoading = false;
      return;
    }

    this.tableLoading = true;

    this.surveyService.loadFilteredPage$(
      this.tableState.getValues(),
      this.selectedState,
      this.isBri,
      this.filterState.getValues()
    ).pipe(
      this.scavenger.collect(),
      tap(surveysPage => {
        if (!surveysPage?.modelItems?.length) {
          this.alertMessageService.add({
            severity: 'warn',
            summary: 'message.summary.warn',
            detail: 'message.warn.filter.no-survey-found'
          });
        }
      })
    ).subscribe(surveysPage => {
      this.surveys = surveysPage.modelItems;
      this.totalSurveys = surveysPage.totalElements;
      this.tableLoading = false;
    }, () => {
      this.surveys = [];
      this.tableLoading = false;
      this.alertMessageService.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'message.error.api.filter.cannot-get-surveys'
      });
    });
  }

  protected handleErrorLoadingServices(err: Error): void {
    this.handleErrorLoading(err, 'cannot-get-services');
  }

  private handleErrorLoading(err: Error, errorKey: string): void {
    this.tableLoading = false;
    this.alertMessageService.add({
      severity: 'error',
      summary: 'message.summary.error',
      detail: `message.error.api.${errorKey}`
    });
    throw err;
  }

  private getServices(): string[] {
    return this.authService.getAuthenticatedUser()?.serviceRoles?.filter(role => role.surveyOwner === true)
      .map(serviceRole => serviceRole.serviceId);
  }

  protected receiveServices(services: MaritimeService[]): void {
    this.services = services;
    if (services?.length) {
      this.selectedService = this.services.find(service => service.id === this.authService.getAuthenticatedUser()?.serviceId);
      this.filterState.setValues({
        service: this.selectedService
      });
    }
  }

  private resetFilterWithRequiredValues(): void {
    const requiredFilterValues: SurveyTableFilterValues = {
      state: SurveyStateEnum[this.selectedState]
    };
    if (this.hasRoleServiceUser && this.selectedService && !this.isBri) {
      requiredFilterValues.service = this.selectedService;
    }
    this.filterState.setValues(requiredFilterValues);
  }

  selectedStateChanged(): void {
    this.resetFilterWithRequiredValues();
    this.tableState.setPageInfo({ page: 0 });
    this.surveyTable.reset();
    this.resetSort();
    this.tableState.resetSortInfo();
    this.loadSurveys();
  }

  private resetSort(): void {
    this.surveyTable.resetSort('identifier', DESC);
  }

  pageChange(pageInfo: PageInfo): void {
    this.surveys = [];
    this.tableState.setPageInfo({ ...pageInfo });
    this.loadSurveys();
  }

  sortChange(sortInfo: SortInfo): void {
    this.surveys = [];
    this.tableState.setSortInfo({ ...sortInfo });
    this.loadSurveys();
  }

  filterChange(filterValues: SurveyTableFilterValues): void {
    this.surveys = [];
    this.tableState.setPageInfo({ page: 0 });
    if (this.hasRoleServiceUser && this.selectedService?.id !== filterValues.service?.id && !this.isBri) {
      this.selectedService = filterValues.service;
    }
    this.loadSurveys();
  }

  protected transformDatePeriodeToChip({ startDate, endDate }: { startDate?: Date, endDate?: Date }, key: string, i18nKey: string): ChipValue {
    const periodFormated = [
      startDate ? format(startDate, 'dd/MM/yy') : '',
      endDate ? format(endDate, 'dd/MM/yy') : '',
    ];
    return {
      key,
      translateKey: `filter.filter-bar.chip.${i18nKey}`,
      translateParams: { period: periodFormated.join(' - ') }
    };
  }

  generateFilterChipsText(filterValues: SurveyTableFilterValues): ChipValue[] {
    const chips: ChipValue[] = [];

    if (filterValues.identifier) {
      chips.push({
        key: 'identifier',
        translateKey: 'filter.filter-bar.chip.survey.identifier',
        translateParams: { identifier: filterValues.identifier }
      });
    }

    if (filterValues.nameAndLocation) {
      chips.push({
        key: 'nameAndLocation',
        translateKey: 'filter.filter-bar.chip.survey.name-and-location',
        translateParams: { nameAndLocation: filterValues.nameAndLocation }
      });
    }

    if (filterValues.period?.startDate || filterValues?.period?.endDate) {
      chips.push(this.transformDatePeriodeToChip(filterValues.period, 'period', 'period'));
    }

    if (filterValues.transmissionPeriod?.startDate || filterValues?.transmissionPeriod?.endDate) {
      chips.push(this.transformDatePeriodeToChip(filterValues.transmissionPeriod, 'transmissionPeriod', 'survey.transmission-period'));
    }

    if (this.isBri) {
      if (filterValues.shomId) {
        chips.push({
          key: 'shomId',
          translateKey: 'filter.filter-bar.chip.survey.shom-id',
          translateParams: { shomId: filterValues.shomId }
        });
      }

      if (filterValues.producerOrganization) {
        chips.push({
          key: 'producerOrganization',
          translateKey: 'filter.filter-bar.chip.survey.producer-organization',
          translateParams: { producerOrganization: filterValues.producerOrganization }
        });
      }

      if (filterValues.ownerOrganization) {
        chips.push({
          key: 'ownerOrganization',
          translateKey: 'filter.filter-bar.chip.survey.owner-organization',
          translateParams: { ownerOrganization: filterValues.ownerOrganization }
        });
      }

      if (filterValues.notCompliant === true) {
        chips.push({
          key: 'notCompliant',
          translateKey: 'filter.filter-bar.chip.survey.not-compliant'
        });
      }

      if (filterValues.transmissionStatus) {
        chips.push({
          key: 'transmissionStatus',
          translateKey: 'filter.filter-bar.chip.survey.transmission-status',
          translateParams: {
            transmissionStatus: this.translate.instant(this.surveyProcessingStatusTranslationPipe.transform(filterValues.transmissionStatus))
          }
        });
      }

      if (filterValues.expectedDeletionDate) {
        chips.push({
          key: 'expectedDeletionDate',
          translateKey: 'filter.filter-bar.chip.survey.expected-deletion-date',
          translateParams: {date: format(filterValues.expectedDeletionDate, 'dd/MM/yy')}
        });
      }
      
      if (filterValues.briInternalComment) {
        chips.push({
          key: 'briInternalComment',
          translateKey: 'filter.filter-bar.chip.survey.bri-internal-comment'
        });
      }
    }

    return chips;
  }

  displayModal(surveys: Partial<TableSurvey>[]): void {
    this.selectedSurveyIds = surveys.map(survey => survey.id);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.loadSurveys();
  }

  onChangeLang(): void {
    this.loadSurveys();
  }

  stateChanged(state: SurveyStateEnum): void {
    if (this.selectedState !== state) {
      this.selectedState = state;
      this.selectedStateChanged();
    }
  }
}
