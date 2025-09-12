import { Pipe, PipeTransform } from '@angular/core';
import { getServiceStatusIconSuffix } from '../infosource-utils';
import { InfosourceServiceStatus } from '../models/infosource.model';


@Pipe({
  name: 'infosourceServiceStatus'
})
export class InfosourceServiceStatusPipe implements PipeTransform {

  transform(infosourceServiceStatus: InfosourceServiceStatus): string {
    return getServiceStatusIconSuffix(infosourceServiceStatus);
  }
}
