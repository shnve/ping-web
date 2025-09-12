import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StudyReferencesTypeEnum, TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE } from '../models/folder-study.model';

@Pipe({
  name: 'folderFormatReferenceTypeLabel',
  pure: false
})
export class FolderFormatReferenceTypeLabelPipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) { }

  transform(referenceType: StudyReferencesTypeEnum): string {
    return this.translate.instant(TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE.find(reference => reference.type === referenceType).label);
  }
}
