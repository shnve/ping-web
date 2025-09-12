import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ServiceTagsApi } from '@app/api/admin/service-tags-admin.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { InfosourceActionType, InfosourceStatusByService, Tag } from '@app/infosource/models/infosource.model';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { AbstractInfosourceService } from '@app/infosource/services/infosource.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import MaritimeService from '@app/models/maritime-service.model';
import { ServiceRole } from '@app/models/pro-user.model';
import { TranslateService } from '@ngx-translate/core';
import { showToast as showToastUtil } from '@shared/ui-utils';
import { Scavenger } from '@wishtack/rx-scavenger';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'infosource-modal-status-by-service',
  templateUrl: './infosource-modal-status-by-service.component.html',
  styleUrls: ['./infosource-modal-status-by-service.component.scss'],
  providers: [infosourceServiceProvider]
})
export class InfosourceModalStatusByServiceComponent implements OnInit, OnDestroy {

  @ViewChild('updateServiceStatusPanel') updateServiceStatusPanel: OverlayPanel;
  @Input() infosourceId: string;
  @Input() tags: string[];
  @Input() transferred = new Observable<void>();
  @Input() serviceSelectedId: string;
  @Input() issuingServiceId: string;

  statusByService: InfosourceStatusByService[];
  isServiceUser = false;
  currentServiceId: string;
  filteredActionTypes: InfosourceActionType[];

  displayModal = false;
  tagName = '';
  maritimeServices$: Observable<MaritimeService[]>;
  maritimeServiceId: string;
  optionsMaritimeServiceTags = [];
  grouped: boolean;
  selectedTagsIds = [];
  displayedMaritimeServiceLabel: string;
  changedValue = false;
  canAddAndLinkTag = false;

  private readonly scavenger = new Scavenger(this);

  constructor(
    private readonly infosourceService: AbstractInfosourceService,
    private readonly authService: AuthService,
    private readonly translateService: TranslateService,
    private readonly alertMessageService: AlertMessageService,
    private readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly serviceTagsApi: ServiceTagsApi,
  ) { }

  ngOnDestroy(): void { }

  ngOnInit(): void {
    this.isServiceUser = this.authService.hasRoleServiceUser();
    this.transferred
      .pipe(this.scavenger.collect())
      .subscribe(() => this.loadStatusByService());
    this.loadStatusByService();
  }

  buildTagsItems(): void {
    this.optionsMaritimeServiceTags = [];
    this.selectedTagsIds = [];

    // Filter only the Admin and Operator rights of the service user
    this.maritimeServices$ = this.maritimeServicesApi.findByServiceIds(this.getServices())
      .pipe(map(maritimeServices => maritimeServices.filter(maritimeService => this.checkIfServiceCanBeUseForLinkTag(maritimeService.id))));

    this.maritimeServices$.pipe(this.scavenger.collect()).subscribe(
      maritimeServices => {
        this.maritimeServiceId = maritimeServices.find(service => this.authService.hasAccessToService(service.id, ServiceRole.SERVICE_ADMIN))?.id;

        maritimeServices.forEach(maritimeService => {
          const items = [];
          maritimeService.tags.forEach(tag => items.push({ key: tag.id, value: tag.value }));

          this.optionsMaritimeServiceTags.push({
            label: maritimeService.name,
            items
          });
        });

        this.getTagsIdsFromInfosourceId$().pipe(this.scavenger.collect()).subscribe(tagsIds =>
          this.selectedTagsIds = tagsIds
        );
      }
    );

    this.displayedMaritimeServiceLabel = this.getDisplayedMaritimeServiceLabel(this.translateService.currentLang);
  }

