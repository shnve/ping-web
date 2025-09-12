import { CreationService } from '@admin-warning/services/creation.service';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WarningCreationData, WarningPublicReferenceOption } from '@app/admin/admin-warning/models/creation-warning.model';
import { DownloadService } from '@app/admin/admin-warning/services/download.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { GeoregulationAdminApi } from '@app/georegulation/api/georegulation-admin.api';
import { GeoregulationSelectOption } from '@app/models/georegulation.model';
import { AttachmentDownload, WarningLinkPublicReference, WarningMaritimeEntityReference, WarningReferenceAsPublicReference, WarningReferenceCategoryEnum } from '@app/models/warning.model';
import { FormatWarningNumberPipe } from '@app/shared/pipes/format-warning-number.pipe';
import { accessLinkToReference } from '@app/shared/warning-public-reference-utils';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import { ConfirmationService } from 'primeng/api';
import { throwError } from 'rxjs';
import { StepComponent } from '../step.component';
import { WarningLinkApi } from './../../../../../api/admin/warning-link-admin.api';
import { WarningPublicReferenceType } from './../../../../../models/warning-public-reference.model';
import { LoaderService } from '@sig/services/loader.service';

export type WarningReferenceCategoryOption = { code: string, translateKey: string };

@Component({
  selector: 'aw-publics-references-step',
  templateUrl: './publics-references-step.component.html',
  styleUrls: ['../step.component.scss']
})
export class PublicsReferencesStepComponent extends StepComponent implements OnInit, OnDestroy {
  warningId: string;

  availableWarningsReferences: WarningReferenceAsPublicReference[];
  selectedWarningsReferences: WarningPublicReferenceOption[] = [];

  availableGeoregulations: GeoregulationSelectOption[];
  selectedGeoregulations: string[] = [];

  availableAttachments: AttachmentDownload[];
  selectedAttachments: string[] = [];

  availableEntitiesReferences: WarningMaritimeEntityReference[];
  selectedEntitiesReferences: string[] = [];

  displayModal = false;
  linkReference: WarningLinkPublicReference = {
    warningId: '',
    title: '',
    internationalTitle: '',
    url: ''
  };

  warningLinksPublicsReferences: WarningLinkPublicReference[] = [];

  optionsEntitiesReferences = [];
  availableMaritimeEntityNames: string[] = [];

  optionsWarningsReferences = [];
  availableWarningReferenceCategories: string[] = [];

  warningLinkIdToModify: string;

  confirmDeleteLink = 'confirmDeleteLink';
  warningPublicReferenceType = WarningPublicReferenceType;
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

  isWarningModel = false;

  constructor(readonly router: Router,
    protected readonly creationService: CreationService,
    private readonly translateService: TranslateService,
    private readonly formatWarningNumberPipe: FormatWarningNumberPipe,
    protected readonly alertMessageService: AlertMessageService,
    private readonly georegulationAdminApi: GeoregulationAdminApi,
    private readonly downloadService: DownloadService,
    private readonly warningLinkApi: WarningLinkApi,
    private readonly confirmationService: ConfirmationService,
    protected elemRef: ElementRef,
    protected readonly loader: LoaderService) {
    super(router, creationService, alertMessageService, loader);
    this.baseElementRef = this.elemRef;
    this.currentStep = '/publics-references';
    this.prevStep = '/links-and-attachments';
    this.nextStep = '/diffusion';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.warningId = this.creationService.getWarningData()?.id;
    this.isWarningModel = this.isModel();
    if (this.warningId && !this.isWarningModel) {
      this.loadLinkeableAttachmentAsWarningReference(this.warningId);
      this.loadLinkeableGeoregulationsAsWarningReference(this.warningId);
      this.loadLinkeableEntitiesReferencesAsWarningReference(this.warningId);
      this.loadLinkeableWarningsReferencesAsPublicReference(this.warningId);
      this.loadWarningLinksPublicsReferences();
    }
  }

