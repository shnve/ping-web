import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { LangService } from '@app/core/lang.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { FolderModalTableComponent } from '@app/folder/components/folder-modal/folder-modal-table/folder-modal-table.component';
import { Folder } from '@app/folder/models/folder.model';
import { folderServiceProvider } from '@app/folder/providers/folder.service.provider';
import { FolderService } from '@app/folder/services/folder.service';
import MaritimeService, { ServiceNetwork, ServiceRole } from '@app/models/maritime-service.model';
import { DetailsModalComponent } from '@app/shared/components/details-modal/details-modal.component';
import { GetNumberForSearchedPartPipe } from '@app/shared/pipes/get-number-for-searched-part.pipe';
import { NotificationState } from '@app/states/notification.state';
import { environment } from '@env/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { cloneDeep, pick } from 'lodash-es';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { switchMap } from 'rxjs/operators';
import { MaritimeServiceAvailableToFollowFolder } from './../../models/folder.model';
import { FolderModalEditStudyComponent } from './../shared/folder-modal-edit-study/folder-modal-edit-study.component';
import { FolderModalGraphComponent } from './folder-modal-graph/folder-modal-graph.component';

@Localize()
@Component({
  selector: 'folder-modal',
  templateUrl: './folder-modal.component.html',
  styleUrls: [
    '../../../shared/components/details-modal/details-modal.component.scss',
    './folder-modal.component.scss'
  ],
  providers: [
    folderServiceProvider
  ]
})
export class FolderModalComponent extends DetailsModalComponent implements OnChanges, OnChangeLang {

  folder: Folder;
  folderWithNotionsFilteredForGraph: Folder;
  folderPartial: Partial<Folder>;
  canEditOrDelete = false;
  canReadStudies = false;
  canFollow = false;
  @Input() folderIsFollowed: boolean;
  canUnFollow = false;
  @Input() mainFolders: Partial<Folder>[] = [];
  @Input() followerServiceId: string;
  @Output() onFolderAreaSet = new EventEmitter<string>();
  @Output() followedFolderUpdated = new EventEmitter<void>();
  maritimeService: MaritimeService;

  @ViewChild('folderGraph') folderGraph: FolderModalGraphComponent;
  @ViewChild('modalCreateStudy') modalCreateStudy: FolderModalEditStudyComponent;
  @ViewChild('modalFolderTable') modalFolderTable: FolderModalTableComponent;
  @ViewChild('notifyPanel') notifyPanel: OverlayPanel;
  @ViewChild('followPanel') followPanel: OverlayPanel;
  @ViewChild('manageButton') manageButton: ElementRef;

  selectedNotionsIdsForCreatingStudy: string[] = [];
  selectedAttachmentsIdsForCreatingStudy: string[] = [];

  availableNotifiedServices: MaritimeService[] = [];
  selectedNotifiedServices: MaritimeService[] = [];

  availableServicesToFollow: MaritimeServiceAvailableToFollowFolder[] = [];
  selectedServicesToFollow: MaritimeServiceAvailableToFollowFolder[] = [];
  private items: MenuItem[] = [];
  protected canManage = false;

  folderReferences = [];

