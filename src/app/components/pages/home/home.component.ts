import { Component, OnDestroy, OnInit } from '@angular/core';
import { StaticPageApi } from '@app/api/static-page.api';
import { AuthService } from '@app/auth/auth.service';
import { SUBSCRIPTION_PRO_LOGIN, SUBSCRIPTION_PUBLIC_LOGIN } from '@app/components/pages/sign-in-up/sign-in-up.component';
import { Localize, OnChangeLang } from '@app/core/localize';
import { StaticPage } from '@app/models/static-page.model';
import { isLocalLangSelected } from '@app/shared/ui-utils';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

/** PISAC: acceso rápido de la portada. */
export interface HomeQuickLink {
  route: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  highlighted?: boolean;
}

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
  /** Accesos rápidos: mismos destinos que el menú según el usuario (anónimo, público o institucional). */
  quickLinks: HomeQuickLink[] = [];
  readonly dataServicesLink = ['/static', 'data-services'];

  private scavenger = new Scavenger(this);

  constructor(
    private readonly translate: TranslateService,
    private readonly staticPageApi: StaticPageApi,
    private readonly authService: AuthService) {
  }

  ngOnDestroy(): void { }

  ngOnInit(): void {
    this.staticPageApi.findOneByPath('accueil')
      .pipe(
        this.scavenger.collect(),
        tap(staticPage => this.staticPage = staticPage)
      )
      .subscribe(() => this.buildDisplayedInfo());

    this.buildQuickLinks();
    this.authService.getConnected$()
      .pipe(this.scavenger.collect())
      .subscribe(() => this.buildQuickLinks());
  }

  private buildDisplayedInfo(): void {
    if (!this.staticPage) {
      return;
    }
    const isLocalLang = isLocalLangSelected(this.translate);
    this.pageTitle = isLocalLang ? this.staticPage.title : this.staticPage.internationalTitle;
    this.pageContent = (isLocalLang ? this.staticPage.content : this.staticPage.internationalContent) ?? '';
  }

  /** Reglas de destino tomadas de MenuComponent (buildMenuItems, addSignUpSubscriptionIfAllowed, addContributionItems). */
  private buildQuickLinks(): void {
    const links: HomeQuickLink[] = [
      {
        route: '/avurnav-notice',
        icon: 'pi pi-exclamation-triangle',
        titleKey: 'menu.avurnav-notice',
        descriptionKey: 'home-page.hero.warnings-description',
        highlighted: true
      },
      {
        route: '/georegulation-visu',
        icon: 'pi pi-file',
        titleKey: 'menu.georegulation-visu',
        descriptionKey: 'home-page.hero.regulations-description'
      }
    ];

    const loggedIn = this.authService.isLoggedIn();
    const subscriptionsRoute = !loggedIn
      ? '/sign-in-up-subscription'
      : this.authService.hasRoleFunctionalAdmin()
        ? null
        : (this.authService.hasRoleServiceUser() ? SUBSCRIPTION_PRO_LOGIN : SUBSCRIPTION_PUBLIC_LOGIN);
    if (subscriptionsRoute) {
      links.push({
        route: subscriptionsRoute,
        icon: 'pi pi-bell',
        titleKey: 'menu.subscriptions',
        descriptionKey: 'home-page.hero.subscriptions-description'
      });
    }

    const contributionsRoute = !loggedIn
      ? '/sign-in-up'
      : (this.authService.hasRoleServiceUser() || this.authService.isPublicUser()) ? '/infosource/tables' : null;
    if (contributionsRoute) {
      links.push({
        route: contributionsRoute,
        icon: 'pi pi-send',
        titleKey: 'menu.contributions',
        descriptionKey: 'home-page.hero.contributions-description'
      });
    }

    this.quickLinks = links;
  }

  onChangeLang(): void {
    this.buildDisplayedInfo();
  }
}
