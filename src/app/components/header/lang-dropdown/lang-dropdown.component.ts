import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from '@app/core/lang.service';
import { DOCUMENT } from '@angular/common';
import { Meta } from '@angular/platform-browser';

interface Language {
  code: string,
  label: string,
  image: string
}

@Component({
  selector: 'app-lang-dropdown',
  templateUrl: 'lang-dropdown.component.html',
  styleUrls: ['lang-dropdown.component.scss']
})

export class LangDropdownComponent implements OnInit {
  availableLanguages: Language[];
  selectedLanguageCode: string;
  // list of country flags, first corresponding to the selected language
  countryFlags: Language[];

  constructor(
    private readonly translateService: TranslateService,
    private readonly langService: LangService,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.availableLanguages = [
      {code: 'fr', label: 'lang.french', image: 'assets/images/flag-france.png'},
      {code: 'en', label: 'lang.english', image: 'assets/images/flag-uk.png'}
    ];
  }

  ngOnInit() {
    this.selectedLanguageCode = this.translateService.currentLang;
    this.updatePageTags(this.selectedLanguageCode);
    this.sortCountryFlags();
  }

  onChangeLanguage(langCode: string) {
    this.translateService.use(langCode);
    this.langService.setUserPreferredLang(langCode);
    this.updatePageTags(langCode);
    this.sortCountryFlags();
  }

  private updatePageTags(langCode: string): void {
    this.document.documentElement.lang = langCode;
    this.metaService.updateTag({
      name: 'description',
      content: this.translateService.instant('meta-description')
    });
  }

  private sortCountryFlags() {
    this.countryFlags = [
      this.availableLanguages.find(language => language.code === this.selectedLanguageCode),
      this.availableLanguages.find(language => language.code !== this.selectedLanguageCode)
    ];
  }

}
