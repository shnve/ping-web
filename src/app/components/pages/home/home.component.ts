import { Component, OnDestroy, OnInit } from '@angular/core';
import { StaticPageApi } from '@app/api/static-page.api';
import { Localize, OnChangeLang } from '@app/core/localize';
import { StaticPage } from '@app/models/static-page.model';
import { isLocalLangSelected } from '@app/shared/ui-utils';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  // PISAC: plantilla propia con el estilo del rediseño (antes compartía static-page-loader con las demás páginas)
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
@Localize()
export class HomeComponent implements OnInit, OnDestroy, OnChangeLang {
  message: string;
  submitting = false;
  errors: string;
  staticPage: StaticPage;
  pageTitle = '';
  pageContent = '';
  staticPageFindOneByPathSubscription: Subscription;

  private scavenger = new Scavenger(this);

  constructor(
    private readonly translate: TranslateService,
    private readonly staticPageApi: StaticPageApi) {
  }

  ngOnDestroy(): void { }

  ngOnInit(): void {
    this.staticPageApi.findOneByPath('accueil')
      .pipe(
        this.scavenger.collect(),
        tap(staticPage => this.staticPage = staticPage)
      )
      .subscribe(() => this.buildDisplayedInfo());
  }

  private buildDisplayedInfo(): void {
    const isLocalLang = isLocalLangSelected(this.translate);
    this.pageTitle = isLocalLang ? this.staticPage.title : this.staticPage.internationalTitle;
    this.pageContent = (isLocalLang ? this.staticPage.content : this.staticPage.internationalContent) ?? '';
  }

  onChangeLang(): void {
    this.buildDisplayedInfo();
  }
}

