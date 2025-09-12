import { DownloadService } from '@admin-warning/services/download.service';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { WarningReferenceCategoryOption } from '@app/admin/admin-warning/components/steps/publics-references-step/publics-references-step.component';
import { WarningApi, WarningsDownloadS124ApiParams } from '@app/api/warning.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Serie } from '@app/models/serie.model';
import { WarningPublicReferenceType } from '@app/models/warning-public-reference.model';
import {
  AdminWarning,
  WarningFeaturePart,
  WarningMaritimeEntityReference, WarningReferenceAsPublicReference, WarningReferenceCategoryEnum,
  listWarningStatus
} from '@app/models/warning.model';
import { accessLinkToReference } from '@app/shared/warning-public-reference-utils';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Observable, throwError } from 'rxjs';
import { FolderBase } from '../../../folder/models/folder.model';
import { NotionTypeEnum } from '../add-notion-to-folder-selection/notion-type-enum';

@Component({
  selector: 'shared-warning-detail',
  templateUrl: './warning-detail.component.html',
  styleUrls: ['./warning-detail.component.scss']
})
export class WarningDetailComponent implements OnDestroy, OnChanges {

  protected readonly scavenger = new Scavenger(this);
  protected readonly filenameByFormat = {
    'kml': 'export.kml',
    'shp': 'shapefiles.zip',
    's-124': 'export.xml',
    'gpx': 'export.gpx'
  };

  @Input() displayDetailsButton = false;
  @Input() warning: AdminWarning;
  @Input() cannotBePublished = false;
  @Input() serieSelected: Serie;
  @Output() featurePartClicked = new EventEmitter<WarningFeaturePart>();
  @Output() allFeaturesVisualized = new EventEmitter<void>();
  @Output() warningSelect = new EventEmitter<AdminWarning>();
  @ViewChild('downloadPanel') downloadPanel: OverlayPanel;
  showPublicationAlertMessage = false;
  selectedFormatToDownload: string;
  displayReferencedWarnings: boolean;
  displayAttachments: boolean;
  displayInternalComment: boolean;
  displayMaritimeEntities: boolean;
  displayFolders: boolean;
  displayCancelledWarnings: boolean;
  displayAllWarningLinks: boolean;

  warningPublicReferenceType = WarningPublicReferenceType;
  warningReferencesAsPublicsReferences = [];
  warningEntitiesReferences = [];

  displayWarningPublicsReferences = false;

  warningReferenceCategoryOption: WarningReferenceCategoryOption[] = [
    {
      code: WarningReferenceCategoryEnum.CANCELLATION,
      translateKey: 'admin-warning.creation.labels.cancelled-warnings'
    },
    {
      code: WarningReferenceCategoryEnum.REPLACEMENT,
      translateKey: 'admin-warning.creation.labels.replaced-warnings'
    },
    {
      code: WarningReferenceCategoryEnum.SOURCE_REFERENCE,
      translateKey: 'admin-warning.creation.labels.referenced-warnings'
    }
  ];

  featurePartBeingVisualized: number;
  notionType = NotionTypeEnum;

