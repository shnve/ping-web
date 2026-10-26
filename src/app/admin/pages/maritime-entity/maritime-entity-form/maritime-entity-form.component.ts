import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DownloadService } from '@app/admin/admin-warning/services/download.service';
import { ViewGeometryComponent } from '@app/admin/components/view-geometry/view-geometry.component';
import { MaritimeEntityReferenceApi } from '@app/api/admin/maritime-entity-reference-admin.api';
import { MaritimeEntitiesApi } from '@app/api/maritime-entities.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { AreaSelectOption, AreasFacade } from '@app/facades/areas.facade';
import MaritimeEntity, { MaritimeEntityReference, MaritimeEntityType } from '@app/models/maritime-entity.model';
import MaritimeService from '@app/models/maritime-service.model';
import ProUser from '@app/models/pro-user.model';
import { AttachmentDownload } from '@app/models/warning.model';
import { CreationAttachment } from '@app/shared/components/attachments/attachment.model';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subscription, throwError } from 'rxjs';

interface ReferenceDataType {
  type: string,
  key: string
}

@Component({
  selector: 'app-maritime-entity-form',
  templateUrl: './maritime-entity-form.component.html',
  styleUrls: ['./maritime-entity-form.component.scss']
})
@Localize()
export class MaritimeEntityFormComponent implements OnInit, OnDestroy, OnChangeLang {
  private readonly scavenger = new Scavenger();

  @ViewChild('viewGeometry') viewGeometry: ViewGeometryComponent;
  @Input() maritimeEntity: MaritimeEntity = {
    id: null,
    name: null,
    geom: null,
    maritimeServiceId: null
  };

  @Input() disabled = false;
  maritimeEntityTypes = Object.keys(MaritimeEntityType).map(k => MaritimeEntityType[k as any]);
  maritimeEntityForm: UntypedFormGroup;

  formSubscription: Subscription;
  maritimeEntitySubscription: Subscription;
  areas$: Observable<AreaSelectOption[]>;
  displayedAreaLabel: string;

  maritimeServices$: Observable<MaritimeService[]>;
  displayedMaritimeServiceLabel: string;

  displayModal = false;

  @Input() user: ProUser = {
    id: null,
    title: null,
    firstname: null,
    lastname: null,
    email: null,
    role: null,
    hasNotificationsSound: false,
    hasSubscriptionEmailNotifications: true
  };

  referenceIdToModify: string;
  referenceTitle: string;
  referenceInternationalTitle: string;
  confirmDeleteReference = 'confirmDeleteReference';
  referenceAttachmentId: string;
  referenceAttachmentFile: CreationAttachment;
  referenceUrl: string;
  referenceIsPublic: boolean;

  referenceDataType: ReferenceDataType[] = [
    { type: this.translate.instant('maritime-entity.reference-attachment'), key: 'attachment' },
    { type: this.translate.instant('maritime-entity.reference-url'), key: 'url' }
  ];
  selectedType = { type: this.translate.instant('maritime-entity.reference-attachment'), key: 'attachment' };
  displayOptionAttachment = true;
  displayOptionUrl = false;
  maritimeEntityReferences: MaritimeEntityReference[];
  availableAdditionalServices: MaritimeService[];

  constructor(private readonly fb: UntypedFormBuilder,
    public readonly translate: TranslateService,
    private readonly areasFacade: AreasFacade,
    private readonly router: Router,
    private readonly maritimeEntitiesApi: MaritimeEntitiesApi,
    private readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly alertMessageService: AlertMessageService,
    private readonly maritimeEntityReferenceApi: MaritimeEntityReferenceApi,
    private readonly confirmationService: ConfirmationService,
    private readonly downloadService: DownloadService,
    private readonly authService: AuthService) {

  }

