import { Pipe, PipeTransform } from '@angular/core';
import { MainWarningPart } from '@app/models/warning.model';

@Pipe({
  name: 'formatWarningsNumberToCancel'
})
export class FormatWarningsNumberToCancelPipe implements PipeTransform {

  transform(warningsToCancel: Array<MainWarningPart>): string {
    if (!warningsToCancel?.length) {
      return '';
    }

    return warningsToCancel.reduce((accumulator, warningData, index) => {
      const year = (warningData.year ?? '').toString();
      return `${accumulator}${warningData.nameOfSeries} ${warningData.warningNumber}/${year.substring(2)}`.concat(warningsToCancel.length - 1 !== index ? ', ' : '');
    }, '');
  }
}
