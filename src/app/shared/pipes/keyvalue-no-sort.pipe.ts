import { Pipe, PipeTransform } from '@angular/core';


@Pipe({name: 'keyValueNoSort'})
export class KeyValueNoSortPipe implements PipeTransform {

  transform(input: Map<{key: string}, {value: any}>): Array<any> {
    return [...Object.entries(input)].map(([key, value]) => ({ key, value }));
  }
}
