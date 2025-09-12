import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { LangService } from '@app/core/lang.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { SeriesAdminFacade } from '@app/facades/admin/series-admin.facade';
import { getInfosourceNature } from '@app/infosource/infosource-utils';
import { InfosourceState } from '@app/infosource/models/infosource-table.model';
import {
  Infosource, InfosourceNature, InfosourceObjectMapKeys,
  InfosourcePart,
  InfosourceStatus,
  InfosourceWithJsonParts,
  TRANSLATIONS_LIST_INFOSOURCE_NATURE
} from '@app/infosource/models/infosource.model';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { AbstractInfosourceService } from '@app/infosource/services/infosource.service';
import MaritimeService, { ServiceRole } from '@app/models/maritime-service.model';
import { NotionType } from '@app/models/notion.model';
import { Serie } from '@app/models/serie.model';
import { DetailsModalComponent } from '@app/shared/components/details-modal/details-modal.component';
import { GetNumberForSearchedPartPipe } from '@app/shared/pipes/get-number-for-searched-part.pipe';
import { ExportPdfService } from '@app/shared/services/export-pdf.service';
import { InfosourceFeatureFactory } from '@app/sig/core/infosource-feature.factory';
import { SurveyDangerFactory } from '@app/sig/core/survey-danger.factory';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import pick from 'lodash-es/pick';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Subject } from 'rxjs';

@Localize()
@Component({
  selector: 'infosource-modal',
  templateUrl: './infosource-modal.component.html',
  styleUrls: [
    '../../../shared/components/details-modal/details-modal.component.scss',
    './infosource-modal.component.scss'
  ],
  providers: [
    infosourceServiceProvider
  ]
})
export class InfosourceModalComponent extends DetailsModalComponent implements OnChanges, OnChangeLang {

  @ViewChild('sendPanel') sendPanel: OverlayPanel;
  @ViewChild('clonePanel') clonePanel: OverlayPanel;
  @ViewChild('createWarningPanel') createWarningPanel: OverlayPanel;
  @ViewChild('addToFolderPanel') addToFolderPanel: OverlayPanel;

  infosourcePartial: Partial<Infosource>;

  canEditOrDelete = false;

  canReject = false;

  canSend = false;

  canClone = false;

  canCreateWarning = false;

  canAddInfosourceToFolder = false;

  availableMaritimeServicesRecipients: MaritimeService[] = [];

  selectedMaritimeServicesRecipients: Array<string> = [];

  availableTransferableServices: MaritimeService[] = [];

  selectedTransferableServices: Array<string> = [];

  availableSeriesForCreatingWarning: Serie[];

  selectedSerieIdForCreatingWarning: string;

  copyDataFromInfosource = false;

  orderArray = [
    InfosourceObjectMapKeys.INDICATION_INCIDENT_CODE.toString(),
    InfosourceObjectMapKeys.LEVEL.toString(),
    InfosourceObjectMapKeys.NATURAL_NOTICE_CODE.toString(),
    InfosourceObjectMapKeys.TITLE_INCIDENT_CODE.toString(),
    InfosourceObjectMapKeys.TITLE_CMS_CODE.toString(),
    InfosourceObjectMapKeys.RECOVERY_TIME_CODE.toString(),
    InfosourceObjectMapKeys.COMMENT.toString(),
    InfosourceObjectMapKeys.COSTAL_SERVICE.toString(),
    InfosourceObjectMapKeys.TERRITORIAL_DIVISION.toString(),
    InfosourceObjectMapKeys.PREVIOUS_NOTICE_NUMBER.toString()
  ];

  @Input() mainInfosourcesParts: Partial<Infosource>[] = [];
  @Input() serviceSelectedId: string;
  @ViewChild('transferPanel') transferPanel: OverlayPanel;
  @ViewChild('rejectPanel') rejectPanel: OverlayPanel;
  @ViewChild('manageButton') manageButton: ElementRef;
  @ViewChild('menu') menu: Menu;
  optionalComment: string;
  shouldDisplayStatusByService = false;
  protected readonly transferred$: Subject<void> = new Subject<void>();
  readonly infosourceState = InfosourceState;

  private items: MenuItem[] = [];
  protected canManage = false;

  protected shouldDisplayInfoOnHoverGeometry = false;

  protected nbGeometries = 0;

