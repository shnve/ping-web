import { Component, ElementRef, HostBinding, HostListener, OnInit } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { SUBSCRIPTION_PRO_LOGIN, SUBSCRIPTION_PUBLIC_LOGIN } from '@app/components/pages/sign-in-up/sign-in-up.component';
import { Localize, OnChangeLang } from '@app/core/localize';
import { ServiceRole } from '@app/models/maritime-service.model';
import { SCOPE } from '@app/types/scope';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})

@Localize()
export class MenuComponent implements OnInit, OnChangeLang {

  readonly baseStaticPath = '/static';

  items: MenuItem[];
  private styleClassItem = 'with-submenu';
  @HostBinding('class.fixed') fixed = false;
  topHostOffsetAtStart: number;

  private enableSurveyModule: boolean;

  constructor(private readonly translate: TranslateService,
    private readonly authService: AuthService,
    private readonly elRef: ElementRef) {
    this.enableSurveyModule = environment.enableSurveyModule === 'true';
  }

  ngOnInit(): void {
    this.refreshMenu();
  }

  refreshMenu(): void {
    this.topHostOffsetAtStart = this.elRef.nativeElement.offsetTop;
    this.scrollHandlerFixMenu();
    this.refreshDynamicallyMenuItems();
    this.authService.getConnected$().subscribe(() => this.refreshDynamicallyMenuItems());
  }

  refreshDynamicallyMenuItems(): void {
    this.buildMenuItems();
  }

  buildMenuItems(): void {
    this.items = [
      {
        label: this.translate.instant('menu.home'),
        routerLink: '/',
        routerLinkActiveOptions: { exact: true }
      },
      {
        label: this.translate.instant('menu.avurnav-notice'),
        routerLink: '/avurnav-notice'
      },
      {
        label: this.translate.instant('menu.georegulation-visu'),
        routerLink: '/georegulation-visu'
      }
    ];

    if (!this.authService.isLoggedIn()) {
      this.items.push(
        {
          label: this.translate.instant('menu.subscriptions'),
          routerLink: '/sign-in-up-subscription'
        },
        {
          label: this.translate.instant('menu.contributions'),
          routerLink: '/sign-in-up'
        }
      );
    }

    this.addSignUpSubscriptionIfAllowed(this.items);

    if (this.authService.isLoggedIn()) {
      if (this.authService.hasRoleServiceUser() || this.authService.isPublicUser() || this.authService.isSurveyOwnerOnAnyServiceWithAnyRole()) {
        this.addContributionItems(this.items);
      }

      if (this.authService.hasRoleServiceUser()) {
        this.addFolderItems(this.items);
      }
    }

    this.addAnManagementItems(this.items);

    const shouldSeeGeoregulationsTables = this.authService.hasRightsOnAnyAuthorityService([ServiceRole.SERVICE_VISITOR, ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR]);
    const shouldSeeGeoregulationCreation = !this.authService.hasShomGeographicAreaType();
    if (shouldSeeGeoregulationsTables) {
      this.addGeoregulationManagementItems(this.items, shouldSeeGeoregulationCreation);
    }

    this.addAdministrationItems();
  }

  addSignUpSubscriptionIfAllowed(items: Array<object>): void {
    if (this.authService.isLoggedIn() && !this.authService.hasRoleFunctionalAdmin()) {
      let routerLink = SUBSCRIPTION_PUBLIC_LOGIN;
      if (this.authService.hasRoleServiceUser()) {
        routerLink = SUBSCRIPTION_PRO_LOGIN;
      }

      items.push({
        label: this.translate.instant('menu.subscriptions'),
        routerLink
      });
    }
  }

  addAnManagementItems(items: Array<object>): void {
    if (!this.authService.hasAccess(SCOPE.WARNING, 'creation')) {
      return;
    }

    const anMgmtItem = {
      styleClass: this.styleClassItem,
      label: this.translate.instant('menu.admin-warning.management'),
      items: [
        {
          label: this.translate.instant('menu.admin-warning.tables'),
          routerLink: '/administration/warnings/tables'
        },
        {
          label: this.translate.instant('menu.admin-warning.creation'),
          routerLink: '/administration/warnings/creation'
        }
      ]
    };
    items.push(anMgmtItem);
  }

  addGeoregulationManagementItems(items: Array<object>, shouldSeeGeoregulationCreation: boolean): void {
    const subItems = [{
      styleClass: this.styleClassItem,
      label: this.translate.instant('menu.georegulation.tables'),
      routerLink: '/georegulation/tables'
    }];

    if (shouldSeeGeoregulationCreation) {
      subItems.push({
        styleClass: this.styleClassItem,
        label: this.translate.instant('menu.georegulation.creation'),
        routerLink: '/georegulation/creation'
      });
    }
    const georegulationManagementItems = {
      styleClass: this.styleClassItem,
      label: this.translate.instant('menu.georegulation.manage'),
      items: subItems
    };
    items.push(georegulationManagementItems);
  }