  private loadLinkeableGeoregulationsAsWarningReference(warningId: string): void {
    this.georegulationAdminApi.getAvailableGeoregulationsToLinkAsWarningReference$(warningId)
      .pipe(this.scavenger.collect())
      .subscribe(georegulations => this.availableGeoregulations = georegulations);
    this.selectedGeoregulations = this.getGeoregulationReferenceIds(this.creationService.getWarningData());
  }

  private loadLinkeableAttachmentAsWarningReference(warningId: string): void {
    this.creationService.getAvailableAttachmentToLinkAsWarningReference$(warningId)
      .pipe(this.scavenger.collect())
      .subscribe(attachments => this.availableAttachments = attachments);
    this.selectedAttachments = this.getAttachmentIds(this.creationService.getWarningData());
  }

  private loadLinkeableEntitiesReferencesAsWarningReference(warningId: string): void {
    this.creationService.getAvailableEntitiesReferencesToLinkAsWarningReference$(warningId)
      .pipe(this.scavenger.collect())
      .subscribe(entitiesReferences => {
        this.availableEntitiesReferences = entitiesReferences;
        this.buildEntitiesReferencesItems();
      });
  }

  private loadLinkeableWarningsReferencesAsPublicReference(warningId: string): void {
    this.creationService.getAvailableWarningsReferencesAsPublicReference$(warningId)
      .pipe(this.scavenger.collect())
      .subscribe(warningsReferences => {
        this.availableWarningsReferences = warningsReferences;
        this.buildWarningsReferencesItems();
      });
  }

  private loadWarningLinksPublicsReferences(): void {
    this.warningLinksPublicsReferences = this.getwarningLinksPublicsReferences(this.creationService.getWarningData());
  }

  buildWarningsReferencesItems(): void {
    this.optionsWarningsReferences = [];

    const warningReferenceCategories = this.availableWarningsReferences.map(availableWarningReference => availableWarningReference.category);
    warningReferenceCategories.forEach(category => {
      const categoryTranslateKey = this.translateKeyFromCategory(category);
      const categoryTranslate = this.translateService.instant(categoryTranslateKey);
      if (!this.optionsWarningsReferences.find(option => option.label === categoryTranslate)) {
        this.optionsWarningsReferences.push({
          label: categoryTranslate,
          items: []
        });
      }
    });

    this.optionsWarningsReferences = _.sortBy(this.optionsWarningsReferences, 'label');

    this.availableWarningReferenceCategories = this.optionsWarningsReferences.map(optionWarningReference =>
      this.warningReferenceCategoryOption.find(option => this.translateService.instant(option.translateKey) === optionWarningReference.label).translateKey
    );

    this.availableWarningsReferences.forEach(availableWarningReference => {
      const translateKey = this.translateKeyFromCategory(availableWarningReference.category);
      this.optionsWarningsReferences.find(option => option.label === this.translateService.instant(translateKey)).items.push({
        warningId: availableWarningReference.warningId,
        warningNumber: this.formatWarningNumberPipe.transform(availableWarningReference),
        category: availableWarningReference.category
      });

      // sorting
      this.optionsWarningsReferences.find(option => option.label === this.translateService.instant(translateKey)).items = _.sortBy(
        this.optionsWarningsReferences.find(option => option.label === this.translateService.instant(translateKey)).items,
        'warningNumber'
      );
    });

    this.selectedWarningsReferences = this.getwarningPublicsReferences(this.creationService.getWarningData()).map(publicReference => ({
      warningId: publicReference.warningId,
      warningNumber: this.formatWarningNumberPipe.transform(publicReference as any as WarningReferenceAsPublicReference),
      category: publicReference.category
    }));
  }

  translateKeyFromCategory(category: WarningReferenceCategoryEnum): string {
    return this.warningReferenceCategoryOption.find(option => option.code === category).translateKey;
  }

