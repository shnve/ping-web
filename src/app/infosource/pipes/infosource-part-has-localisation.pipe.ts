import { Pipe, PipeTransform } from '@angular/core';
import { InfosourcePart } from '../models/infosource.model';

@Pipe({
  name: 'infosourcePartHasLocalisation'
})
export class InfosourcePartHasLocalisationPipe implements PipeTransform {

  constructor() { }

  transform(part: InfosourcePart): boolean {
    return part.localisation?.length > 0;
  }
}
