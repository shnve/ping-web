import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapHasContent'
})
export class MapHasContentPipe implements PipeTransform {

  constructor() { }

  transform(map: Map<{ key: string }, { value: any }>): boolean {
    if (!map) { return false; }
    return Object.keys(map).length > 0;
  }
}
