import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { LangService } from './core/lang.service';
import { environment } from '../environments/environment';

/** Layouts disponibles por ruta (route.data.layout). 'map' oculta pie y migas de pan y da todo el alto al mapa. */
export type PisacLayout = 'page' | 'map';
const LAYOUT_CLASS_PREFIX = 'pisac-layout-';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAppLoaded = false;
  private currentLayout: PisacLayout;

  constructor(
    private readonly translateService: TranslateService,
    private readonly langService: LangService,
    private readonly primengConfig: PrimeNGConfig,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly renderer: Renderer2,
    @Inject(DOCUMENT) private readonly document: Document
  ) { }

  ngOnInit() {
    this.initAppLanguage();
    this.primengConfig.ripple = true;
    this.initLayoutByRoute();
  }

  initAppLanguage() {
    this.translateService.addLangs(environment.availableLanguages);
    const userLang = this.langService.getUserPreferredLang();
    if (userLang !== 'es') {
      this.translateService.reloadLang('es');
    }
    this.translateService.use(userLang).subscribe({
      error: err => console.error(`Problem with '${userLang}' language initialization : `, err),
      complete: () => this.isAppLoaded = true
    });
    this.langService.setUserPreferredLang(userLang);

    // Set primeng translations
    this.translateService.get('primeng')
      .subscribe(primeTranslations => this.primengConfig.setTranslation(primeTranslations));

    this.translateService.onLangChange.subscribe(({ translations }) => {
      this.primengConfig.setTranslation(translations.primeng);
    });
  }

  /** Aplica en <body> la clase del layout definido en la ruta activa más profunda (por defecto 'page'). */
  private initLayoutByRoute(): void {
    this.applyLayout('page');
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        let route = this.activatedRoute;
        let layout: PisacLayout = 'page';
        while (route) {
          layout = route.snapshot?.data?.layout ?? layout;
          route = route.firstChild;
        }
        this.applyLayout(layout);
      });
  }

  private applyLayout(layout: PisacLayout): void {
    if (layout === this.currentLayout) {
      return;
    }
    const body = this.document.body;
    if (this.currentLayout) {
      this.renderer.removeClass(body, LAYOUT_CLASS_PREFIX + this.currentLayout);
    }
    this.renderer.addClass(body, LAYOUT_CLASS_PREFIX + layout);
    this.currentLayout = layout;
  }
}
