import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DownloadService } from '@app/admin/admin-warning/services/download.service';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { LangService } from '@app/core/lang.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { buildHtmlFromModalDetails, convertFromJsonGeoregulationNumberDate } from '@app/georegulation/georegulation-utils';
import { GeoregulationModalDetails, GeoregulationNumber, GeoregulationPartModalDetails, JsonGeoregulationModalDetails } from '@app/georegulation/models/georegulation.model';
import { GeoregulationFormatNumberPipe } from '@app/georegulation/pipes/georegulation-format-number.pipe';
import { georegulationServiceProvider } from '@app/georegulation/providers/georegulation.service.provider';
import { AbstractGeoregulationService } from '@app/georegulation/services/abstract-georegulation.service';
import { MaritimeServiceInfosourceRecipient, ServiceRole } from '@app/models/maritime-service.model';
import { NotionType } from '@app/models/notion.model';
import { DetailsModalComponent } from '@app/shared/components/details-modal/details-modal.component';
import { FormatMonthPipe } from '@app/shared/pipes/format-month.pipe';
import { GetNumberForSearchedPartPipe } from '@app/shared/pipes/get-number-for-searched-part.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { TranslateNamePipe } from '@app/shared/pipes/translate-name.pipe';
import { ExportPdfService } from '@app/shared/services/export-pdf.service';
import { GeoregulationFeatureFactory } from '@app/sig/core/georegulation-feature.factory';
import { environment } from '@env/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { OverlayPanel } from 'primeng/overlaypanel';
import { GeoregulationStatusEnum } from '../../models/georegulation.model';

@Localize()
@Component({
  selector: 'georegulation-modal',
  templateUrl: './georegulation-modal.component.html',
  styleUrls: [
    '../../../shared/components/details-modal/details-modal.component.scss',
    './georegulation-modal.component.scss'
  ],
  providers: [
    georegulationServiceProvider
  ]
})
export class GeoregulationModalComponent extends DetailsModalComponent implements OnChanges, OnChangeLang {

  @ViewChild('downloadPanel') downloadPanel: OverlayPanel;
  @ViewChild('sendPanel') sendPanel: OverlayPanel;
  @ViewChild('clonePanel') clonePanel: OverlayPanel;
  @ViewChild('addToFolderPanel') addToFolderPanel: OverlayPanel;
  @ViewChild('menu') menu: Menu;
  @ViewChild('manageButton') manageButton: ElementRef;

  @Input() georegulationIds: string[] = [];

  currentPosition = 0;
  hasPrevious: boolean;
  hasNext: boolean;

  canPublish = false;
  canRepeal = false;
  canEdit = false;
  canDelete = false;
  canClone = false;
  canAddGeoregulationToFolder = false;

  availableRecipients: MaritimeServiceInfosourceRecipient[] = [];
  selectedRecipients: MaritimeServiceInfosourceRecipient[] = [];

  clonedGeoregulationNumber: GeoregulationNumber;
  clonedGeoregulationNumberText: string;

  allowedFormatToDownload = [];
  private readonly filenameByFormat = {
    'kml': 'export.kml',
    'shp': 'shapefiles.zip',
    'gpx': 'export.gpx'
  };

  private readonly formatToDownload = [
    {
      label: 'KML',
      value: 'kml'
    },
    {
      label: 'SHP',
      value: 'shp'
    },
    {
      label: 'GPX',
      value: 'gpx',
      onlyIfGeoregulationPublished: true
    }
  ];
  selectedFormatToDownload: string;

  private items: MenuItem[] = [];
  protected canManage = false;

  private readonly sharedUrl = environment.basePortalUrl + environment.georegulationSharedUrlContext;

