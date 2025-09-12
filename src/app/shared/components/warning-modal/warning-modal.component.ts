import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WarningApi, WarningsDownloadS124ApiParams } from '@app/api/warning.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { LangService } from '@app/core/lang.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { SeriesAdminFacade } from '@app/facades/admin/series-admin.facade';
import { WarningsFacade } from '@app/facades/admin/warnings.facade';
import { MapWarningsFacade } from '@app/facades/map-warnings.facade';
import { ServiceRole } from '@app/models/maritime-service.model';
import { NotionType } from '@app/models/notion.model';
import { Serie } from '@app/models/serie.model';
import { AdminJsonWarning, JsonWarning, MainWarningPart, WarningFeaturePart, listWarningStatus } from '@app/models/warning.model';
import { GetNumberForSearchedPartPipe } from '@app/shared/pipes/get-number-for-searched-part.pipe';
import { HasGeometriesPipe } from '@app/shared/pipes/has-geometries.pipe';
import { ExportPdfService } from '@app/shared/services/export-pdf.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { WarningFeatureFactory } from '@sig/core/warning-feature.factory';
import { saveAs } from 'file-saver';
import { pick } from 'lodash-es';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Observable, throwError } from 'rxjs';
import { DetailsModalComponent } from '../details-modal/details-modal.component';
import { getSharedLinkUrl } from '@shared/warning-utils';

@Localize()
@Component({
  selector: 'shared-warning-modal',
  templateUrl: './warning-modal.component.html',
  styleUrls: [
    '../details-modal/details-modal.component.scss',
    './warning-modal.component.scss'
  ]
})
export class WarningModalComponent extends DetailsModalComponent implements OnInit, OnDestroy, OnChanges, OnChangeLang {

  @Input() mainWarningsParts: Partial<MainWarningPart>[] = [];
  @Input() selectedStatus = '';
  @Input() serieSelected: Serie;
  @Output() onPublishOrDelete = new EventEmitter<void>();

  @ViewChild('clonePanel') clonePanel: OverlayPanel;
  @ViewChild('addToFolderPanel') addToFolderPanel: OverlayPanel;
  @ViewChild('cancelPanel') cancelPanel: OverlayPanel;
  @ViewChild('menu') menu: Menu;
  @ViewChild('downloadPanel') downloadPanel: OverlayPanel;
  @ViewChild('manageButton') manageButton: ElementRef;
  warningPart: Partial<MainWarningPart>;
  canEdit = false;
  canSetReviewed = false;
  canPublish = false;
  canDelete = false;
  canCancel = false;
  canClone = false;
  canAddToFolder = false;
  availableSeriesForCloningWarning: Serie[];
  selectedSerieIdForCloningWarning: string;
  selectedStatusToCopy = listWarningStatus.DRAFT;
  private items: MenuItem[] = [];
  selectedFormatToDownload: string;
  private readonly filenameByFormat = {
    'kml': 'export.kml',
    'shp': 'shapefiles.zip',
    's-124': 'export.xml',
    'gpx': 'export.gpx'
  };
  allowedFormatToDownload = [];
  formatToDownload = [
    {
      label: 'KML',
      value: 'kml'
    },
    {
      label: 'SHP',
      value: 'shp'
    },
    /* Temporally removed: DO NOT REMOVE LINES BELOW
    {
      label: 'S-124',
      value: 's-124',
      onlyIfWarningPublished: true,
      checkSerieHasCurrentLang: true
    },*/
    {
      label: 'GPX',
      value: 'gpx',
      onlyIfWarningPublished: true
    }
  ];
  showPublicationAlertMessage = false;

