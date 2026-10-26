import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AreasApi } from '@app/api/areas.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { SubAreasApi } from '@app/api/sub-areas.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { AreaSelectOption } from '@app/facades/areas.facade';
import { CreationFolderDto } from '@app/folder/models/folder-creation.model';
import { Folder, FolderStatusEnum, TRANSLATIONS_LIST_FOLDER_STATUS } from '@app/folder/models/folder.model';
import { FolderService } from '@app/folder/services/folder.service';
import { InfosourceAdminService } from '@app/infosource/services/infosource-admin.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import Area from '@app/models/area.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService from '@app/models/maritime-service.model';
import { ProUserServices, ServiceRole } from '@app/models/pro-user.model';
import { SubArea } from '@app/models/sub-area.model';
import { formatFrenchDateToIsoDate } from '@app/shared/date-utils';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import _ from 'lodash';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subscription, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from './../../../../environments/environment.local';

@Component({
  selector: 'folder-creation',
  templateUrl: './folder-creation.component.html',
  styleUrls: ['./folder-creation.component.scss']
})
@Localize()
export class FolderCreationComponent implements OnInit, OnDestroy, OnChangeLang {
  urlToRedirect: string;
  areas$: Observable<AreaSelectOption[]>;
  serviceAreas: AreaSelectOption[];
  subArea$: Observable<SubArea[]>;
  folder$: Observable<Folder>;
  displayedAreaLabel: string;
  folderForm: UntypedFormGroup;
  disabled = false;
  availableMaritimeEntities: MaritimeEntityBase[];
  protected scavenger = new Scavenger(this);
  proUserServices$: Observable<ProUserServices[]>;
  maritimeService: MaritimeService = {
    id: null,
    name: null
  };
  private createSubscription: Subscription;
  private getMaritimeSubscription: Subscription;
  private getFolderSubscription: Subscription;
  private getAvailableMaritimeSubscription: Subscription;
  creationFolderDto: CreationFolderDto;
  readonly dateFormat = 'dd/mm/yy';
  submitted = false;
  folderId: string;
  availableStatus: Array<{ key: string, value: string }>;

  constructor(private readonly fb: UntypedFormBuilder,
    public readonly translate: TranslateService,
    private readonly areasApi: AreasApi,
    protected readonly usersApi: UsersApi,
    private readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly authService: AuthService,
    private readonly folderService: FolderService,
    private readonly infosourceAdminService: InfosourceAdminService,
    private readonly subAreasApi: SubAreasApi,
    private readonly activatedRoute: ActivatedRoute,
    private readonly alertMessageService: AlertMessageService,
    private readonly router: Router,
    private readonly translateService: TranslateService,
    private readonly confirmationService: ConfirmationService) {
    this.buildLocalizedItems();
    this.consultFolder();
  }

  ngOnInit(): void {
    this.updateDisplayedAreaLabel(this.translate.currentLang);
    this.loadAvailableMaritimeEntities();
    this.areas$ = this.areasApi.getAreasByServices([this.authService.getAuthenticatedUser()?.serviceId])
      .pipe(
        map<Area[], AreaSelectOption[]>(areas =>
          areas.map<AreaSelectOption>(area => {
            return {
              id: area.id,
              name: area.name,
              internationalName: area.internationalName ?? area.name,
            };
          })
        ),
        map(areas => _.sortBy(areas, this.displayedAreaLabel))
      );
    this.areas$.pipe(this.scavenger.collect())
      .subscribe(areas => this.serviceAreas = areas);
    this.getMaritimeSubscription = this.maritimeServicesApi.findOne(this.authService.getAuthenticatedUser()?.serviceId)
      .subscribe(maritimeService => {
        this.maritimeService = maritimeService;
        this.subArea$ = of([]);
        const areaId = this.maritimeService.areas.length === 1 ? this.maritimeService.areas[0] : this.creationFolderDto?.areaId;
        if (!!areaId) {
          this.updateSubAreaList(areaId);
        }

        this.initForm();
      });

    this.activatedRoute.queryParams?.pipe(this.scavenger.collect()).subscribe({
      next: params => {
        const isValidUrlForFolders = [environment.folderSharedUrlContext, environment.followedFolderSharedUrlContext].includes(params?.from);
        this.urlToRedirect = isValidUrlForFolders ? params?.from : environment.followedFolderSharedUrlContext;
      },
      error: err => throwError(err)
    });
  }