  constructor(
    protected readonly alertMessageService: AlertMessageService,
    protected readonly translate: TranslateService,
    protected readonly langService: LangService,
    protected readonly elRef: ElementRef,
    protected readonly authService: AuthService,
    protected readonly abstractGeoregulationService: AbstractGeoregulationService,
    protected readonly georegulationFeatureFactory: GeoregulationFeatureFactory,
    protected readonly downloadService: DownloadService,
    private readonly confirmationService: ConfirmationService,
    private readonly exportPdfService: ExportPdfService,
    private readonly formatGeoregulationNumberPipe: GeoregulationFormatNumberPipe,
    private readonly localizedDatePipe: LocalizedDatePipe,
    private readonly translateNamePipe: TranslateNamePipe,
    private readonly formatMonthPipe: FormatMonthPipe,
    private readonly router: Router,
    protected readonly getNumberForSearchedPart: GetNumberForSearchedPartPipe) {
    super(translate, alertMessageService, langService, elRef, authService, getNumberForSearchedPart);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.georegulationIds && this.georegulationIds) {
      this.highlightedFeatures = { features: [] };
      this.previousHighlightedFeatures = { features: [] };
      this.notionType = NotionType.GEOREGULATION;
      this.proUser = this.authService.isProUser();
      this.loadGeoregulation();
      this.show();
    }
  }

  private loadGeoregulation(): void {
    this.hasPrevious = this.currentPosition - 1 >= 0;
    this.hasNext = this.currentPosition + 1 < this.georegulationIds.length;
    this.abstractGeoregulationService.getModalDetails$(this.georegulationIds[this.currentPosition])
      .pipe(this.scavenger.collect())
      .subscribe({
        next: georegulation => {
          this.formatGeoregulationModalDatas(georegulation);
          if (this.proUser) {
            this.checkActions(this.georegulation);
          }
        },
        error: error => {
          this.showToast(this.translate.instant(`message.${error.error.message}`), 'error');
          this.hide();
        }
      });
  }

  private formatGeoregulationModalDatas(georegulation: JsonGeoregulationModalDetails): void {
    this.currentSharedLinkUrl = `${this.sharedUrl}/${georegulation.id}`;
    const mainNumber = {
      ...georegulation.mainNumber,
      date: convertFromJsonGeoregulationNumberDate(georegulation.mainNumber.date)
    } as GeoregulationNumber;
    const additionalNumbers = georegulation.additionalNumbers?.map(additionalNumber => {
      return {
        ...additionalNumber,
        date: convertFromJsonGeoregulationNumberDate(additionalNumber.date)
      } as GeoregulationNumber;
    });
    const parts = georegulation.parts.map(part => {
      return {
        ...part,
        features: this.georegulationFeatureFactory.createGeometries(georegulation.temporary, georegulation.isNew, mainNumber, part.features)
      };
    });
    this.georegulation = {
      ...georegulation,
      mainNumber,
      additionalNumbers,
      parts
    } as GeoregulationModalDetails;

    this.setAllowedFormatToDownload();
  }

  private checkActions(georegulation: GeoregulationModalDetails): void {
    this.canPublish = this.checkIfCanPublish(georegulation);
    this.canRepeal = this.checkIfCanRepeal(georegulation);
    this.canEdit = this.checkIfCanEdit(georegulation);
    this.canDelete = this.checkIfCanDelete(georegulation);
    this.canClone = this.checkIfCanClone(georegulation);
    this.canAddGeoregulationToFolder = georegulation.canBeAddedToFolder;

    this.canManage = this.canDelete || this.canEdit || this.canPublish || this.canRepeal || this.canClone || this.canAddGeoregulationToFolder;

    this.buildManagementMenu();
  }

  private checkIfCanPublish(georegulation: GeoregulationModalDetails): boolean {
    // if GR not draft or user is not logged in
    if (georegulation.status !== GeoregulationStatusEnum.DRAFT || !this.authService.isLoggedIn()) {
      return false;
    }

    // if service user and user has roles on GR issuing service
    if (this.authService.hasRoleServiceUser()
      && this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], georegulation.issuingService?.id)) {
      return true;
    }

    return false;
  }

  private checkIfCanRepeal(georegulation: GeoregulationModalDetails): boolean {
    // if GR not published or user is not logged in
    if (georegulation.status !== GeoregulationStatusEnum.PUBLISHED || !this.authService.isLoggedIn()) {
      return false;
    }

    // if service user and user has roles on GR issuing service
    if (this.authService.hasRoleServiceUser()
      && this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], georegulation.issuingService?.id)) {
      return true;
    }

    return false;
  }

  private checkIfCanEdit(georegulation: GeoregulationModalDetails): boolean {
    // if GR not published/DRAFT or user is not logged in
    if (![GeoregulationStatusEnum.DRAFT, GeoregulationStatusEnum.PUBLISHED].includes(georegulation.status) || !this.authService.isLoggedIn()) {
      return false;
    }

    // if service user and (user has roles on GR issuing service or user service is SHOM_GEOGRAPHIC_AREA and has rights on an authority service)
    const isServiceUser = this.authService.hasRoleServiceUser();
    const hasRoleOnIssuingService = this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], georegulation.issuingService?.id);
    const hasLimitedAccess = this.authService.hasShomGeographicAreaType() && this.authService.hasRightsOnAnyAuthorityService([ServiceRole.SERVICE_VISITOR, ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR]);
    return isServiceUser && (hasRoleOnIssuingService || hasLimitedAccess);
  }

  private checkIfCanDelete(georegulation: GeoregulationModalDetails): boolean {
    const georegulationHasRequiredStatus = [GeoregulationStatusEnum.DRAFT, GeoregulationStatusEnum.REPEALED].includes(georegulation.status);
    const serviceUserHasRequiredRoleOnGeoregulationIssuingService = this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN], georegulation.issuingService?.id);

    // if repealed and already sent, then cannot be deleted
    if (GeoregulationStatusEnum.REPEALED === georegulation.status && !georegulation.canBeSent) {
      return false;
    }

    return georegulationHasRequiredStatus && serviceUserHasRequiredRoleOnGeoregulationIssuingService;
  }

  private checkIfCanClone(georegulation: GeoregulationModalDetails): boolean {
    // if user is not logged in
    if (!this.authService.isLoggedIn()) {
      return false;
    }

    // if service user and user has roles on GR issuing service
    if (this.authService.hasRoleServiceUser()
      && this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], georegulation.issuingService?.id)) {
      return true;
    }

    return false;
  }

  confirmPublish(event: Event): void {
    this.confirmationService.confirm({
      target: this.manageButton.nativeElement,
      message: this.translate.instant('detail.publish-confirm-georegulation'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.publish()
    });
  }

  confirmRepeal(event: Event): void {
    this.confirmationService.confirm({
      target: this.manageButton.nativeElement,
      message: this.translate.instant('detail.repeal-confirm-georegulation'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.repeal()
    });
  }

  confirmAddNotionToFolder(event: Event): void {
    this.addToFolderPanel.show(event, this.manageButton.nativeElement);
  }

  confirmDelete(event: Event): void {
    this.confirmationService.confirm({
      target: this.manageButton.nativeElement,
      message: this.translate.instant('detail.delete-confirm-georegulation'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete()
    });
  }

  private publish(): void {
    this.abstractGeoregulationService.publish$(this.georegulation.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.canPublish = false;
          this.showToast(this.translate.instant('detail.publish-success-georegulation'), 'success');
          this.onStatusChangeAction.emit();
        },
        err => {
          this.canPublish = true;
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
          this.showToast(this.translate.instant('detail.publish-error-georegulation'), 'error');
        }
      );
  }

  private repeal(): void {
    this.abstractGeoregulationService.repeal$(this.georegulation.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.canRepeal = false;
          this.showToast(this.translate.instant('detail.repeal-success-georegulation'), 'success');
          this.onStatusChangeAction.emit();
        },
        err => {
          this.canRepeal = true;
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
          this.showToast(this.translate.instant('detail.repeal-error-georegulation'), 'error');
        }
      );
  }

  private delete(): void {
    this.abstractGeoregulationService.delete$(this.georegulation.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.canDelete = false;
          this.showToast(this.translate.instant('detail.delete-success-georegulation'), 'success');
          this.onStatusChangeAction.emit();
        },
        () => this.showToast(this.translate.instant('detail.delete-error-georegulation'), 'error')
      );
  }

  isPartSelected(part: GeoregulationPartModalDetails): boolean {
    return this.selectedParts.includes(part);
  }

  previous() {
    if (this.hasPrevious) {
      --this.currentPosition;
      this.loadGeoregulation();
    }
  }

  next() {
    if (this.hasNext) {
      ++this.currentPosition;
      this.loadGeoregulation();
    }
  }

  generatePdf($event: any): void {
    const cartoMapCanvasCssSelectors = 'georegulation-modal-map > .carto-map-container > .sc-carto-map-container >'
      + '.map-container > .ol-viewport > .ol-layers .ol-layer canvas';
    const number = this.formatGeoregulationNumberPipe.transform(this.georegulation.mainNumber);
    const html = buildHtmlFromModalDetails(this.translate, this.formatGeoregulationNumberPipe, this.localizedDatePipe, this.translateNamePipe, this.formatMonthPipe, this.georegulation);
    const pdfName = `${number}.pdf`;
    const title = `${number} ${this.translate.instant('detail.title')} (${this.translate.instant('enum.georegulation-status.' + this.georegulation.status.toLowerCase()).toLowerCase()})`;
    this.exportPdfService.exportModal(cartoMapCanvasCssSelectors, pdfName, [title], this.mapComponent.map.olMap, html);
    $event.preventDefault();
  }

  confirmDownload(): void {
    const lang = this.translate.instant('lang');
    this.abstractGeoregulationService.downloadGeometries$(this.georegulation.id, this.selectedFormatToDownload, lang)
      .pipe(this.scavenger.collect())
      .subscribe(blob => {
        if (this.selectedFormatToDownload === 'gpx') {
          saveAs(blob, `${this.formatGeoregulationNumberPipe.transform(this.georegulation.mainNumber)}.gpx`);
        } else {
          saveAs(blob, this.filenameByFormat[this.selectedFormatToDownload]);
        }
        this.downloadPanel.hide();
        this.selectedFormatToDownload = undefined;
      });
  }

  cancelDownload(): void {
    this.downloadPanel.hide();
    this.selectedFormatToDownload = undefined;
  }

  send(event: Event): void {
    this.abstractGeoregulationService.getRecipients$(this.georegulation.id)
      .pipe(this.scavenger.collect())
      .subscribe(availableRecipients => {
        if (availableRecipients.length) {
          this.availableRecipients = availableRecipients;
          this.selectedRecipients = availableRecipients.filter(recipient => recipient.defaultService);
          this.sendPanel.show(event, this.manageButton.nativeElement);
        } else {
          this.showToast(this.translate.instant('detail.send-georegulation-no-recipients'), 'warn');
        }
      }, () => {
        this.showToast(this.translate.instant('detail.send-georegulation-no-recipients'), 'warn');
      });
  }

  closeSendPanel(): void {
    this.sendPanel.hide();
    this.availableRecipients = [];
    this.selectedRecipients = [];
  }

  closeAddingPanel(): void {
    this.addToFolderPanel.hide();
  }

  confirmSend(): void {
    this.abstractGeoregulationService.send$(this.georegulation.id, this.selectedRecipients.map(recipient => recipient.id))
      .pipe(this.scavenger.collect())
      .subscribe(() => {
        this.georegulation.canBeSent = false;
        this.showToast(this.translate.instant('detail.send-georegulation-success'), 'success');
        this.closeSendPanel();
      }, () => this.showToast(this.translate.instant('detail.send-georegulation-error'), 'error'));
  }

  edit(): void {
    this.router.navigate(['/georegulation/edition/' + this.georegulation.id]);
  }

  clone(event: Event): void {
    this.clonedGeoregulationNumber = {
      year: this.georegulation.mainNumber.year,
      text: '',
      authorityIds: this.georegulation.mainNumber.authorityIds,
      date: this.georegulation.mainNumber.date,
      authorities: this.georegulation.mainNumber.authorities,
      authorityCodes: this.georegulation.mainNumber.authorityCodes,
    };
    this.clonedGeoregulationNumberText = '';
    this.clonePanel.show(event, this.manageButton.nativeElement);
  }

  clonedGeoregulationTextChanged(): void {
    if (!this.clonedGeoregulationNumberText) {
      this.clonedGeoregulationNumber.text = null;
      return;
    }
    this.clonedGeoregulationNumber.text = this.clonedGeoregulationNumberText;
  }

  closeClonePanel(): void {
    this.clonePanel.hide();
    this.clonedGeoregulationNumberText = '';
  }

  confirmClone(): void {
    this.abstractGeoregulationService.clone$(this.georegulation.id, this.clonedGeoregulationNumberText)
      .pipe(this.scavenger.collect())
      .subscribe(
        (clonedFolderId: string) => {
          this.showToast(this.translate.instant('detail.clone-georegulation-success'), 'success');
          this.router.navigate(['/georegulation/edition/' + clonedFolderId]);
        },
        (err: any) => {
          let toastMessageKey = 'detail.clone-georegulation-error';
          if (err.error?.message === 'validation.georegulation.number.not-available') {
            toastMessageKey = 'georegulation.creation.errors.main-number-unavailable';
          }
          this.showToast(this.translate.instant(toastMessageKey), 'error');
        });
  }

  private setAllowedFormatToDownload(): void {
    this.allowedFormatToDownload = this.formatToDownload.filter(format =>
      (this.georegulation?.status === GeoregulationStatusEnum.PUBLISHED && format.onlyIfGeoregulationPublished) || !format.onlyIfGeoregulationPublished
    );
  }

  buildManagementMenu(): void {
    this.items = [];

    if (this.canEdit) {
      this.items.push({
        label: this.translate.instant('detail.edit'),
        command: () => this.edit(),
        title: this.translate.instant('detail.edit')
      });
    }

    if (this.canPublish) {
      this.items.push({
        label: this.translate.instant('detail.publish'),
        command: (event: any) => this.confirmPublish(event.originalEvent),
        title: this.translate.instant('detail.publish')
      });
    }

    if (this.georegulation.canBeSent) {
      this.items.push({
        label: this.translate.instant('detail.send-georegulation'),
        command: (event: any) => this.send(event.originalEvent),
        title: this.translate.instant('detail.send-georegulation')
      });
    }

    if (this.canClone) {
      this.items.push({
        label: this.translate.instant('detail.clone'),
        command: (event: any) => this.clone(event.originalEvent),
        title: this.translate.instant('detail.clone')
      });
    }

    if (this.canDelete) {
      this.items.push({
        label: this.translate.instant('detail.delete'),
        command: (event: any) => this.confirmDelete(event.originalEvent),
        title: this.translate.instant('detail.delete')
      });
    }

    if (this.canRepeal) {
      this.items.push({
        label: this.translate.instant('detail.repeal'),
        command: (event: any) => this.confirmRepeal(event.originalEvent),
        title: this.translate.instant('detail.repeal')
      });
    }

    if (this.canAddGeoregulationToFolder) {
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