  constructor(
    protected readonly alertMessageService: AlertMessageService,
    protected readonly translate: TranslateService,
    protected readonly langService: LangService,
    protected readonly elRef: ElementRef,
    private readonly router: Router,
    private readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly confirmationService: ConfirmationService,
    protected readonly authService: AuthService,
    protected readonly folderService: FolderService,
    private readonly notificationState: NotificationState,
    protected readonly getNumberForSearchedPart: GetNumberForSearchedPartPipe) {
    super(translate, alertMessageService, langService, elRef, authService, getNumberForSearchedPart);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.mainFolders && this.mainFolders) {
      this.folderPartial = this.mainFolders[this.currentPosition];
      this.loadFolder();
      this.show();
    }
  }

  private loadReferences(): void {
    this.folderService.getReferencesByFolderIds$([this.folderPartial.id])
      .pipe(this.scavenger.collect())
      .subscribe(references => {
        this.folderReferences = references;
      });
  }

  protected loadFolder(): void {
    this.maritimeServicesApi.findOne(this.authService.getAuthenticatedUser()?.serviceId)
      .pipe(switchMap(service => {
        this.maritimeService = service;
        return this.folderService.getFolderById$(this.folderPartial.id);
      }),
        this.scavenger.collect())
      .subscribe(folder => {
        this.folderPartial = pick(folder, ['id', 'number', 'issuingService', 'area', 'creationDate']);
        this.folder = folder;
        this.folderWithNotionsFilteredForGraph = cloneDeep(folder);
        this.folderWithNotionsFilteredForGraph.notions = folder.notions.filter(notion => notion.number);
        this.onFolderAreaSet.emit(this.folder.areaId);
        this.canEditOrDelete = this.checkIfCanEditOrDelete(this.folder);
        this.checkIfCanFollow();
        this.checkIfCanUnFollow();
        this.canReadStudies = this.checkIfCanReadStudies(this.folder);
        this.updateSharedLinkUrl();
        this.canManage = this.canEditOrDelete || this.canFollow || this.canUnFollow;
        this.buildManagementMenu();

        this.selectedAttachmentsIdsForCreatingStudy.forEach((attachmentId, index) => {
          if (!this.folder.attachments.map(attachment => attachment.id).includes(attachmentId)) {
            this.selectedAttachmentsIdsForCreatingStudy.splice(index, 1);
          }
        });

        this.selectedNotionsIdsForCreatingStudy.forEach((notionId, index) => {
          if (!this.folder.notions.map(notion => notion.id).includes(notionId)) {
            this.selectedNotionsIdsForCreatingStudy.splice(index, 1);
          }
        });

        this.loadReferences();
      });
  }

  checkIfCanEditOrDelete(folder: Folder): boolean {
    return this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], folder.serviceId);
  }

  checkIfCanFollow(): void {
    const maritimeServiceIds = [
      ...(this.authService.getAuthenticatedUser()?.serviceRoles
        .map(serviceRole => serviceRole.serviceId)
        .filter(serviceId => this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], serviceId)) ?? [])
    ];

    this.canFollow = !this.folderIsFollowed && maritimeServiceIds.length > 0;
  }

  checkIfCanUnFollow(): void {
    this.canUnFollow = this.folderIsFollowed && this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], this.followerServiceId);
  }

  checkIfCanReadStudies(folder: Folder): boolean {
    return this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], folder.serviceId) ||
      (this.maritimeService?.serviceNetwork === ServiceNetwork.GOVERNMENT_SERVICE && this.maritimeService?.shomService);
  }

  checkIfServiceCanBeNotified(folder: Folder, service: MaritimeService) {
    return service.id === folder.serviceId || service.serviceNetwork === ServiceNetwork.GOVERNMENT_SERVICE;
  }

  edit(): void {
    this.router.navigate(['/folder/modification/' + this.folder.id],
      {
        queryParams: {
          from: this.followerServiceId ? environment.followedFolderSharedUrlContext : environment.folderSharedUrlContext
        }
      });
  }

  confirmDelete(event: Event): void {
    this.confirmationService.confirm({
      target: this.manageButton.nativeElement,
      message: this.translate.instant('folder.details.delete.delete-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.delete();
      }
    });
  }

  delete(): void {
    this.folderService.delete$(this.folder.id).subscribe(
      () => {
        this.showToast(this.translate.instant('folder.details.delete.delete-success'), 'success');
        this.onStatusChangeAction.emit();
        this.notificationState.setNotificationObjectDeleted$();
      },
      () => {
        this.showToast(this.translate.instant('folder.details.delete.delete-error'), 'error');
      });
  }

  private updateSharedLinkUrl(): void {
    if (!this.folder?.id) { return; }
    const urlSuffix = '/'.concat(this.followerServiceId ? environment.followedFolderSharedUrlContext : environment.folderSharedUrlContext);
    const url = window.location.href.split(urlSuffix)[0];
    this.currentSharedLinkUrl = `${url.concat(urlSuffix)}/${this.folder.id}`;
  }

  onNotionOrAttachmentChanged(): void {
    this.loadFolder();
  }

  onStudyChanged(): void {
    this.loadFolder();
  }

  resetSelectionsForCreatingStudy(): void {
    this.modalFolderTable.selectedNotionsForCreatingStudy = [];
    this.modalFolderTable.modalFolderAttachmentTable.selectedAttachmentsIdsForCreatingStudy = [];
    this.selectedNotionsIdsForCreatingStudy = [];
    this.selectedAttachmentsIdsForCreatingStudy = [];
    this.loadFolder();
  }

  addOrRemoveCreateStudyOptionIfCanCreateStudy(): void {
    const createStudyOptionIndex = this.items.findIndex(item => item.id === 'create-study');

    if (!this.selectedNotionsIdsForCreatingStudy.length && !this.selectedAttachmentsIdsForCreatingStudy.length && createStudyOptionIndex > -1) {
      this.items.splice(createStudyOptionIndex, 1);
      return;
    }

    if (this.selectedNotionsIdsForCreatingStudy.length || this.selectedAttachmentsIdsForCreatingStudy.length) {
      if (createStudyOptionIndex > -1) {
        return;
      }

      this.items.push({
        id: 'create-study',
        label: this.translate.instant('folder.details.create-study'),
        command: () => this.createStudy(),
        title: this.translate.instant('folder.details.create-study')
      });
    }
  }

  selectNotion(notionsIds: string[]): void {
    this.selectedNotionsIdsForCreatingStudy = notionsIds;
    this.addOrRemoveCreateStudyOptionIfCanCreateStudy();
  }

  selectAttachment(attachmentsIds: string[]): void {
    this.selectedAttachmentsIdsForCreatingStudy = attachmentsIds;
    this.addOrRemoveCreateStudyOptionIfCanCreateStudy();
  }

  createStudy(): void {
    this.modalCreateStudy.buildNotionsItems(this.selectedNotionsIdsForCreatingStudy);
    this.modalCreateStudy.studyForm.get('attachmentsIds').setValue(this.selectedAttachmentsIdsForCreatingStudy);
    this.modalCreateStudy.studyReferences.references = [];
    this.modalCreateStudy.folderId = this.folder.id;
    this.modalCreateStudy.displayModal = true;
  }

  handleChange(event: { index: number }): void {
    // Detect graph tab focus
    if (event.index === 0) {
      setTimeout(() => this.folderGraph.onFocus(), 1);
    }
  }

  confirmClone(event: Event): void {
    this.confirmationService.confirm({
      target: this.manageButton.nativeElement,
      message: this.translate.instant('folder.details.clone.clone-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.clone();
      }
    });
  }

  clone(): void {
    this.folderService.clone$(this.folder.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        (clonedFolderId: string) => {
          this.showToast(this.translate.instant('folder.details.clone.clone-success'), 'success');
          this.router.navigate(['/folder/modification/' + clonedFolderId]);
        },
        () => {
          this.showToast(this.translate.instant('folder.details.clone.clone-error'), 'error');
        });
  }

  notify(event: Event): void {
    this.maritimeServicesApi.getMaritimeServices()
      .pipe(this.scavenger.collect())
      .subscribe(services => {
        this.availableNotifiedServices = services.filter(service => this.checkIfServiceCanBeNotified(this.folder, service));
        this.selectedNotifiedServices = [];
        this.notifyPanel.show(event, this.manageButton.nativeElement);
      });
  }

  closeNotifyPanel(): void {
    this.notifyPanel.hide();
    this.availableNotifiedServices = [];
    this.selectedNotifiedServices = [];
  }

  confirmNotify(): void {
    this.folderService.notify$(this.folder.id, this.selectedNotifiedServices.map(service => service.id))
      .pipe(this.scavenger.collect())
      .subscribe(() => {
        this.showToast(this.translate.instant('detail.notify-folder-success'), 'success');
        this.closeNotifyPanel();
      }, () => {
        this.showToast(this.translate.instant('detail.notify-folder-error'), 'error');
      });
  }

  follow(event: Event): void {
    this.folderService.getMaritimeServiceAvailableToFollowFolder$(this.folder.id)
      .pipe(this.scavenger.collect())
      .subscribe(services => {
        this.availableServicesToFollow = services;
        this.selectedServicesToFollow = [];
        const mainServiceForServiceUser = services.find(service => service.id === this.authService.getAuthenticatedUser()?.serviceId);
        if (mainServiceForServiceUser) {
          this.selectedServicesToFollow.push(mainServiceForServiceUser);
        }
        this.followPanel.show(event, this.manageButton.nativeElement);
      });
  }

  closeFollowPanel(): void {
    this.followPanel.hide();
    this.availableServicesToFollow = [];
    this.selectedServicesToFollow = [];
  }

  confirmFollow(): void {
    this.folderService.follow$(this.folder.id, this.selectedServicesToFollow.map(service => service.id))
      .pipe(this.scavenger.collect())
      .subscribe(() => {
        this.followedFolderUpdated.emit();
        if (this.followerServiceId) {
          this.canFollow = false;
          this.canUnFollow = true;
        }
        this.showToast(this.translate.instant('folder.details.follow.follow-success'), 'success');
        this.closeFollowPanel();
      }, () => {
        this.showToast(this.translate.instant('folder.details.follow.follow-error'), 'error');
      });
  }

  unFollow(): void {
    this.folderService.unFollow$(this.folder.id, this.followerServiceId).subscribe(
      () => {
        this.showToast(this.translate.instant('folder.details.un-follow.un-follow-success'), 'success');
        this.onStatusChangeAction.emit();
      },
      () => {
        this.showToast(this.translate.instant('folder.details.un-follow.un-follow-error'), 'error');
      });
  }

  confirmUnFollow(event: Event): void {
    this.confirmationService.confirm({
      target: this.manageButton.nativeElement,
      message: this.translate.instant('folder.details.un-follow.un-follow-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.unFollow();
      }
    });
  }

  buildManagementMenu(): void {
    this.items = [];

    if (this.canEditOrDelete) {
      this.items = [
        {
          id: 'edit',
          label: this.translate.instant('detail.edit'),
          command: () => this.edit(),
          title: this.translate.instant('detail.edit')
        },
        {
          id: 'delete',
          label: this.translate.instant('detail.delete'),
          command: (event: any) => this.confirmDelete(event.originalEvent),
          title: this.translate.instant('detail.delete')
        },
        {
          id: 'clone',
          label: this.translate.instant('detail.clone'),
          command: (event: any) => this.confirmClone(event.originalEvent),
          title: this.translate.instant('detail.clone')
        },
        {
          id: 'notify',
          label: this.translate.instant('detail.notify'),
          command: (event: any) => this.notify(event.originalEvent),
          title: this.translate.instant('detail.notify')
        }
      ];
    }

    if (this.canFollow) {
      this.items.push({
        id: 'follow',
        label: this.translate.instant('detail.follow'),
        command: (event: any) => this.follow(event.originalEvent),
        title: this.translate.instant('detail.follow')
      });
    } else if (this.canUnFollow) {
      this.items.push({
        id: 'un-follow',
        label: this.translate.instant('detail.un-follow'),
        command: (event: any) => this.confirmUnFollow(event.originalEvent),
        title: this.translate.instant('detail.un-follow')
      });
    }
  }

  onChangeLang(event: LangChangeEvent): void {
    this.buildManagementMenu();
  }

}
