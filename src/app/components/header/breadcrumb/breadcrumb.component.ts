import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { StaticPageApi } from '@app/api/static-page.api';
import { isLocalLangSelected } from '@app/shared/ui-utils';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Localize } from '../../../core/localize';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
@Localize()
export class BreadcrumbComponent implements OnInit, OnDestroy {

  private readonly scavenger = new Scavenger(this);

  items: MenuItem[];
  home: MenuItem;
  private routerSubscription: Subscription;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly staticPageApi: StaticPageApi
  ) { }

  ngOnInit(): void {
    this.createBreadcrumb();
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(this.createBreadcrumb.bind(this));
  }

  private createBreadcrumb() {
    this.home = { label: this.translate.instant('menu.home'), routerLink: '/' };
    this.items = this.createBreadcrumbItems(this.activatedRoute.root);
  }

  /**
   * Recursive function, create items ordered hierarchicaly from activatedRoute tree
   * @param {ActivatedRoute} route
   * @param {string} url
   * @param {MenuItem[]} breadcrumbs
   * @returns {MenuItem[]}
   */
  private createBreadcrumbItems(route: ActivatedRoute, url = '/', breadcrumbs?: MenuItem[]): MenuItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const snapshotUrl = child.snapshot.url;
      const routeURL: string = snapshotUrl.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `${routeURL}/`;
      }

      let labelTranslateKey = child.snapshot.data.breadcrumb;
      if (labelTranslateKey !== undefined) {
        if (!breadcrumbs) {
          breadcrumbs = [];
        }
        breadcrumbs.push({
          label: this.translate.instant(labelTranslateKey),
          routerLink: url
        });
      } else if (routeURL && routeURL.startsWith('static/') && snapshotUrl.length === 2) {  // handle static pages
        const staticPagePathFromUrl = '' + snapshotUrl[snapshotUrl.length - 1];
        labelTranslateKey = `menu.${staticPagePathFromUrl}`;
        if (!breadcrumbs) {
          breadcrumbs = [];
        }

        let label = this.translate.instant(labelTranslateKey);

        // if i18n not translated then it should be created by user
        if (label === labelTranslateKey) {
          this.staticPageApi.findOneByPath(staticPagePathFromUrl)
            .pipe(this.scavenger.collect())
            .subscribe(staticPage => {
              const isLocalLang = isLocalLangSelected(this.translate);
              label = isLocalLang ? staticPage.title : staticPage.internationalTitle;
              this.items = [{
                label,
                routerLink: url
              }];
            });
        }

        breadcrumbs.push({
          label,
          routerLink: url
        });
      }

      return this.createBreadcrumbItems(child, url, breadcrumbs);
    }
    return [];
  }

  onChangeLang() {
    this.createBreadcrumb();
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }
}
