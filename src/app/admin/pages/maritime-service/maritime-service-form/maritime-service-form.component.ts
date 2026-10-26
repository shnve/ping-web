import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceTagsApi } from '@app/api/admin/service-tags-admin.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { AreaSelectOption, AreasFacade } from '@app/facades/areas.facade';
import MaritimeService, { MaritimeServiceType, ServiceNetwork, Tag } from '@app/models/maritime-service.model';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { getCodes } from 'country-list';
import { cloneDeep } from 'lodash-es';
import { ConfirmationService } from 'primeng/api';
import { Subscription, throwError } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

export type TagChip = {
  key: string;
  name: string;
};

@Component({
  selector: 'app-maritime-service-form',
  templateUrl: './maritime-service-form.component.html',
  styleUrls: ['./maritime-service-form.component.scss']
})
@Localize()
export class MaritimeServiceFormComponent implements OnInit, OnDestroy, OnChangeLang {
  private readonly scavenger = new Scavenger();

  @Input() maritimeService: MaritimeService = {
    id: null,
    name: null
  };
  @Input() disabled = false;

  maritimeServiceTypeEnum = Object.keys(MaritimeServiceType).map(k => MaritimeServiceType[k as any]);

  serviceNetworks = Object.keys(ServiceNetwork).map(k => ServiceNetwork[k as any]);
  countryCodes = getCodes().map(code => ({ value: code }));
  booleanOptions = [true, false];

  maritimeServiceForm: UntypedFormGroup;
  formSubscription: Subscription;
  maritimeServiceSubscription: Subscription;
  areas$: Observable<AreaSelectOption[]>;
  displayedAreaLabel: string;
  tagChips: TagChip[] = [];
  displayModal = false;
  confirmDeleteTag = 'confirmDeleteTag';
  tagChipToModify: TagChip = { key: '', name: '' };
  isProductionAgencyRequired: boolean;
  isIhoProducerCodeRequired: boolean;

  constructor(private readonly fb: UntypedFormBuilder,
    public readonly translate: TranslateService,
    private readonly areasFacade: AreasFacade,
    private readonly router: Router,
    private readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly serviceTagsApi: ServiceTagsApi,
    private readonly confirmationService: ConfirmationService,
    private readonly alertMessageService: AlertMessageService) {
  }

  ngOnInit(): void {
    this.buildTagChips();
    this.areas$ = this.areasFacade.getAreaSelectOptions$();
    this.maritimeServiceForm = this.fb.group({
      urn: [{ value: this.maritimeService?.urn, disabled: this.disabled }],
      name: [{ value: this.maritimeService?.name, disabled: this.disabled }, Validators.required],
      internationalName: [{ value: this.maritimeService?.name, disabled: this.disabled }],
      information: [{ value: this.maritimeService?.information, disabled: this.disabled }],
      localizedInformation: [{ value: this.maritimeService?.localizedInformation, disabled: this.disabled }],
      productionAgency: [{ value: this.maritimeService?.productionAgency, disabled: this.disabled }],
      country: [{ value: this.maritimeService?.country, disabled: this.disabled }],
      type: [{ value: this.maritimeService?.type, disabled: this.disabled }, Validators.required],
      authorityCode: [{ value: this.maritimeService?.authorityCode, disabled: this.disabled }],
      serviceNetwork: [{ value: this.maritimeService?.serviceNetwork, disabled: this.disabled }, Validators.required],
      pingPartner: [{ value: this.maritimeService?.pingPartner, disabled: this.disabled }],
      s124DataProducer: [{ value: this.maritimeService?.s124DataProducer, disabled: this.disabled }],
      maritimeNoticeProducer: [{ value: this.maritimeService?.maritimeNoticeProducer, disabled: this.disabled }],
      folderManager: [{ value: this.maritimeService?.folderManager, disabled: this.disabled }],
      surveyOwner: [{ value: this.maritimeService?.surveyOwner, disabled: this.disabled }],
      shomService: [{ value: this.maritimeService?.shomService, disabled: this.disabled }],
      areas: [{ value: this.maritimeService?.areas, disabled: this.disabled }],
      newTagName: [{ value: '', disabled: this.disabled }],
      tags: [{ value: this.maritimeService?.tags, disabled: this.disabled }],
      ihoProducerCode: [{ value: this.maritimeService?.ihoProducerCode, disabled: this.disabled }],
    });
    this.isProductionAgencyRequired = this.maritimeService?.maritimeNoticeProducer;
    this.isIhoProducerCodeRequired = this.maritimeService?.s124DataProducer && this.maritimeService?.maritimeNoticeProducer;
    this.formSubscription = this.subscribeToFormChanges();
    this.displayedAreaLabel = this.getDisplayedAreaLabel(this.translate.currentLang);

    this.typeHasChanged(this.maritimeService?.type);
    this.maritimeServiceForm.get('type').valueChanges
      .pipe(this.scavenger.collect())
      .subscribe(type => this.typeHasChanged(type));
  }

  typeHasChanged(type: string): void {
    const authorityCode = this.maritimeServiceForm.controls['authorityCode'];
    if (type === MaritimeServiceType.AUTHORITY) {
      authorityCode.setValidators([Validators.required]);
    } else {
      authorityCode.clearValidators();
    }

    authorityCode.updateValueAndValidity();
  }

