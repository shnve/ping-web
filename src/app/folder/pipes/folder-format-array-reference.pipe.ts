import { Pipe, PipeTransform } from '@angular/core';
import { ReferenceFolderStudyDto } from '@app/infosource/models/infosource-table.model';
import { sortAlphabetically } from '@app/shared/generic-utils';
import { FolderFormatReferenceTypeLabelPipe } from './folder-format-reference-type-label.pipe';

@Pipe({
  name: 'folderFormatArrayReference',
  pure: false
})
export class FolderFormatArrayReferencePipe implements PipeTransform {
  constructor(private readonly folderFormatReferenceTypeLabelPipe: FolderFormatReferenceTypeLabelPipe) { }

  transform(referenceFolderStudies: Array<ReferenceFolderStudyDto>): string[] {
    const references = sortAlphabetically(referenceFolderStudies, 'value').map(reference => {
      return `${this.folderFormatReferenceTypeLabelPipe.transform(reference.type)} - ${reference.value}`;
    });

    return references.reverse();
  }
}
