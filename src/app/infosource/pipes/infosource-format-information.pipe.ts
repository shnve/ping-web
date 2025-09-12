import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'infosourceFormatInformation',
  pure: false
})
export class InfosourceFormatInformationPipe implements PipeTransform {

  transform(information: Map<string, string>): string {

    let value = this.format(information, 'fr');

    if (value.length > 0) {
      value += '<br/>';
    }

    value += this.format(information, 'en');
    return value;
  }

  private format(information: Map<string, string>, lang: string): string {
    if (!information[lang]) {
      return '';
    }
    return `<p><span class="bold-text">${lang.toUpperCase()} : </span><br/>${information[lang]}</p>`;
  }
}