  get type(): AbstractControl {
    return this.maritimeServiceForm.get('type');
  }

  buildTagChips() {
    this.tagChips = [];
    this.maritimeService.tags?.forEach(tag => this.tagChips.push({ key: tag.id, name: tag.value }));
  }

  get newTagName(): AbstractControl {
    return this.maritimeServiceForm?.get('newTagName');
  }

  addNewTag() {
    const index = this.findMaritimeServiceTagIndex(null, this.newTagName.value);
    if (index > -1) {
      this.alertMessageService.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'message.error.api.already-exist-service-tag'
      });
      return;
    }

    this.saveTag({
      value: this.newTagName.value.trim(),
      maritimeServiceId: this.maritimeService.id
    });
  }

  selectServiceMaritimeNoticeProducer(event): void {
    this.isProductionAgencyRequired = event.option;
  }

  protected selectServiceS124DataProducer(event: any): void {
    this.isIhoProducerCodeRequired = event.option;
  }

  onSaveNewTagName(): void {
    const index = this.findMaritimeServiceTagIndex(null, this.tagChipToModify.name);
    if (index > -1) {
      this.alertMessageService.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'message.error.api.already-exist-service-tag'
      });
      return;
    }

    this.displayModal = false;
    const indexTag = this.findMaritimeServiceTagIndex(this.tagChipToModify.key);
    if (indexTag > -1) {
      this.saveTag({
        id: this.maritimeService.tags[indexTag].id,
        value: this.tagChipToModify.name.trim(),
        maritimeServiceId: this.maritimeService.id
      });
    }
  }

  saveTag(tag: Tag): void {
    this.serviceTagsApi.saveTag(tag)
      .pipe(this.scavenger.collect())
      .subscribe(serviceTag => {
        let messageDetail = 'add';
        if (tag.id) {
          messageDetail = 'edit';
          const indexTag = this.findMaritimeServiceTagIndex(tag.id);
          if (indexTag > -1) {
            this.maritimeService.tags[indexTag].value = serviceTag.value;
            this.tagChips[indexTag].name = serviceTag.value;
          }
        } else {
          this.maritimeService.tags?.push(serviceTag);
          this.tagChips.push({ key: serviceTag.id, name: serviceTag.value });
          this.newTagName.setValue('');
        }

        this.tagChips.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.${messageDetail}-service-tag`
        });
      },
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-add-service-tag'
          });
          return throwError(err);
        });
  }

  deleteTag(tagId: string): void {
    this.serviceTagsApi.delete(tagId, this.maritimeService.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          const indexTag = this.findMaritimeServiceTagIndex(tagId);
          this.maritimeService.tags.splice(indexTag, 1);
          this.tagChips.splice(indexTag, 1);
          this.alertMessageService.add({
            severity: 'success',
            summary: 'message.summary.success',
            detail: 'message.success.api.delete-service-tag'
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

  confirmDelete(event: Event, chipKey: string): void {
    this.confirmationService.confirm({
      key: this.confirmDeleteTag,
      target: event.target,
      message: this.translate.instant('detail.delete-tag-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.removeTagFromService(chipKey)
    });
  }

  removeTagFromService(chipKey: string): void {
    const indexTag = this.findMaritimeServiceTagIndex(chipKey);
    if (indexTag > -1) {
      this.deleteTag(this.maritimeService.tags[indexTag].id);
    }
  }

  findMaritimeServiceTagIndex(id?: string, value?: string): number {
    return (id ? this.maritimeService.tags?.findIndex(tag => tag.id === id)
      : this.maritimeService.tags?.findIndex(tag => tag.value === value)) ?? -1;
  }

  showEditModalDialog(tagChip: TagChip): void {
    this.displayModal = true;
    this.tagChipToModify = cloneDeep(tagChip);
  }

  private getDisplayedAreaLabel(lang: string): string {
    return lang === 'es' ? 'name' : 'internationalName';
  }

  onChangeLang(event: LangChangeEvent): void {
    this.displayedAreaLabel = this.getDisplayedAreaLabel(event.lang);
  }

  private subscribeToFormChanges(): Subscription {
    return this.maritimeServiceForm.valueChanges.subscribe((data: MaritimeService) => {
      if (this.maritimeServiceForm.valid && this.maritimeServiceForm.dirty) {
        this.maritimeService = { ...this.maritimeService, ...data };
      }
    });
  }

  saveMaritimeService(): void {
    this.maritimeServiceSubscription = this.maritimeServicesApi.saveMaritimeService(this.maritimeService)
      .subscribe(service => {
        let messageDetail = 'create';
        if (this.maritimeService.id) {
          messageDetail = 'edit';
          this.maritimeService = service;
        } else {
          this.router.navigate(['/administration/service-maritime']);
        }

        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.${messageDetail}-maritime-service`
        });
      },
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-save-maritime-service'
          });
          return throwError(err);
        });
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
    this.maritimeServiceSubscription && this.maritimeServiceSubscription.unsubscribe();
  }
}