  @HostListener('window:scroll')
  scrollHandlerFixMenu(): void {
    this.fixed = window.pageYOffset > this.topHostOffsetAtStart;
  }

  onChangeLang(): void {
    this.buildMenuItems();
  }

  private addContributionItems(items: Array<object>): void {
    const contributionItems = [];
    if (this.authService.hasRoleServiceUser() || this.authService.isPublicUser()) {
      this.addInfosourceItems(contributionItems);
    }

    if (this.enableSurveyModule && (this.authService.isSurveyOwnerOnAnyServiceWithAnyRole() || this.authService.isPublicUser())) {
      this.addSurveyItems(contributionItems);
    }

    const contributeItem = {
      label: this.translate.instant('menu.contributions'),
      styleClass: this.styleClassItem,
      items: contributionItems
    };
    items.push(contributeItem);
  }

  private addInfosourceItems(items: Array<any>): void {
    items.push(
      {
        label: this.translate.instant('menu.admin.contributions'),
        routerLink: '/infosource/tables'
      },
      {
        label: this.translate.instant('menu.admin.new-contribution'),
        routerLink: '/infosource/choice'
      }
    );
  }

  private addSurveyItems(items: Array<any>): void {
    items.push(
      {
        label: this.translate.instant('menu.survey.my-surveys'),
        routerLink: '/survey/tables'
      },
      {
        label: this.translate.instant('menu.survey.new-test'),
        routerLink: '/survey/notdeposit'
      },
      {
        label: this.translate.instant('menu.survey.new-deposit'),
        routerLink: '/survey/deposit'
      }
    );
  }

  private addFolderItems(items: MenuItem[]): void {

    const subItems: MenuItem[] = [
      {
        styleClass: this.styleClassItem,
        label: this.translate.instant('menu.admin.folders-followed'),
        routerLink: '/folder/followed'
      }
    ];

    const isFolderManager = this.authService.getAuthenticatedUser()?.serviceRoles
      .filter(role => role.folderManager === true)
      .map(serviceRole => serviceRole.serviceId)
      .filter(serviceId => this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], serviceId))
      .length > 0;

    if (isFolderManager) {
      subItems.push(
        {
          styleClass: this.styleClassItem,
          label: this.translate.instant('menu.admin.folders'),
          routerLink: '/folder/tables'
        },
        {
          styleClass: this.styleClassItem,
          label: this.translate.instant('menu.admin.new-folder'),
          routerLink: '/folder/creation'
        }
      );
    }

    items.push({
      styleClass: this.styleClassItem,
      label: this.translate.instant('menu.folders'),
      items: subItems
    });
  }

  private addAdministrationItems(): void {
    if (this.authService.isProUser() && this.authService.isLoggedIn()) {
      const items: MenuItem[] = [
        {
          styleClass: this.styleClassItem,
          label: this.translate.instant('menu.admin.area'),
          routerLink: '/administration/regions'
        },
        {
          styleClass: this.styleClassItem,
          label: this.translate.instant('menu.admin.maritime-entity'),
          routerLink: '/administration/entites-maritime'
        },
        {
          styleClass: this.styleClassItem,
          label: this.translate.instant('menu.admin.serie'),
          routerLink: '/administration/series'
        },
        {
          styleClass: this.styleClassItem,
          label: this.translate.instant('menu.admin.maritime-service'),
          routerLink: '/administration/service-maritime'
        },
        {
          styleClass: this.styleClassItem,
          label: this.translate.instant('menu.admin.sub-area'),
          routerLink: '/administration/sous-zones'
        }
      ];

      if (this.authService.isServiceAdminOnAnyService() || this.authService.hasRoleFunctionalAdmin()) {
        items.push(
          {
            styleClass: this.styleClassItem,
            label: this.translate.instant('menu.admin.pro-user'),
            routerLink: '/administration/utilisateur-pro'
          }
        )
      }

      if (this.authService.hasRoleFunctionalAdmin()) {
        items.push(
          {
            styleClass: this.styleClassItem,
            label: this.translate.instant('menu.admin.public-user'),
            routerLink: '/administration/utilisateur-public'
          },
          {
            styleClass: this.styleClassItem,
            label: this.translate.instant('menu.admin.static-page'),
            routerLink: '/administration/static-page'
          },
          {
            styleClass: this.styleClassItem,
            label: this.translate.instant('menu.admin.static-file'),
            routerLink: '/administration/static-file'
          },
          {
            styleClass: this.styleClassItem,
            label: this.translate.instant('menu.admin.static-logo'),
            routerLink: '/administration/static-logo'
          },
          {
            label: this.translate.instant('menu.admin.static-section'),
            routerLink: '/administration/static-section'
          }
        );
      }

      this.items.push({
        styleClass: this.styleClassItem,
        label: this.translate.instant('menu.admin.title'),
        items
      });
    }
  }
}
