import { Pipe, PipeTransform } from '@angular/core';
import { formatSize } from '@app/shared/ui-utils';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'formatAttachmentFileSize'
})
export class FormatAttachmentFileSizePipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) { }

  transform(input: number): string {
    return formatSize(input, this.translate.instant('attachments.byte-unit'));
  }
}