  constructor(protected readonly authService: AuthService,
    protected readonly translate: TranslateService,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly downloadService: DownloadService,
    protected readonly warningApi: WarningApi) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.warning && this.warning) {
      this.showPublicationAlertMessage = this.cannotBePublished && this.warning.status === listWarningStatus.DRAFT;
      this.displayReferencedWarnings = this.canDisplayReferencedWarnings();
      this.displayAttachments = this.canDisplayAttachments();
      this.displayInternalComment = this.canDisplayInternalComment();
      this.displayMaritimeEntities = this.canDisplayMaritimeEntities();
      this.displayFolders = this.canDisplayFolders();
      this.displayCancelledWarnings = this.canDisplayCancelledWarnings();
      this.displayAllWarningLinks = this.displayReferencedWarnings || this.displayMaritimeEntities || this.displayFolders
        || this.displayCancelledWarnings;

      this.displayWarningPublicsReferences = this.canDisplayWarningPublicsReferences();
    }
  }

  ngOnDestroy(): void { }

  isProUser(): boolean {
    return this.authService.isProUser();
  }

  private canDisplayWarningPublicsReferences(): boolean {
    const warningPublicsReferences = [
      this.warning.warningLinksPublicsReferences,
      this.warning.entitiesReferencesPublicsReferences,
      this.warning.warningReferencesAsPublicsReferences,
      this.warning.georegulationPublicsReferences,
      this.warning.attachmentsPublicsReferences
    ];

    return this.warning.status !== listWarningStatus.MODEL && warningPublicsReferences.some(publicsReferences => publicsReferences?.length);
  }

  private canDisplayReferencedWarnings(): boolean {
    const referencedWarnings = [
      this.warning.cancelledWarnings,
      this.warning.replacedWarnings,
      this.warning.inforcedWarnings,
      this.warning.parentWarnings
    ];
    return this.isProUser() && referencedWarnings.some(warnings => warnings?.length);
  }

  private canDisplayAttachments(): boolean {
    return this.isProUser() && !!this.warning.attachments?.length;
  }

  private canDisplayInternalComment(): boolean {
    return this.isProUser() && !!this.warning.internalComment;
  }

  private canDisplayMaritimeEntities(): boolean {
    return this.isProUser() && !!this.warning.maritimeEntities?.length;
  }

  private canDisplayFolders(): boolean {
    return this.isProUser() && this.authService.belongsToGovernmentService() && !!this.warning.folders?.length;
  }

  private canDisplayCancelledWarnings(): boolean {
    return !this.isProUser() && !!this.warning.cancelledWarnings?.length;
  }

  get lastUpdateUser(): string {
    return `${this.warning.lastUpdateUser.firstname} ${this.warning.lastUpdateUser.lastname}`;
  }

  displayWarningModal($event: MouseEvent): void {
    this.warningSelect.emit(this.warning);
    $event.preventDefault();
  }

  open(event: Event, attachmentId: string): void {
    let notionItemId = null;
    let notionType = null;
    if (this.warning.status !== listWarningStatus.DRAFT || !this.authService.isLoggedIn()) {
      notionItemId = this.warning.id;
      notionType = NotionTypeEnum.WARNING;
    }

    this.downloadService.download(attachmentId, notionType, notionItemId)
      .pipe(this.scavenger.collect())
      .subscribe(
        response => saveAs(response.body, response.headers.get('filename')),
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-download-file'
          });
          return throwError(err);
        });
    event.preventDefault();
  }

  openAttachmentOrUrl(event: Event, entityReferenceId: string): void {
    const entityReference = this.warning.entitiesReferencesPublicsReferences?.find(reference => reference.id === entityReferenceId);
    entityReference?.attachmentId?.length ? this.open(event, entityReference.attachmentId) : window.open(entityReference.url, '_blank', 'noopener,noreferrer');
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
    downloadRequest.pipe(this.scavenger.collect()).subscribe(blob => {
      if (this.selectedFormatToDownload === 'gpx') {
        saveAs(blob, `${this.warning.nameOfSeries}-${this.warning.warningNumber}-${this.warning.year % 100}.gpx`);
      } else {
        saveAs(blob, `${this.filenameByFormat[this.selectedFormatToDownload]}`);
      }
      this.selectedFormatToDownload = null;
      this.downloadPanel.hide();
    });
  }

  get hasGeometries() {
    return this.warning.featureParts?.some(featurePart => featurePart.geometries?.length || featurePart.affectedAreas?.length);
  }

  accessLinkToFolder(folder: FolderBase): string {
    return `${environment.basePortalUrl + environment.folderSharedUrlContext}/${folder.id}`;
  }

  get availableMaritimeEntityNames(): string[] {
    const maritimeEntityNames = this.warning.entitiesReferencesPublicsReferences.map(entityReference => entityReference.maritimeEntityName);
    return [...new Set(maritimeEntityNames)];
  }

  get availableWarningReferencesAsPublicsReferencesCategories(): string[] {
    const categories = this.warning.warningReferencesAsPublicsReferences.map(warningReference => warningReference.category);
    return [...new Set(categories.map(category => this.translateKeyFromCategory(category)))];
  }

  translateKeyFromCategory(category: WarningReferenceCategoryEnum): string {
    return this.warningReferenceCategoryOption.find(option => option.code === category).translateKey;
  }

  entitiesReferencesByEntityName(entityName: string): WarningMaritimeEntityReference[] {
    return this.warning.entitiesReferencesPublicsReferences?.filter(entityReference => entityReference.maritimeEntityName === entityName);
  }

  warningsReferencesByEntityCategory(categoryTranslateKey: string): WarningReferenceAsPublicReference[] {
    return this.warning.warningReferencesAsPublicsReferences?.filter(warningReference =>
      this.translateKeyFromCategory(warningReference.category) === categoryTranslateKey
    );
  }

  accessLinkToReference(warningPublicReferenceType: WarningPublicReferenceType, referenceId: string) {
    return accessLinkToReference(warningPublicReferenceType, referenceId);
  }
}
