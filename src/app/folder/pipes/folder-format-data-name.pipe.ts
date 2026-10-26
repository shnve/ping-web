import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface FolderDataBase {
  id: string;
  name: string;
  internationalName?: string;
}

@Pipe({
  name: 'folderFormatDataName',
  pure: false
})
export class FolderFormatDataNamePipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) { }

  transform(folderData: FolderDataBase): string {
    return this.translate.currentLang === 'es' ? folderData.name : folderData.internationalName;
  }
}
