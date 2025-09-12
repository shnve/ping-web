import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { OnChangeLang } from '@app/core/localize';
import { Folder } from '@app/folder/models/folder.model';
import { folderServiceProvider } from '@app/folder/providers/folder.service.provider';
import { LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'folder-modal-body',
  templateUrl: './folder-modal-body.component.html',
  styleUrls: ['./folder-modal-body.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    folderServiceProvider
  ]
})
export class FolderModalBodyComponent implements OnInit, OnChangeLang {

  @Input() folder: Folder;

  constructor() { }

  onChangeLang: (langChangeEvent: LangChangeEvent) => void;

  ngOnInit(): void { }

  get folderStatus(): string {
    return `enum.folder-status.${this.folder.status.toLowerCase()}`;
  }

  get folderLastUpdate(): string {
    return `${this.folder.lastUpdate}`;
  }

}