  constructor(private readonly router: Router,
    private readonly mapWarningsFacade: MapWarningsFacade,
    private readonly warningsAdminFacade: WarningsFacade,
    private readonly warningFeatureFactory: WarningFeatureFactory,
    protected readonly authService: AuthService,
    private readonly confirmationService: ConfirmationService,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly translate: TranslateService,
    protected readonly langService: LangService,
    private readonly seriesAdminFacade: SeriesAdminFacade,
    private readonly exportPdfService: ExportPdfService,
    protected readonly elRef: ElementRef,
    private readonly warningApi: WarningApi,
    private readonly hasGeometriesIn: HasGeometriesPipe,
    protected readonly getNumberForSearchedPart: GetNumberForSearchedPartPipe) {
    super(translate, alertMessageService, langService, elRef, authService, getNumberForSearchedPart);
    this.availableLanguages = [
      { code: 'fr', imageSrc: 'assets/images/flag-france.png' },
      { code: 'en', imageSrc: 'assets/images/flag-uk.png' }
    ];
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.mainWarningsParts && this.mainWarningsParts) {
      this.highlightedFeatures = { geometries: [], affectedAreas: [] };
      this.previousHighlightedFeatures = { geometries: [], affectedAreas: [] };
      this.notionType = NotionType.WARNING;
      this.proUser = this.authService.isProUser();
      this.warningPart = this.mainWarningsParts[this.currentPosition];
      this.updateSharedLinkUrl();
      this.loadWarning();
      this.show();
    }
  }

  hasPrevious() {
    return this.currentPosition - 1 >= 0;
  }

  hasNext() {
    return this.currentPosition + 1 < this.mainWarningsParts.length;
  }

  previous() {
    if (this.hasPrevious()) {
      --this.currentPosition;
      this.warningPart = this.mainWarningsParts[this.currentPosition];
      this.updateSharedLinkUrl();
      this.loadWarning();
    }
  }

  next() {
    if (this.hasNext()) {
      ++this.currentPosition;
      this.warningPart = this.mainWarningsParts[this.currentPosition];
      this.updateSharedLinkUrl();
      this.loadWarning();
    }
  }

  protected loadWarning() {
    if (!this.warningPart?.id) { return; }
    if (this.authService.hasRoleServiceUser()) {
      this.warningsAdminFacade.getById$(this.warningPart.id)
        .pipe(this.scavenger.collect())
        .subscribe(warning => {
          this.setJsonWarningToWarning(warning);
          this.checkActions(warning);
        });
    } else {
      this.mapWarningsFacade.getWarningById$(this.warningPart.id)
        .pipe(this.scavenger.collect())
        .subscribe({
          next: warning => this.setJsonWarningToWarning(warning),
          error: error => {
            this.showToast(this.translate.instant(`message.${error.error.message}`), 'error');
            this.hide();
          }
        });
    }
  }

  protected setJsonWarningToWarning(warning: JsonWarning) {
    let featureParts;
    if (warning.featureParts) {
      featureParts = warning.featureParts
        .map<WarningFeaturePart>(featurePart => {
          return {
            ...featurePart,
            geometries: this.warningFeatureFactory.createGeometries(warning, featurePart.geometries),
            affectedAreas: this.warningFeatureFactory.createAffectedAreas(warning, featurePart.affectedAreas)
          };
        });
    }

    this.warningPart = pick(warning, ['id', 'nameOfSeries', 'warningNumber', 'year']);

    this.warning = {
      ...warning,
      featureParts
    };

    this.setAllowedFormatToDownload(this.translate.instant('lang'));

    this.canDisplayMap = featureParts?.some(part => part.geometries?.length || part.affectedAreas?.length);
  }

  checkActions(warning: AdminJsonWarning): void {
    this.canDelete = this.checkIfCanDelete(warning);
    this.canEdit = this.checkIfCanEdit(warning);
    this.canPublish = this.checkIfCanPublish(warning);
    this.canCancel = this.checkIfCanCancel(warning);
    this.canClone = this.checkIfCanClone();
    this.canSetReviewed = this.checkIfCanSetReviewed(warning);
    this.canAddToFolder = warning.canBeAddedToFolder;
    this.canSetReviewed = this.checkIfCanSetReviewed(warning);

    this.showPublicationAlertMessage = !this.canPublish && warning?.status === listWarningStatus.DRAFT;
    this.buildManagementMenu();
  }

  checkIfCanEditAndDelete(warning: AdminJsonWarning): boolean {
    return this.checkIfActionIsAvailableAccordingStatus(warning, listWarningStatus.DRAFT);
  }

  checkIfCanSetReviewed(warning: AdminJsonWarning): boolean {
    if (!warning.forceToReview) {
      return false;
    }
    const warningHasCorrectStatus = warning.status === listWarningStatus.PUBLISHED;
    const userHasCorrectRoleOnService = this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], warning.serviceId);

    return warningHasCorrectStatus && userHasCorrectRoleOnService;
  }

  checkIfCanEdit(warning: AdminJsonWarning): boolean {
    return this.checkIfActionIsAvailableAccordingStatus(warning, listWarningStatus.DRAFT)
      || this.checkIfActionIsAvailableAccordingStatus(warning, listWarningStatus.MODEL)
      || this.checkIfActionIsAvailableAccordingStatus(warning, listWarningStatus.PUBLISHED);
  }

  checkIfCanDelete(warning: AdminJsonWarning): boolean {
    return this.checkIfActionIsAvailableAccordingStatus(warning, listWarningStatus.DRAFT)
      || this.checkIfActionIsAvailableAccordingStatus(warning, listWarningStatus.MODEL);
  }

  checkIfCanPublish(warning: AdminJsonWarning): boolean {
    const userHasCorrectRoleOnService = this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], warning.serviceId);

    return warning.canBePublished && userHasCorrectRoleOnService;
  }

  checkIfCanClone(): boolean {
    return this.authService.hasAnyRole([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR]);
  }

  checkIfCanCancel(warning: AdminJsonWarning): boolean {
    return this.checkIfActionIsAvailableAccordingStatus(warning, listWarningStatus.PUBLISHED);
  }

  checkIfActionIsAvailableAccordingStatus(warning: AdminJsonWarning, expectedStatus: string): boolean {
    const warningHasCorrectStatus = warning.status === expectedStatus;

    const userHasCorrectRoleOnService = this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], warning.serviceId);

    return warningHasCorrectStatus && userHasCorrectRoleOnService;
  }

  edit(): void {
    this.router.navigate(['/administration/warnings/edition/' + this.warning.id]);
  }

  confirmReviewed(event: Event): void {
    this.confirmationService.confirm({
      target: this.manageButton.nativeElement,
      message: this.translate.instant('detail.confirm-set-reviewed'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.setReviewed();
      }
    });
  }

  private setReviewed(): void {
    this.warningsAdminFacade.setReviewed$(this.warning.id).subscribe(
      () => {
        this.showToast(this.translate.instant('detail.set-reviewed-success'), 'success');
        this.canSetReviewed = false;
        this.onStatusChangeAction.emit();
      },
      () => this.showToast(this.translate.instant('detail.set-reviewed-error'), 'error'));
  }

  confirmPublish(event: Event): void {
    const confirmPublishMessage = this.selectedStatus === listWarningStatus.DRAFT ? 'detail.publish-confirm-draft' : 'detail.publish-confirm';
    this.confirmationService.confirm({
      target: this.manageButton.nativeElement,
      message: this.translate.instant(confirmPublishMessage),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.publish();
      }
    });
  }

  publish(): void {
    this.canPublish = false;
    let toastSuccessPublishMessage = 'detail.publish-success';
    let toastErrorPublishMessage = 'detail.publish-error';
    if (this.selectedStatus === listWarningStatus.DRAFT) {
      toastSuccessPublishMessage = 'detail.publish-success-draft';
      toastErrorPublishMessage = 'detail.publish-error-draft';
    }
    this.warningsAdminFacade.publish$(this.warning.id).subscribe(
      () => {
        this.showToast(this.translate.instant(toastSuccessPublishMessage), 'success');
        this.onStatusChangeAction.emit();
      },
      () => {
        this.showToast(this.translate.instant(toastErrorPublishMessage), 'error');
      });
  }

  confirmDelete(event: Event): void {
    const confirmDeleteMessage = this.selectedStatus === listWarningStatus.DRAFT ? 'detail.delete-confirm-draft' : 'detail.delete-confirm';
    this.confirmationService.confirm({
      target: this.manageButton.nativeElement,
      message: this.translate.instant(confirmDeleteMessage),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.delete();
      }
    });
  }

  delete(): void {
    this.canDelete = false;
    let toastSuccessDeleteMessage = 'detail.delete-success';
    let toastErrorDeleteMessage = 'detail.delete-error';
    if (this.selectedStatus === listWarningStatus.DRAFT) {
      toastSuccessDeleteMessage = 'detail.delete-success-draft';
      toastErrorDeleteMessage = 'detail.delete-error-draft';
    }
    this.warningsAdminFacade.delete$(this.warning.id).subscribe(
      () => {
        this.showToast(this.translate.instant(toastSuccessDeleteMessage), 'success');
        this.onStatusChangeAction.emit();
      },
      () => {
        this.showToast(this.translate.instant(toastErrorDeleteMessage), 'error');
      });
  }

  confirmCancel(event: Event): void {
    this.cancelPanel.show(event, this.manageButton.nativeElement);
  }

  confirmAddNotionToFolder(event: Event): void {
    this.addToFolderPanel.show(event, this.manageButton.nativeElement);
  }

  cancel(): void {
    this.warningsAdminFacade.cancel$(this.warning.id).subscribe(
      () => {
        this.showToast(this.translate.instant('detail.cancel-success'), 'success');
        this.onStatusChangeAction.emit();
      },
      () => {
        this.showToast(this.translate.instant('detail.cancel-error'), 'error');
      });
  }

  fetchAvailableSeriesForCloningWarning(event: Event): void {
    this.seriesAdminFacade.getSeriesByUser$()
      .pipe(this.scavenger.collect())
      .subscribe(series => {
        this.availableSeriesForCloningWarning = series;
        // nativeElement is use to attach overlayPanel to manageButton
        this.clonePanel.show(event, this.manageButton.nativeElement);
      });
  }

  closeCancellation(cancelled: boolean): void {
    this.cancelPanel.hide();
    this.canCancel = cancelled;
  }

  addingPanelClosed(): void {
    this.addToFolderPanel.hide();
  }

  cancelClone(): void {
    this.clonePanel.hide();
  }

  confirmClone(): void {
    this.warningsAdminFacade.clone$(this.warning.id, this.selectedSerieIdForCloningWarning, null, this.selectedStatusToCopy)
      .pipe(this.scavenger.collect())
      .subscribe(clonedWarningId => {
        this.router.navigate([`/administration/warnings/edition/${clonedWarningId}`]);
      });
  }

  private updateSharedLinkUrl(): void {
    // replace in url when warning modal called from admin table, because /administration/warnings/tables/:warningId doesn't exist
    if (!this.warningPart?.id) { return; }
    this.currentSharedLinkUrl = getSharedLinkUrl(this.warningPart.id, window.location.href);
  }

  generatePdf($event: any): void {
    this.exportPdfService.exportWarningModal(this.warning, this.mapComponent?.map.olMap);
    $event.preventDefault();
  }

  get canManage(): boolean {
    return this.canDelete || this.canEdit || this.canPublish || this.canCancel || this.canClone || this.canSetReviewed || this.canAddToFolder || this.canSetReviewed;
  }

  buildManagementMenu(): void {
    this.items = [];

    if (this.canEdit) {
      this.items.push({
        label: this.translate.instant('detail.edit'),
        command: () => {
          this.edit();
        },
        title: this.translate.instant('detail.edit')
      });
    }

    if (this.canPublish) {
      this.items.push({
        label: this.translate.instant('detail.publish'),
        command: (event: any) => {
          this.confirmPublish(event.originalEvent);
        },
        title: this.translate.instant('detail.publish')
      });
    }

    if (this.canSetReviewed) {
      this.items.push({
        label: this.translate.instant('detail.set-reviewed'),
        command: (event: any) => {
          this.confirmReviewed(event.originalEvent);
        },
        title: this.translate.instant('detail.set-reviewed')
      });
    }

    if (this.canClone) {
      this.items.push({
        label: this.translate.instant('detail.clone'),
        command: (event: any) => {
          this.fetchAvailableSeriesForCloningWarning(event.originalEvent);
        },
        title: this.translate.instant('detail.clone')
      });
    }

    if (this.canDelete) {
      this.items.push({
        label: this.translate.instant('detail.delete'),
        command: (event: any) => {
          this.confirmDelete(event.originalEvent);
        },
        title: this.translate.instant('detail.delete')
      });
    }

    if (this.canCancel) {
      this.items.push({
        label: this.translate.instant('detail.cancel'),
        command: (event: any) => {
          this.confirmCancel(event.originalEvent);
        },
        title: this.translate.instant('detail.cancel')
      });
    }

    if (this.canAddToFolder) {
      this.items.push({
        label: this.translate.instant('folder.details.add-notion-to-folder.show-panel'),
        command: (event: any) => {
          this.confirmAddNotionToFolder(event.originalEvent);
        },
        title: this.translate.instant('folder.details.add-notion-to-folder.show-panel')
      });
    }
  }

  get hasGeometries(): boolean {
    return this.warning?.featureParts?.some(featurePart => this.hasGeometriesIn.transform(featurePart, NotionType.WARNING));
  }

  confirmDownload(): void {
    let downloadRequest: Observable<Blob>;
    const lang = this.translate.instant('lang');
    if (this.selectedFormatToDownload === 's-124') {
      const params: WarningsDownloadS124ApiParams = {
        nameOfSeries: this.warning.nameOfSeries,
        warningNumber: this.warning.warningNumber,
        year: this.warning.year,
        lang
      };
      downloadRequest = this.warningApi.downloadS124$(params);
    } else {
      downloadRequest = this.warningApi.downloadGeometries$(this.warning.id, this.selectedFormatToDownload, lang);
    }
    downloadRequest.pipe(this.scavenger.collect())
      .subscribe(
        blob => {
          if (this.selectedFormatToDownload === 'gpx') {
            saveAs(blob, `${this.warning.nameOfSeries}-${this.warning.warningNumber}-${this.warning.year % 100}.gpx`);
          } else {
            saveAs(blob, `${this.filenameByFormat[this.selectedFormatToDownload]}`);
          }
          this.selectedFormatToDownload = null;
          this.downloadPanel.hide();
        },
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-download-file'
          });
          return throwError(err);
        }
      );
  }

  private setAllowedFormatToDownload(lang: string): void {
    this.allowedFormatToDownload = this.formatToDownload.filter(format =>
      (this.warning?.status === listWarningStatus.PUBLISHED || !format.onlyIfWarningPublished)
      /* Temporally removed (s-124): DO NOT REMOVE LINES BELOW
      && ((this.serieSelected && this.serieSelected.mandatoryLanguages.concat(this.serieSelected.optionalLanguages).includes(lang))
        || !format.checkSerieHasCurrentLang)*/
    );
  }

  onChangeLang(event: LangChangeEvent): void {
    this.setAllowedFormatToDownload(event.lang);
    this.buildManagementMenu();
  }

}
