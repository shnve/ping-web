import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'formatNotificationTitle'
})
export class FormatNotificationTitlePipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) { }

  transform(title: string): string {
    return title.replace('{{AN}}', '<br/>' + this.translate.instant('notification.linked-warnings')).replace('{{FOLDER}}', '<br/>' + this.translate.instant('notification.linked-folders'));
  }

}