  constructor(protected readonly alertMessageService: AlertMessageService,
    protected readonly translate: TranslateService,
    protected readonly langService: LangService,
    protected readonly elRef: ElementRef,
    protected readonly authService: AuthService,
    private readonly infosourceService: AbstractInfosourceService,
    private readonly infosourceFeatureFactory: InfosourceFeatureFactory,
    protected readonly surveyDangerFactory: SurveyDangerFactory,
    private readonly confirmationService: ConfirmationService,
    private readonly seriesAdminFacade: SeriesAdminFacade,
    private readonly exportPdfService: ExportPdfService,
    private readonly router: Router,
    protected readonly getNumberForSearchedPart: GetNumberForSearchedPartPipe) {
    super(translate, alertMessageService, langService, elRef, authService, getNumberForSearchedPart);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.mainInfosourcesParts && this.mainInfosourcesParts) {
      this.highlightedFeatures = { localisation: [] };
      this.previousHighlightedFeatures = { localisation: [] };
      this.notionType = NotionType.INFOSOURCE;
      this.infosourcePartial = this.mainInfosourcesParts[this.currentPosition];
      this.loadInfosource();
      this.show();
    }
  }

  protected loadInfosource(): void {
    this.infosourceService.getInfosourceById$(this.infosourcePartial.id)
      .pipe(this.scavenger.collect())
      .subscribe(infosource => {
        this.shouldDisplayInfoOnHoverGeometry = infosource.nature === InfosourceNature.BATHY;
        this.updateInfosourceWithParts(infosource);
        this.checkActions(infosource);
        this.updateSharedLinkUrl();
      });
  }

  protected updateInfosourceWithParts(infosourceWithJsonParts: InfosourceWithJsonParts): void {
    let featureParts: InfosourcePart[];
    if (infosourceWithJsonParts.featureParts) {
      featureParts = infosourceWithJsonParts.featureParts
        .map<InfosourcePart>(featurePart => {
          return {
            ...featurePart,
            localisation: this.infosourceFeatureFactory.createGeometries(infosourceWithJsonParts, featurePart.localisation),
            detections: infosourceWithJsonParts.surveyDetections ? this.surveyDangerFactory.createGeometries(infosourceWithJsonParts.surveyDetections, true) : []
          };
        });
      this.nbGeometries = featureParts.map(featurePart => featurePart.localisation.length).reduce((a, b) => a + b, 0);
    }

    this.infosourcePartial = pick(infosourceWithJsonParts,
      ['id',
        'number',
        'type',
        'status',
        'comment',
        'rejectComment',
        'creationDate',
        'lastUpdate',
        'validationTime',
        'timezone',
        'issuingUserFirstname',
        'issuingUserLastname',
        'issuingServiceName'
      ]);

    this.infosource = {
      ...infosourceWithJsonParts,
      featureParts
    };

    if (this.infosource.object) {
      const orderedObject = [...Object.entries(this.infosource.object)]
        .sort(([ka], [kb]) => this.orderArray.indexOf(ka) - this.orderArray.indexOf(kb));
      this.infosource.object = Object.assign({}, ...orderedObject.map(([k, v]) => ({ [k]: v })));
    }
    this.canDisplayMap = featureParts?.some(part => part.localisation?.length);
  }

  checkActions(infosource: InfosourceWithJsonParts): void {
    this.canSend = this.checkIfCanSendOrUpdate(infosource);
    this.canReject = this.checkIfCanReject(infosource);
    this.canClone = this.checkIfCanClone(infosource);
    this.canEditOrDelete = this.checkIfCanEditOrDelete(this.canSend, infosource);
    this.canCreateWarning = this.checkIfCanCreateWarning(infosource);
    this.shouldDisplayStatusByService = this.infosource.status !== InfosourceStatus.DRAFT;
    this.canAddInfosourceToFolder = infosource.canBeAddedToFolder;

    this.canManage = this.canEditOrDelete || this.canSend || this.canReject || this.canClone || this.infosource?.canBeTransfered || this.canCreateWarning || this.canAddInfosourceToFolder;

    this.buildManagementMenu();
  }

  get infosourceNature(): string {
    return TRANSLATIONS_LIST_INFOSOURCE_NATURE.find(type => type.key === this.infosource?.nature)?.value;
  }

  checkIfCanEditOrDelete(canSendOrUpdate: boolean, infosource: InfosourceWithJsonParts): boolean {
    return canSendOrUpdate && infosource.status === InfosourceStatus.DRAFT;
  }

  checkIfCanSendOrUpdate(infosource: InfosourceWithJsonParts): boolean {
    // if IS not draft or user is not logged in
    if (infosource.status !== InfosourceStatus.DRAFT || !this.authService.isLoggedIn()) {
      return false;
    }

    const authenticatedUser = this.authService.getAuthenticatedUser();
    const userId = authenticatedUser.id;

    // if public user and IS created by this user
    if (this.authService.isPublicUser() && infosource.issuingPublicUserId === userId) {
      return true;
    }

    // if service user and user has roles on IS issuing service
    if (this.authService.hasRoleServiceUser()
      && this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], infosource.issuingServiceId)) {
      return true;
    }

    return false;
  }

  checkIfCanReject(infosource: InfosourceWithJsonParts): boolean {
    return ![InfosourceStatus.DRAFT, InfosourceStatus.REJECTED].includes(infosource.status) && this.authService.belongsToGovernmentService();
  }

  checkIfCanClone(infosource: InfosourceWithJsonParts): boolean {
    return ![InfosourceNature.LIGHTHOUSE_AND_BEACON, InfosourceNature.GEOREGULATION, InfosourceNature.SURVEY_TRANSMISSION, InfosourceNature.BATHY].includes(infosource.nature)
      && this.authService.isProUser();
  }

  checkIfCanCreateWarning(infosource: InfosourceWithJsonParts): boolean {
    // if IS not draft or user is not logged in or user is not a service-user
    if (infosource.nature === InfosourceNature.SURVEY_TRANSMISSION || infosource.status === InfosourceStatus.DRAFT
      || !this.authService.canCreateWarning()) {
      return false;
    }

    // check if user has right on at least one infosource recipient
    return infosource.recipients.map(recipient => recipient.id)
      .some(serviceId => this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], serviceId));
  }

  clone(event: Event): void {
    this.clonePanel.show(event, this.manageButton.nativeElement);
  }

  cancelClone(): void {
    this.clonePanel.hide();
  }

  confirmClone(): void {
    this.infosourceService.clone$(this.infosource.id)
      .pipe(this.scavenger.collect())
      .subscribe(clonedInfosourceId => {
        this.router.navigate([`/infosource/${getInfosourceNature(this.infosource.nature)}/${clonedInfosourceId}`]);
      },
        () => this.showToast(this.translate.instant('detail.clone-error'), 'error'));
  }

  confirmAddNotionToFolder(event: Event): void {
    this.addToFolderPanel.show(event, this.manageButton.nativeElement);
  }

  confirmSend(event: Event): void {
    if (this.authService.isPublicUser()) {
      this.confirmationService.confirm({
        target: this.manageButton.nativeElement,
        message: this.translate.instant('detail.send-confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.send();
        }
      });
    } else {
      this.retrieveRecipients(event);
    }
  }

  retrieveRecipients(event: Event): void {
    this.infosourceService.getRoutingServices$(this.infosource.id)
      .pipe(this.scavenger.collect())
      .subscribe(recipients => {
        this.availableMaritimeServicesRecipients = recipients;
        this.selectedMaritimeServicesRecipients = this.availableMaritimeServicesRecipients
          .filter(maritimeServiceRecipient => maritimeServiceRecipient.defaultService === true)
          .map(maritimeServiceRecipient => maritimeServiceRecipient.id);

        this.sendPanel.show(event, this.manageButton.nativeElement);
      },
        () => this.alertMessageService.add({
          summary: 'message.summary.warn',
          severity: 'warn',
          detail: this.translate.instant('detail.infosource-rejected')
        })
      );
  }

  confirmDelete(event: Event): void {
    this.confirmationService.confirm({
      target: this.manageButton.nativeElement,
      message: this.translate.instant('infosource.details.delete.delete-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.delete();
      }
    });
  }

  delete(): void {
    this.canEditOrDelete = false;
    this.infosourceService.delete$(this.infosource.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.showToast(this.translate.instant('infosource.details.delete.delete-success'), 'success');
          this.onStatusChangeAction.emit();
        },
        () => {
          this.showToast(this.translate.instant('infosource.details.delete.delete-error'), 'error');
        }
      );
  }

  cancelSend(): void {
    this.sendPanel.hide();
    this.selectedMaritimeServicesRecipients = [];
  }

  send(): void {
    this.infosourceService.send$(this.infosource.id, this.selectedMaritimeServicesRecipients)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.canSend = false;
          this.showToast(this.translate.instant('detail.send-success'), 'success');
          this.showToast(this.translate.instant('detail.send-welcome-contribution'), 'success');
          this.onStatusChangeAction.emit();
        },
        err => {
          this.canSend = true;
          const errorsPayload = Object.keys(err);
          if (errorsPayload.length) {
            const responsePayload = err[errorsPayload[0]];
            this.alertMessageService.add({
              summary: 'message.summary.warn',
              severity: 'warn',
              detail: this.translate.instant(responsePayload)
            });
            return;
          }
          this.showToast(this.translate.instant('detail.send-error'), 'error');
        }
      );
  }

  reject(event: Event): void {
    this.rejectPanel.show(event, this.manageButton.nativeElement);
  }

  cancelReject(): void {
    this.rejectPanel.hide();
  }

  confirmReject(): void {
    this.infosourceService.reject(this.infosource.id, this.optionalComment)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.canReject = false;
          this.showToast(this.translate.instant('infosource.details.reject.success'), 'success');
          this.onStatusChangeAction.emit();
        },
        () => {
          this.canReject = true;
          this.showToast(this.translate.instant('infosource.details.reject.error'), 'error');
        }
      );
  }

  transfer(event): void {
    this.infosourceService.findTransferableServices$(this.infosource.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        transferableServices => {
          this.availableTransferableServices = transferableServices;
          this.transferPanel.show(event, this.manageButton.nativeElement);
        },
        () => {
          this.showToast(this.translate.instant('infosource.details.transfer.no-transferable-services'), 'error');
        }
      );
  }

  cancelTransfer(): void {
    this.transferPanel.hide();
  }

  confirmTransfer(): void {
    this.infosourceService.transfer$(this.infosource.id, this.selectedTransferableServices)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.showToast(this.translate.instant('infosource.details.transfer.success'), 'success');
          this.transferPanel.hide();
          this.selectedTransferableServices = [];
          this.transferred$.next();
        },
        () => {
          this.showToast(this.translate.instant('infosource.details.transfer.error'), 'error');
        }
      );
  }

  addingPanelClosed(): void {
    this.addToFolderPanel.hide();
  }

  generatePdf($event: any): void {
    this.exportPdfService.exportInfosourceModal(this.infosource, this.mapComponent.map.olMap);
    $event.preventDefault();
  }

  edit(): void {
    this.router.navigate([`/infosource/${getInfosourceNature(this.infosource.nature)}/${this.infosource.id}`],
      { state: { status: this.infosource.status } });
  }

  fetchAvailableSeriesForCreatingWarning(event: Event): void {
    this.seriesAdminFacade.getSeriesByUser$()
      .pipe(this.scavenger.collect())
      .subscribe(series => {
        this.availableSeriesForCreatingWarning = series;
        this.createWarningPanel.show(event, this.manageButton.nativeElement);
      });
  }

  cancelCreateWarning(): void {
    this.createWarningPanel.hide();
  }

  confirmCreateWarning(): void {
    this.infosourceService.createWarning$(this.infosource.id, this.selectedSerieIdForCreatingWarning, this.copyDataFromInfosource)
      .pipe(this.scavenger.collect())
      .subscribe(
        (createdWarningId: string) => {
          this.showToast(this.translate.instant('infosource.details.create-warning.success'), 'success');
          this.router.navigate([`/administration/warnings/edition/${createdWarningId}`]);
        },
        () => {
          this.showToast(this.translate.instant('infosource.details.create-warning.error'), 'error');
        }
      );
  }

  private updateSharedLinkUrl(): void {
    if (!this.infosource?.id) { return; }
    const url = window.location.href.split('/infosource/tables')[0];
    this.currentSharedLinkUrl = `${url.concat('/infosource/tables')}/${this.infosource.id}`;
  }

  buildManagementMenu(): void {
    this.items = [];

    if (this.canEditOrDelete) {
      this.items.push({
        label: this.translate.instant('detail.edit'),
        command: () => this.edit(),
        title: this.translate.instant('detail.edit')
      });

      this.items.push({
        label: this.translate.instant('detail.delete'),
        command: (event: any) => this.confirmDelete(event.originalEvent),
        title: this.translate.instant('detail.delete')
      });
    }

    if (this.canSend) {
      this.items.push({
        label: this.translate.instant('detail.send'),
        command: (event: any) => this.confirmSend(event.originalEvent),
        title: this.translate.instant('detail.send')
      });
    }

    if (this.canReject) {
      this.items.push({
        label: this.translate.instant('infosource.details.reject.show-panel'),
        command: (event: any) => this.reject(event.originalEvent),
        title: this.translate.instant('infosource.details.reject.show-panel')
      });
    }

    if (this.canClone) {
      this.items.push({
        label: this.translate.instant('detail.clone'),
        command: (event: any) => this.clone(event.originalEvent),
        title: this.translate.instant('detail.clone')
      });
    }

    if (this.infosource.canBeTransfered) {
      this.items.push({
        label: this.translate.instant('infosource.details.transfer.show-panel'),
        command: (event: any) => this.transfer(event.originalEvent),
        title: this.translate.instant('infosource.details.transfer.show-panel')
      });
    }

    if (this.canCreateWarning) {
      this.items.push({
        label: this.translate.instant('infosource.details.create-warning.show-panel'),
        command: (event: any) => this.fetchAvailableSeriesForCreatingWarning(event.originalEvent),
        title: this.translate.instant('infosource.details.create-warning.show-panel')
      });
    }

    if (this.canAddInfosourceToFolder) {
      this.items.push({
        label: this.translate.instant('folder.details.add-notion-to-folder.show-panel'),
        command: (event: any) => this.confirmAddNotionToFolder(event.originalEvent),
        title: this.translate.instant('folder.details.add-notion-to-folder.show-panel')
      });
    }
  }

  onChangeLang(event: LangChangeEvent): void {
    this.buildManagementMenu();
  }
}
