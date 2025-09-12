import { Pipe, PipeTransform } from '@angular/core';
import { WarningPublicReferenceType } from '@app/models/warning-public-reference.model';
import { TranslateService } from '@ngx-translate/core';
import { getPublicReferenceLabels } from '../warning-public-reference-utils';

@Pipe({
  name: 'formatReferenceHeader',
  pure: false
})
export class FormatReferenceHeaderPipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) { }

  transform(warningPublicReferenceType: WarningPublicReferenceType, numberOfReferences: number): string {
    const publicReferenceLabels = getPublicReferenceLabels(warningPublicReferenceType);
    return this.translate.instant(`admin-warning.creation.labels.references.${publicReferenceLabels.numberLabel}`)
      .replace(`{{${publicReferenceLabels.referenceLengthLabel}}}`, numberOfReferences);
  }
}
