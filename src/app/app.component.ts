import {Component, OnInit} from '@angular/core';
import {PrimeNGConfig} from 'primeng/api';
import {TranslateService} from '@ngx-translate/core';
import {LangService} from './core/lang.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  isAppLoaded = false;

  constructor(
    private readonly translateService: TranslateService,
    private readonly langService: LangService,
    private readonly primengConfig: PrimeNGConfig
  ) {}

  ngOnInit() {
    this.initAppLanguage();
    this.primengConfig.ripple = true;
  }

  initAppLanguage() {
    const userLang = this.langService.getUserPreferredLang();
    if (userLang !== 'fr') {
      this.translateService.reloadLang('fr');
    }
    this.translateService.use(userLang).subscribe({
      error: err => console.error(`Problem with '${userLang}' language initialization : `, err),
      complete: () => this.isAppLoaded = true
    });
    this.langService.setUserPreferredLang(userLang);

    // Set primeng translations
    this.translateService.get('primeng')
      .subscribe(primeTranslations => this.primengConfig.setTranslation(primeTranslations));

    this.translateService.onLangChange.subscribe(({translations}) => {
      this.primengConfig.setTranslation(translations.primeng);
    });
  }
}