  private checkIfServiceCanBeUseForLinkTag(serviceId: string): boolean {
    return (this.serviceSelectedId === serviceId && this.authService.hasAccessToService(serviceId, ServiceRole.SERVICE_ADMIN))
      || ((serviceId === this.serviceSelectedId) && (serviceId === this.issuingServiceId)
        && this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN], serviceId))
      || (this.statusByService.findIndex(service => service.serviceId === serviceId) !== -1
        && this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN], serviceId));
  }

  private getServices(): string[] {
    return this.authService.getAuthenticatedUser().serviceRoles.map(serviceRole => serviceRole.serviceId);
  }

  private getDisplayedMaritimeServiceLabel(lang: string): string {
    return lang === 'fr' ? 'name' : 'internationalName';
  }

  loadStatusByService(): void {
    this.infosourceService.getServiceStatuses$(this.infosourceId)
      .pipe(this.scavenger.collect())
      .subscribe(statusByService => {
        this.statusByService = statusByService;
        this.canAddAndLinkTag = this.hasRoleServiceOperatorOrAdmin();
        if (this.canAddAndLinkTag) {
          this.buildTagsItems();
        }
      });
  }

  updateServiceStatus(event: Event, serviceId: string, currentActionType: InfosourceActionType): void {
    this.currentServiceId = serviceId;
    this.filteredActionTypes = Object.keys(InfosourceActionType)
      .filter(actionType => actionType !== currentActionType)
      .map(actionType => InfosourceActionType[actionType]);
    this.updateServiceStatusPanel.toggle(event);
  }

  cancelUpdateServiceStatus(): void {
    this.updateServiceStatusPanel.hide();
  }

  confirmUpdateServiceStatus(actionType: InfosourceActionType): void {
    this.infosourceService.updateServiceStatus$(this.infosourceId, this.currentServiceId, actionType)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.updateServiceStatusPanel.hide();
          this.showToast(this.translateService.instant('infosource.details.update-service-status.success'), 'success');
          this.loadStatusByService();
        },
        () => {
          this.updateServiceStatusPanel.hide();
          this.showToast(this.translateService.instant('infosource.details.update-service-status.error'));
        }
      );
  }

  showToast(detail: string, severity: MessageSeverity = 'error'): void {
    showToastUtil(this.alertMessageService, detail, severity);
  }

  hasRoleServiceOperatorOrAdmin(id?: string): boolean {
    return this.statusByService.findIndex(service =>
      this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN], id ?? service.serviceId)) !== -1;
  }

  saveTag(tag: Tag): void {
    this.serviceTagsApi.saveTag(tag)
      .pipe(this.scavenger.collect())
      .subscribe(serviceTag => {
        this.tagName = '';
        this.showToast(this.translateService.instant('message.success.api.add-service-tag'), 'success');
        this.selectedTagsIds.push(serviceTag.id);
        this.changedValue = true;
        this.linkTagsToInfosource();
        this.buildTagsItems();
      },
        err => {
          this.showToast(this.translateService.instant('message.error.api.cannot-add-service-tag'));
          return throwError(err);
        });
  }

  saveNewTag(): void {
    this.maritimeServices$.pipe(this.scavenger.collect()).subscribe(
      maritimeServices => {
        const maritimeService = maritimeServices.find(service => service.id === this.maritimeServiceId);
        const index = maritimeService.tags?.findIndex(tag => tag.value === this.tagName) ?? -1;
        if (index > -1) {
          this.showToast(this.translateService.instant('message.error.api.already-exist-service-tag'));
          return;
        }

        this.displayModal = false;
        this.saveTag({
          value: this.tagName.trim(),
          maritimeServiceId: this.maritimeServiceId
        });
      }
    );
  }

  linkTagsToInfosource(): void {
    if (!this.changedValue) {
      return;
    }

    const messageDetail = this.selectedTagsIds?.length ? 'add' : 'del';

    this.infosourceService.linkTagsToInfosource$(this.infosourceId, this.selectedTagsIds)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.changedValue = false;
          this.showToast(this.translateService.instant(`infosource.details.update-service-status.success-${messageDetail}-link-infosource-tag`), 'success');
        },
        (err: Error) => {
          this.showToast(this.translateService.instant('infosource.details.update-service-status.error-link-infosource-tag'));
          return throwError(err);
        }
      );
  }

  getTagsIdsFromInfosourceId$(): Observable<string[]> {
    return this.infosourceService.getTagsIdsFromInfosourceId$(this.infosourceId);
  }
}
