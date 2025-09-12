import { Pipe, PipeTransform } from '@angular/core';

/*
 * Capitalize the first letter of the string
 */
@Pipe({
  name: 'capitalizeFirst'
})
export class CapitalizeFirstPipe implements PipeTransform {
  transform(value: string, applyLowerCaseBefore = false): string {
    if (!value) return '';
    let residue = '';
    if (value.length) {
      residue =  applyLowerCaseBefore ? value.toLowerCase().slice(1) : value.slice(1);
    }
    return value.charAt(0).toUpperCase() + residue;
  }
}