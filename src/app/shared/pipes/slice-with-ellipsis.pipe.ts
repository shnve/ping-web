import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sliceWithEllipsis'
})
export class SliceWithEllipsisPipe implements PipeTransform {

  transform(text: string, sliceTo = 100): string {
    if (!text?.length) {
      return '';
    }

    if (text.length <= sliceTo) {
      return text
    }

    return `${text.slice(0, sliceTo)}...`;
  }

}
