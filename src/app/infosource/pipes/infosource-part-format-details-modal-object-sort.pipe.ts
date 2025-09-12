import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';

@Pipe({
  name: 'infosourcePartFormatDetailsModalObjectSort'
})
export class InfosourcePartFormatDetailsModalObjectSortPipe implements PipeTransform {

  constructor() {}

  transform(objectMap: Map<{ key: string }, { value: any }>): Array<KeyValue<string, any>> {
    return Object.entries(objectMap).map(entry => {
      return { key: entry[0], value: entry[1] } as any as KeyValue<string, any>;
    });
  }
}