  buildEntitiesReferencesItems(): void {
    this.optionsEntitiesReferences = [];

    const maritimeEntityNames = this.availableEntitiesReferences.map(availableReference => availableReference.maritimeEntityName);
    maritimeEntityNames.forEach(maritimeEntityName => {
      if (!this.optionsEntitiesReferences.find(option => option.label === maritimeEntityName)) {
        this.optionsEntitiesReferences.push({
          label: maritimeEntityName,
          items: []
        });
      }
    });

    this.optionsEntitiesReferences = _.sortBy(this.optionsEntitiesReferences, 'label');

    this.availableMaritimeEntityNames = this.optionsEntitiesReferences.map(option => option.label);
    this.availableEntitiesReferences.forEach(availableReference => {
      this.optionsEntitiesReferences.find(option => option.label === availableReference.maritimeEntityName).items.push({
        key: availableReference.id,
        referenceName: availableReference.title
      });

      // sorting
      this.optionsEntitiesReferences.find(option => option.label === availableReference.maritimeEntityName).items = _.sortBy(
        this.optionsEntitiesReferences.find(option => option.label === availableReference.maritimeEntityName).items,
        'referenceName'
      );
    });

    this.selectedEntitiesReferences = this.getEntityReferenceIds(this.creationService.getWarningData());
  }

  selectedEntitiesReferencesByEntityName(entityName: string): string[] {
    return this.optionsEntitiesReferences.filter(option => option.label === entityName)[0].items.map(item => item.key)
      .filter(entityReferenceId => this.selectedEntitiesReferences.includes(entityReferenceId));
  }

  selectedWarningsReferencesByEntityCategory(categoryTranslateKey: string): string[] {
    return this.selectedWarningsReferences?.filter(selectedWarningReference =>
      this.translateKeyFromCategory(selectedWarningReference.category) === categoryTranslateKey
    ).map(selectedWarningReference => selectedWarningReference.warningId);
  }

  private getGeoregulationReferenceIds(warningData: WarningCreationData): Array<string> {
    return warningData.references.georegulationReferenceIds;
  }

  private getAttachmentIds(warningData: WarningCreationData): Array<string> {
    return warningData.references.attachmentReferenceIds;
  }

  private getEntityReferenceIds(warningData: WarningCreationData): Array<string> {
    return warningData.references.entityReferenceIds;
  }

  private getwarningPublicsReferences(warningData: WarningCreationData): Array<WarningPublicReferenceOption> {
    return warningData.references.warningPublicsReferences;
  }

  private getwarningLinksPublicsReferences(warningData: WarningCreationData): Array<WarningLinkPublicReference> {
    return warningData.references.warningLinksPublicsReferences;
  }

  georegulationNumberById(georegualtionId: string): string {
    return this.availableGeoregulations?.find(georegulation => georegulation.id === georegualtionId).number;
  }

  attachmentFileNameById(attachmentId: string): string {
    return this.availableAttachments?.find(attachment => attachment.id === attachmentId).filename;
  }

  entityReferenceTitleById(entityReferenceId: string): string {
    return this.availableEntitiesReferences?.find(entityReference => entityReference.id === entityReferenceId)?.title;
  }

  warningReferenceNumberById(warningReferenceId: string): string {
    const warningReference = this.availableWarningsReferences?.find(reference => reference.warningId === warningReferenceId);
    return warningReference ? this.formatWarningNumberPipe.transform(warningReference) : '';
  }

  openAttachment(event: Event, attachmentId: string): void {
    this.downloadService.download(attachmentId)
      .pipe(this.scavenger.collect())
      .subscribe(response => saveAs(response.body, response.headers.get('filename')));
    event.preventDefault();
  }

  openAttachmentOrUrl(event: Event, entityReferenceId: string): void {
    const entityReference = this.availableEntitiesReferences?.find(reference => reference.id === entityReferenceId);
    if (entityReference?.attachmentId?.length) {
      this.openAttachment(event, entityReference.attachmentId);
    } else {
      window.open(entityReference.url, '_blank', 'noopener,noreferrer');
    }
  }

  accessLinkToReference(warningPublicReferenceType: WarningPublicReferenceType, referenceId: string) {
    return accessLinkToReference(warningPublicReferenceType, referenceId);
  }

  showEditModalDialog(link: WarningLinkPublicReference): void {
    this.displayModal = true;
    this.warningLinkIdToModify = link.id;
    this.linkReference.title = link.title;
    this.linkReference.internationalTitle = link.internationalTitle;
    this.linkReference.url = link.url;
  }

