import { Pipe, PipeTransform } from '@angular/core';
import { Folder } from '@app/folder/models/folder.model';

@Pipe({
  name: 'folderFormatDetailsModalTitle'
})
export class FolderFormatDetailsModalTitlePipe implements PipeTransform {

  constructor() { }

  transform(folder: Partial<Folder>): string {
    if (!folder) { return ''; }
    return `${folder.number}/${new Date(folder.creationDate).getFullYear() % 100} - ${folder.issuingService} - ${folder.area}`;
  }
}
