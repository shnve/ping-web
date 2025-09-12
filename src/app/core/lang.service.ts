import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})

export class LangService {
  constructor(
    private readonly translateService: TranslateService
  ) {}

  /**
   * Get user preferred language
   * Get browser language if preferred language is not defined or invalid
   */
  getUserPreferredLang(): string {
    const availableLangs = environment.availableLanguages;
    const preferredLang = LangService.convertBCP47LangToISO639(localStorage.getItem('lang'));
    if(availableLangs.includes(preferredLang)) {
      return preferredLang;
    }
    const browserLang = LangService.convertBCP47LangToISO639(navigator.language);
    if(availableLangs.includes(browserLang)) {
      return browserLang;
    }
    return this.translateService.getDefaultLang();
  }

  /**
   * Update local storage lang value
   * @param {string} lang
   */
  setUserPreferredLang(lang: string) {
    const availableLangs = environment.availableLanguages;
    localStorage.setItem('lang',
      availableLangs.includes(lang)
        ? lang : this.translateService.currentLang
    );
  }

  /**
   * Example: 'fr-FR' => 'fr'
   * @param {string} langBCP47
   */
  static convertBCP47LangToISO639(langBCP47: string) {
    return langBCP47 && langBCP47.substr(0, 2) || '';
  }
}