  initForm() {
    this.folderForm = this.fb.group({
      serviceId: this.authService.getAuthenticatedUser()?.serviceId,
      areas: [{ value: this.creationFolderDto?.areaId ? this.creationFolderDto?.areaId : this.getAreaId(), disabled: this.disabled }, Validators.required],
      concernedMaritimeEntityIds: [this.creationFolderDto?.concernedMaritimeEntityIds],
      object: [this.creationFolderDto?.object ?? '', Validators.required],
      locality: this.creationFolderDto?.localityId ?? '',
      reviewDate: this.creationFolderDto?.reviewDate ?? null,
      comment: this.creationFolderDto?.comment ?? '',
      status: this.creationFolderDto?.status ?? ''
    });
  }

  changeSelectedArea(id: string): void {
    if (!id || id === '') { return; }
    this.updateSubAreaList(id);
  }

  updateSubAreaList(areaId: string): void {
    this.subArea$ = this.subAreasApi.getSubAreasByAreaId$(areaId).pipe(
      map(subAreas =>
        subAreas.map(subArea => {
          return {
            id: subArea.id,
            name: subArea.name,
            internationalName: subArea.internationalName ?? subArea.name
          };
        })
      ),
      map(subAreas => _.sortBy(subAreas, this.displayedAreaLabel))
    );
  }

  getAreaId(): string {
    return this.serviceAreas?.length === 1 ? this.serviceAreas[0].id : null;
  }

  private consultFolder() {
    this.folder$ = this.activatedRoute.paramMap
      .pipe(
        switchMap(paramMap => {
          const folderId = paramMap.get('id');
          if (folderId) {
            this.folderId = folderId;
            return this.folderService.getFolderDetailById$(folderId);
          }
          return null;
        })
      );
    if (this.activatedRoute.snapshot?.params?.id) {
      this.getFolderSubscription = this.folder$.subscribe(folder => {
        this.creationFolderDto = this.buildCreationFolderDto(folder);
        this.initForm();
      });
    }
    this.initForm();
  }

  private formatDate(date: Date): string {
    if (!date) { return null; }
    let [year, month, day] = date.toString().split('-');
    day = day.split('T')[0];
    return `${day}/${month}/${year}`;
  }

  buildCreationFolderDto(folder: Folder): CreationFolderDto {
    return {
      areaId: folder?.areaId,
      concernedMaritimeEntityIds: folder?.concernedMaritimeEntityIds,
      object: folder?.object,
      localityId: folder?.localityId,
      comment: folder?.comment,
      reviewDate: this.formatDate(folder?.reviewDate),
      status: folder?.status
    }
  }

  loadAvailableMaritimeEntities(): void {
    const proUserId = this.authService.getAuthenticatedUser()?.id;
    const proUserServiceId = this.authService.getAuthenticatedUser()?.serviceId;
    this.proUserServices$ = this.usersApi.findProServices(proUserId)
      .pipe(map(proServices => proServices
        .filter(proService => [ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN].includes(proService.serviceRole)))
      );
    this.getAvailableMaritimeSubscription = this.infosourceAdminService.getAvailableMaritimeEntitiesForCreation$(proUserServiceId)
      .pipe(this.scavenger.collect())
      .subscribe(maritimeEntities => this.availableMaritimeEntities = maritimeEntities);
  }

  private getDisplayedAreaLabel(lang: string): string {
    return lang === 'es' ? 'name' : 'internationalName';
  }

