import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaticPageApi } from '@app/api/static-page.api';
import { Localize, OnChangeLang } from '@app/core/localize';
import { StaticPage } from '@app/models/static-page.model';
import { isLocalLangSelected } from '@app/shared/ui-utils';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-static-page-loader',
  templateUrl: './static-page-loader.component.html',
  styleUrls: ['./static-page-loader.component.scss']
})
@Localize()
export class StaticPageLoaderComponent implements OnInit, OnDestroy, OnChangeLang {

  staticPage: StaticPage;
  pageTitle = '';
  pageContent = '';
  staticPageFindOneByPathSubscription: Subscription;

  constructor(private readonly route: ActivatedRoute,
              private readonly translate: TranslateService,
              private readonly staticPageApi: StaticPageApi) {}

  ngOnInit(): void {
    this.staticPageFindOneByPathSubscription = this.route.paramMap.pipe(
        map(paramMap => paramMap.get('path')),
        filter(path => path !== null),
        switchMap(path => this.staticPageApi.findOneByPath(path)),
        tap(staticPage => this.staticPage = staticPage)
      )
      .subscribe(() => this.buildDisplayedInfo());
  }

  ngOnDestroy(): void {
    if (this.staticPageFindOneByPathSubscription) { this.staticPageFindOneByPathSubscription.unsubscribe(); }
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
