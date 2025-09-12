import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { FolderAdminApi } from '@app/folder/api/folder-admin.api';
import { Folder } from '@app/folder/models/folder.model';
import { MessageSeverity } from '@app/models/alert-message.model';
import { TranslateService } from '@ngx-translate/core';
import { showToast as showToastUtil } from '@shared/ui-utils';
import { Scavenger } from '@wishtack/rx-scavenger';
import { NotionTypeEnum } from './notion-type-enum';

export interface FolderByArea {
  label: string;
  value: string;
  items: Array<{
    key: string;
    value: string;
  }>;
}

export interface Items {
  key: string;
  value: string;
}

@Component({
  selector: 'shared-add-notion-to-folder-selection',
  templateUrl: './add-notion-to-folder-selection.component.html',
  styleUrls: ['./add-notion-to-folder-selection.component.scss']
})
export class AddNotionToFolderSelectionComponent implements OnInit, OnDestroy {
  @Input() notionId: string;
  @Input() notionType: NotionTypeEnum;
  @Output() addingPanelClosed = new EventEmitter<boolean>();
  folderId: string;
  availableFoldersToBeAdded = [];
  private readonly scavenger = new Scavenger(this);
  selectedFolderIdToBeAdded: string = null;   // init to null required, otherwise placeholder will disappear

  constructor(private readonly folderAdminApi: FolderAdminApi,
    private readonly translateService: TranslateService,
    private readonly alertMessageService: AlertMessageService
  ) { }

  ngOnInit(): void {
    this.fetchAvailableFoldersToBeAdded();
  }

  fetchAvailableFoldersToBeAdded(): void {
    this.folderAdminApi.getFoldersToAddNotionTo$(this.notionId, this.notionType)
      .pipe(this.scavenger.collect())
      .subscribe(folders => this.availableFoldersToBeAdded = this.buildFolderListByArea(folders));
  }

  buildFolderListByArea(folders: Folder[]): FolderByArea[] {
    const listFolderByArea: FolderByArea[] = folders.reduce(function (result, folder) {
      const groupName = folder.area ?? 'BY_ENTITY';
      (result[groupName] = result[groupName] ?? []).push({
        key: folder.number + '/' + folder.year.toString().slice(-2),
        value: folder.id
      });
      return result;
    }, []);

    return Object.keys(listFolderByArea).map(key => { return { label: key, value: key, items: listFolderByArea[key] }; });
  }

  close(): void {
    this.availableFoldersToBeAdded = [];
    this.selectedFolderIdToBeAdded = undefined;
    this.addingPanelClosed.emit(true);
  }

  confirm(): void {
    this.folderAdminApi.addNotionToFolder$(this.selectedFolderIdToBeAdded, this.notionId, this.notionType)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.showToast(this.translateService.instant('folder.details.add-notion-to-folder.success'), 'success');
          this.close();
        },
        () => {
          this.showToast(this.translateService.instant('folder.details.add-notion-to-folder.error'));
          this.close();
        }
      );
  }

  showToast(detail: string, severity: MessageSeverity = 'error'): void {
    showToastUtil(this.alertMessageService, detail, severity);
  }

  ngOnDestroy(): void { }

}