  buildLocalizedItems(): void {
    this.availableStatus = TRANSLATIONS_LIST_FOLDER_STATUS.map(({ key, value }) => ({
      key,
      value: this.translate.instant(value)
    })
    );
  }

  onChangeLang(event: LangChangeEvent): void {
    this.buildLocalizedItems();
    this.updateDisplayedAreaLabel(event.lang);
  }

  private updateDisplayedAreaLabel(lang: string): void {
    this.displayedAreaLabel = this.getDisplayedAreaLabel(lang);
  }

  saveForm(): void {
    this.creationFolderDto = {
      serviceId: this.authService.getAuthenticatedUser()?.serviceId,
      areaId: this.areas?.value,
      localityId: this.locality.value,
      concernedMaritimeEntityIds: this.concernedMaritimeEntityIds.value,
      object: this.object.value,
      reviewDate: this.reviewDate.value ? formatFrenchDateToIsoDate(this.reviewDate.value) : null,
      comment: this.comment.value,
      status: this.status.value || FolderStatusEnum.OPEN
    };
  }

  validate(): void {
    this.submitted = true;
    if (this.folderForm.invalid) {
      return;
    }
    this.saveForm();
    this.isCreationMode() ? this.createFolder() : this.updateFolder();
  }

  private createFolder(): void {
    this.createSubscription = this.folderService.createFolder$(this.creationFolderDto)
      .subscribe(id => {
        this.folderId = id;
        this.showToast('message.success.api.create-folder.created', 'success');
        this.router.navigate([environment.folderSharedUrlContext], { queryParams: { areaId: this.creationFolderDto.areaId } });
      }, err => {
        this.showToast('message.error.api.cannot-create-folder');
        return throwError(err);
      });
  }

  private updateFolder(): void {
    this.createSubscription = this.folderService.updateFolder$(this.folderId, this.creationFolderDto)
      .subscribe(id => {
        this.showToast('message.success.api.update-folder.updated', 'success');
        this.router.navigate([this.urlToRedirect], { queryParams: { tab: this.creationFolderDto.status, areaId: this.creationFolderDto.areaId } });
      }, err => {
        this.showToast('message.error.api.update-create-folder');
        return throwError(err);
      });
  }

  confirmCancelActionOnFolder(event: Event): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translateService.instant('georegulation.edition.cancel-message'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.router.navigate([this.urlToRedirect], this.creationFolderDto?.status ?
        { queryParams: { tab: this.creationFolderDto.status, areaId: this.creationFolderDto.areaId } }
        : {}
      )
    });
  }

  protected showToast(detail: string, severity: MessageSeverity = 'error'): void {
    this.alertMessageService.add({
      summary: `message.summary.${severity === 'error' ? 'error' : 'success'}`,
      severity,
      detail
    });
  }

  isCreationMode(): boolean {
    return !this.folderId;
  }

  ngOnDestroy(): void {
    if (this.createSubscription) { this.createSubscription.unsubscribe(); }
    if (this.getMaritimeSubscription) { this.getMaritimeSubscription.unsubscribe(); }
    if (this.getAvailableMaritimeSubscription) { this.getAvailableMaritimeSubscription.unsubscribe(); }
    if (this.getFolderSubscription) { this.getFolderSubscription.unsubscribe(); }
  }

  get areas(): AbstractControl {
    return this.folderForm.get('areas');
  }

  get locality(): AbstractControl {
    return this.folderForm.get('locality');
  }

  get concernedMaritimeEntityIds(): AbstractControl {
    return this.folderForm.get('concernedMaritimeEntityIds');
  }

  get object(): AbstractControl {
    return this.folderForm.get('object');
  }

  get reviewDate(): AbstractControl {
    return this.folderForm.get('reviewDate');
  }

  get comment(): AbstractControl {
    return this.folderForm.get('comment');
  }

  get status(): AbstractControl {
    return this.folderForm.get('status');
  }
}
