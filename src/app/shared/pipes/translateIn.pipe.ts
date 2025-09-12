import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

// from ngx-translate-in lib
@Pipe({
  name: 'translateIn',
})
export class TranslateInPipe implements PipeTransform {

  private langJsonRequest$: Map<string, Observable<any>> = null;

  constructor(private readonly translate: TranslateService, private http: HttpClient) {
    this.langJsonRequest$ = new Map();
  }

  /**
   * Load Json language file once per lang
   * @param lang the json file matching language
   * @private
   */
  private fetchJsonLanguageFile(lang: string): Observable<any> {
    if (!this.langJsonRequest$.get(lang)) {
      const observable = this.http.get(`/assets/i18n/${lang ?? 'en'}.json`).pipe(
        shareReplay(1)
      );
      this.langJsonRequest$.set(lang, observable);
    }
    return this.langJsonRequest$.get(lang);
  }

  transform(key: string, language: string, bilingual = false): Observable<string> {
    const translatein = this.translate.getLangs().includes(language) ? language : this.translate.currentLang;
    const translationLang = this.isFrLanguage(language) ? 'en' : 'fr';
    const lang = bilingual ? translationLang : translatein;

    return this.fetchJsonLanguageFile(lang).pipe(
      map(res => {
        let translation = res;
        key.split('.').forEach(k => {
          translation = translation[k];
        });
        return translation as string;
      })
    );
  }

  isFrLanguage(lang: string): boolean {
    return lang === 'fr';
  }

}

