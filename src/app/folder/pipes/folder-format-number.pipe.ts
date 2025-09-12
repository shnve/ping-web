import { Pipe, PipeTransform } from '@angular/core';
import { TableFolder } from '@app/folder/models/folder-table.model';

@Pipe({
  name: 'folderFormatNumber',
  pure: false
})
export class FolderFormatNumberPipe implements PipeTransform {

  constructor() { }

  transform(folder: TableFolder): string {
    if (!folder) { return ''; }
    return folder.number + '/' + new Date(folder.creationDate).getFullYear() % 100;
  }
}