  ngOnInit(): void {
    this.maritimeEntityForm = this.fb.group({
      urn: [{ value: this.maritimeEntity?.urn, disabled: this.disabled }, [Validators.pattern(/^urn:[a-z0-9-]+:[a-zA-Z0-9()+,-.:=@$_!*%?#]+$/)]],
      name: [{ value: this.maritimeEntity?.name, disabled: this.disabled }, Validators.required],
      internationalName: [{ value: this.maritimeEntity?.name, disabled: this.disabled }],
      information: [{ value: this.maritimeEntity?.information, disabled: this.disabled }],
      localizedInformation: [{ value: this.maritimeEntity?.localizedInformation, disabled: this.disabled }],
      type: [{ value: this.maritimeEntity?.type, disabled: this.disabled }, Validators.required],
      maritimeServiceId: [{ value: this.maritimeEntity?.maritimeServiceId, disabled: this.disabled }, Validators.required],
      areas: [{ value: this.maritimeEntity?.areas, disabled: this.disabled }],
      additionalServices: [{ value: this.maritimeEntity?.additionalServices, disabled: this.disabled }]
    });
    this.formSubscription = this.subscribeToFormChanges();
    this.areas$ = this.areasFacade.getAreaSelectOptions$();
    this.displayedAreaLabel = this.getDisplayedAreaLabel(this.translate.currentLang);

    this.maritimeServices$ = this.maritimeServicesApi.getMaritimeServices();
    this.displayedMaritimeServiceLabel = this.getDisplayedMaritimeServiceLabel(this.translate.currentLang);

    this.maritimeEntityReferences = this.maritimeEntity.references?.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());

    this.updateAvailableAdditionalServices(this.maritimeEntity?.maritimeServiceId, !!this.maritimeEntity.id);

    this.resetEntries();

    this.maritimeServiceId.valueChanges
      .pipe(this.scavenger.collect())
      .subscribe(selectedValue => this.updateAvailableAdditionalServices(selectedValue));
  }

  private updateAvailableAdditionalServices(serviceId: string, restoreValues = false): void {
    this.availableAdditionalServices = [];
    this.additionalServices.setValue([]);
    if (!serviceId) { return; }
    this.maritimeServices$.pipe(this.scavenger.collect())
      .subscribe(maritimeServices => {
        this.availableAdditionalServices = maritimeServices.filter(ms => ms.id !== serviceId);
        if (restoreValues) {
          this.additionalServices.setValue(this.maritimeEntity?.additionalServices);
        }
      });
  }

  get maritimeServiceId(): AbstractControl {
    return this.maritimeEntityForm.get('maritimeServiceId');
  }

  get additionalServices(): AbstractControl {
    return this.maritimeEntityForm.get('additionalServices');
  }

  private getDisplayedMaritimeServiceLabel(lang: string): string {
    return lang === 'es' ? 'name' : 'internationalName';
  }

  private getDisplayedAreaLabel(lang: string): string {
    return lang === 'es' ? 'name' : 'internationalName';
  }

  onChangeLang(event: LangChangeEvent): void {
    this.displayedAreaLabel = this.getDisplayedAreaLabel(event.lang);
  }

  private subscribeToFormChanges(): Subscription {
    return this.maritimeEntityForm.valueChanges.subscribe((data: MaritimeEntity) => {
      if (this.maritimeEntityForm.valid && this.maritimeEntityForm.dirty) {
        this.maritimeEntity = { ...this.maritimeEntity, ...data };
      }
    });
  }

  saveMaritimeEntity(): void {
    if (this.viewGeometry.canSaveGeometry()) {
      this.maritimeEntity.geom = this.viewGeometry.getGeometry();
      this.maritimeEntitySubscription = this.maritimeEntitiesApi.saveMaritimeEntity(this.maritimeEntity)
        .subscribe(entity => {
          let messageDetail = 'create';
          if (this.maritimeEntity.id) {
            messageDetail = 'edit';
            this.maritimeEntity = entity;
          } else {
            this.router.navigate(['/administration/entites-maritime']);
          }

          this.alertMessageService.add({
            severity: 'success',
            summary: 'message.summary.success',
            detail: `message.success.api.${messageDetail}-maritime-entity`
          });
        },
          err => {
            this.alertMessageService.add({
              severity: 'error',
              summary: 'message.summary.error',
              detail: 'message.error.api.cannot-save-maritime-entity'
            });
            return throwError(err);
          });
    } else {
      this.alertMessageService.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'message.validation.area.geometry.only-one-required'
      });
    }
  }

  hasPermissionToManageReference(): boolean {
    return this.authService.hasRoleFunctionalAdmin();
  }

  onSaveNewReference(): void {
    const indexReference = this.findMaritimeEntityReferenceIndex(this.referenceIdToModify);
    const maritimeEntityReference: MaritimeEntityReference = {
      maritimeEntityId: this.maritimeEntity.id,
      title: this.referenceTitle.trim(),
      internationalTitle: this.referenceInternationalTitle?.trim(),
      isPublic: this.referenceIsPublic
    };

    if (indexReference > -1) {
      maritimeEntityReference.id = this.maritimeEntityReferences[indexReference].id;
    }

    if (this.selectedType.key === 'attachment') {
      maritimeEntityReference.attachmentId = this.referenceAttachmentId;
      maritimeEntityReference.attachmentFile = this.referenceAttachmentFile;
    } else {
      maritimeEntityReference.url = this.referenceUrl;
    }

    this.saveNewReference(maritimeEntityReference);
  }

  saveNewReference(reference: MaritimeEntityReference): void {
    const messageDetail = reference.id ? 'update' : 'add';
    this.maritimeEntityReferenceApi.saveMaritimeEntityReference(reference)
      .pipe(this.scavenger.collect())
      .subscribe(maritimeEntityReference => {
        if (reference.id) {
          const indexReference = this.findMaritimeEntityReferenceIndex(reference.id);
          if (indexReference > -1) {
            this.maritimeEntityReferences[indexReference].title = maritimeEntityReference.title;
            this.maritimeEntityReferences[indexReference].internationalTitle = maritimeEntityReference.internationalTitle;
            this.maritimeEntityReferences[indexReference].attachmentId = maritimeEntityReference.attachmentId;
            this.maritimeEntityReferences[indexReference].attachmentFile = maritimeEntityReference.attachmentFile;
            this.maritimeEntityReferences[indexReference].url = maritimeEntityReference.url;
            this.maritimeEntityReferences[indexReference].isPublic = maritimeEntityReference.isPublic;
          }
        } else {
          this.maritimeEntityReferences?.push(maritimeEntityReference);
        }

        this.maritimeEntityReferences?.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());

        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.${messageDetail}-maritime-entity-reference`
        });

        this.resetEntries();
      },
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: `message.error.api.cannot-${messageDetail}-maritime-entity-reference`
          });
          return throwError(err);
        });
  }

  deleteMaritimeEntityReference(referenceId: string): void {
    this.maritimeEntityReferenceApi.delete(referenceId)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          const indexReference = this.findMaritimeEntityReferenceIndex(referenceId);
          this.maritimeEntityReferences.splice(indexReference, 1);
          this.alertMessageService.add({
            severity: 'success',
            summary: 'message.summary.success',
            detail: 'message.success.api.delete-maritime-entity-reference'
          });
        },
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'Erreur de suppression'
          });
          return throwError(err);
        });
  }

  confirmDelete(event: Event, referenceId: string): void {
    this.confirmationService.confirm({
      key: this.confirmDeleteReference,
      target: event.target,
      message: this.translate.instant('maritime-entity.confirm-delete-reference'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.removeReferenceFromEntity(referenceId)
    });
  }

  removeReferenceFromEntity(referenceId: string): void {
    const indexReference = this.findMaritimeEntityReferenceIndex(referenceId);
    if (indexReference > -1) {
      this.deleteMaritimeEntityReference(this.maritimeEntityReferences[indexReference].id);
    }
  }

  findMaritimeEntityReferenceIndex(id?: string, title?: string): number {
    return (id ? this.maritimeEntityReferences?.findIndex(maritimeReference => maritimeReference.id === id)
      : this.maritimeEntityReferences?.findIndex(maritimeReference => maritimeReference.title === title)) ?? -1;
  }

  showEditModalDialog(reference: MaritimeEntityReference): void {
    if (reference.url?.length) {
      this.selectedType = { type: this.translate.instant('maritime-entity.reference-url'), key: 'url' };
      this.changeDataType();
    }

    this.displayModal = true;
    this.referenceIdToModify = reference.id;
    this.referenceTitle = reference.title;
    this.referenceInternationalTitle = reference.internationalTitle;
    this.referenceAttachmentId = reference.attachmentId;
    this.referenceAttachmentFile = reference.attachmentFile;
    this.referenceUrl = reference.url;
    this.referenceIsPublic = reference.isPublic;
  }

  openAttachment(event: Event, attachment: AttachmentDownload): void {
    this.downloadService.download(attachment.id)
      .pipe(this.scavenger.collect())
      .subscribe(response => saveAs(response.body, response.headers.get('filename')));
    event.preventDefault();
  }

  setAttachmentsIds(event) {
    this.referenceAttachmentId = event;
  }

  disableModalSaveButton(): boolean {
    return !this.referenceTitle?.length || this.checkIfReferenceHasData();
  }

  checkIfReferenceHasData(): boolean {
    return (this.selectedType.key === 'attachment' ? !this.referenceAttachmentId?.length : !this.referenceUrl?.length);
  }

  resetEntries(): void {
    this.displayModal = false;
    this.selectedType = { type: this.translate.instant('maritime-entity.reference-attachment'), key: 'attachment' };
    this.changeDataType();
    this.referenceTitle = '';
    this.referenceInternationalTitle = '';
    this.referenceAttachmentId = '';
    this.referenceAttachmentFile = {} as CreationAttachment;
    this.referenceUrl = '';
    this.referenceIsPublic = false;
    this.referenceIdToModify = '';
  }

  cancel() {
    this.resetEntries();
  }

  changeDataType() {
    if (this.selectedType.key === 'attachment') {
      this.displayOptionAttachment = true;
      this.displayOptionUrl = false;
    } else {
      this.displayOptionAttachment = false;
      this.displayOptionUrl = true;
      this.referenceAttachmentId = '';
    }
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
    this.maritimeEntitySubscription && this.maritimeEntitySubscription.unsubscribe();
  }
}
