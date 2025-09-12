import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatMonth'
})
export class FormatMonthPipe implements PipeTransform {

  private readonly MONTHS = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  transform(value: number): string | undefined {
    const month = this.MONTHS[value - 1];
    if (!month) {
      return undefined;
    }

    return `months.${month}`;
  }

}