  onSaveLinkReference(): void {
    const indexReference = this.findWarningLinkIndex(this.warningLinkIdToModify);
    const warningLink: WarningLinkPublicReference = {
      warningId: this.warningId,
      title: this.linkReference.title.trim(),
      internationalTitle: this.linkReference.internationalTitle?.trim()
    };

    if (indexReference > -1) {
      warningLink.id = this.warningLinksPublicsReferences[indexReference].id;
    }

    warningLink.url = this.linkReference.url;

    this.saveNewLinkReference(warningLink);
  }

  saveNewLinkReference(link: WarningLinkPublicReference): void {
    const messageDetail = link.id ? 'update' : 'add';
    this.warningLinkApi.saveWarningLink(link)
      .pipe(this.scavenger.collect())
      .subscribe(warningLink => {
        if (link.id) {
          const indexReference = this.findWarningLinkIndex(link.id);
          if (indexReference > -1) {
            this.warningLinksPublicsReferences[indexReference].title = warningLink.title;
            this.warningLinksPublicsReferences[indexReference].internationalTitle = warningLink.internationalTitle;
            this.warningLinksPublicsReferences[indexReference].url = warningLink.url;
          }
        } else {
          this.warningLinksPublicsReferences?.push(warningLink);
        }

        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.${messageDetail}-warning-link-reference`
        });

        this.resetEntries();
      }, err => {
        this.alertMessageService.add({
          severity: 'error',
          summary: 'message.summary.error',
          detail: `message.error.api.cannot-${messageDetail}-warning-link-reference`
        });
        return throwError(err);
      });
  }

  resetEntries(): void {
    this.displayModal = false;
    this.linkReference.url = '';
    this.linkReference.internationalTitle = '';
    this.linkReference.title = '';
  }

  deleteLink(linkId: string): void {
    this.warningLinkApi.delete(linkId)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          const indexReference = this.findWarningLinkIndex(linkId);
          this.warningLinksPublicsReferences.splice(indexReference, 1);
          this.alertMessageService.add({
            severity: 'success',
            summary: 'message.summary.success',
            detail: 'message.success.api.delete-warning-link-reference'
          });
        },
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-delete-warning-link-reference'
          });
          return throwError(err);
        });
  }

  confirmDelete(event: Event, referenceId: string): void {
    this.confirmationService.confirm({
      key: this.confirmDeleteLink,
      target: event.target,
      message: this.translateService.instant('admin-warning.creation.labels.references.confirm-delete-link'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.removeReferenceFromEntity(referenceId)
    });
  }

  removeReferenceFromEntity(referenceId: string): void {
    const indexReference = this.findWarningLinkIndex(referenceId);
    if (indexReference > -1) {
      this.deleteLink(this.warningLinksPublicsReferences[indexReference].id);
    }
  }

  findWarningLinkIndex(id?: string, title?: string): number {
    return (id ? this.warningLinksPublicsReferences?.findIndex(link => link.id === id)
      : this.warningLinksPublicsReferences?.findIndex(link => link.title === title)) ?? -1;
  }

  cancel(): void {
    this.resetEntries();
  }

  saveForm(force = false): boolean {
    if (!this.isWarningModel) {
      this.creationService.getWarningData().references.georegulationReferenceIds = this.selectedGeoregulations;
      this.creationService.getWarningData().references.attachmentReferenceIds = this.selectedAttachments;
      this.creationService.getWarningData().references.entityReferenceIds = this.selectedEntitiesReferences;
      this.creationService.getWarningData().references.warningPublicsReferences = this.selectedWarningsReferences.map(selectedReference => ({
        warningId: selectedReference.warningId,
        category: selectedReference.category
      }));
    }
    return true;
  }

  nextPage(): void {
    this.saveForm();
    this.update(false);
    this.router.navigate([this.rootUrl + this.nextStep]);
  }

  prevPage(): void {
    this.saveForm();
    this.router.navigate([this.rootUrl + this.prevStep]);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
