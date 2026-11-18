import { Component, ElementRef, HostBinding, HostListener, OnInit } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { SUBSCRIPTION_PRO_LOGIN, SUBSCRIPTION_PUBLIC_LOGIN } from '@app/components/pages/sign-in-up/sign-in-up.component';
import { Localize, OnChangeLang } from '@app/core/localize';
import { ServiceRole } from '@app/models/maritime-service.model';
import { SCOPE } from '@app/types/scope';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';

/**
 * PISAC (18-nov-2026, opción B2 del rediseño del menú):
 * - íconos en todas las entradas;
 * - separador entre la consulta (lo que ve el público) y el trabajo (clase `pisac-menu-work-start`);
 * - «Gestionar AN» y «Gestionar GR» pasan a un solo desplegable «Gestión» con dos grupos;
 * - «Administración» a la derecha (clase `pisac-menu-end`), con el submenú agrupado y nombres sin «Lista de…».
 * Los destinos y los permisos de cada entrada no cambian.
 */
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
  private readonly workStartClass = 'pisac-menu-work-start';
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
    // ---- Consulta ----
    this.items = [
      {
        label: this.translate.instant('menu.home'),
        icon: 'pi pi-home',
        routerLink: '/',
        routerLinkActiveOptions: { exact: true }
      },
      {
        label: this.translate.instant('menu.avurnav-notice'),
        icon: 'pi pi-map',
        routerLink: '/avurnav-notice'
      },
      {
        label: this.translate.instant('menu.georegulation-visu'),
        icon: 'pi pi-book',
        routerLink: '/georegulation-visu'
      }
    ];
    const consultationCount = this.items.length;

    // ---- Trabajo ----
    if (!this.authService.isLoggedIn()) {
      this.items.push(
        {
          label: this.translate.instant('menu.subscriptions'),
          icon: 'pi pi-bell',
          routerLink: '/sign-in-up-subscription'
        },
        {
          label: this.translate.instant('menu.nav.contributions'),
          icon: 'pi pi-send',
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

    this.addManagementItems(this.items);

    // Separador visual entre consulta y trabajo
    const firstWorkItem = this.items[consultationCount];
    if (firstWorkItem) {
      firstWorkItem.styleClass = [firstWorkItem.styleClass, this.workStartClass].filter(Boolean).join(' ');
    }

    this.addAdministrationItems();
  }

  addSignUpSubscriptionIfAllowed(items: MenuItem[]): void {
    if (this.authService.isLoggedIn() && !this.authService.hasRoleFunctionalAdmin()) {
      let routerLink = SUBSCRIPTION_PUBLIC_LOGIN;
      if (this.authService.hasRoleServiceUser()) {
        routerLink = SUBSCRIPTION_PRO_LOGIN;
      }

      items.push({
        label: this.translate.instant('menu.subscriptions'),
        icon: 'pi pi-bell',
        routerLink
      });
    }
  }

  /**
   * «Gestión»: reúne la gestión de avisos (antes «Gestionar AN») y la de georregulaciones (antes «Gestionar GR»),
   * con los mismos permisos que antes para cada grupo.
   */
  addManagementItems(items: MenuItem[]): void {
    const subItems: MenuItem[] = [];

    if (this.authService.hasAccess(SCOPE.WARNING, 'creation')) {
      subItems.push(
        this.groupHeader('menu.nav.group-warnings', 'pi pi-megaphone'),
        {
          label: this.translate.instant('menu.nav.warning-tables'),
          icon: 'pi pi-list',
          routerLink: '/administration/warnings/tables'
        },
        {
          label: this.translate.instant('menu.nav.warning-creation'),
          icon: 'pi pi-plus',
          routerLink: '/administration/warnings/creation'
        }
      );
    }

    const shouldSeeGeoregulationsTables = this.authService.hasRightsOnAnyAuthorityService([ServiceRole.SERVICE_VISITOR, ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR]);
    const shouldSeeGeoregulationCreation = !this.authService.hasShomGeographicAreaType();
    if (shouldSeeGeoregulationsTables) {
      if (subItems.length) {
        subItems.push({ separator: true });
      }
      subItems.push(
        this.groupHeader('menu.nav.group-georegulations', 'pi pi-book'),
        {
          label: this.translate.instant('menu.nav.georegulation-tables'),
          icon: 'pi pi-list',
          routerLink: '/georegulation/tables'
        }
      );
      if (shouldSeeGeoregulationCreation) {
        subItems.push({
          label: this.translate.instant('menu.nav.georegulation-creation'),
          icon: 'pi pi-plus',
          routerLink: '/georegulation/creation'
        });
      }
    }

    if (subItems.length) {
      items.push({
        styleClass: this.styleClassItem,
        label: this.translate.instant('menu.nav.management'),
        icon: 'pi pi-pencil',
        items: subItems
      });
    }
  }

  @HostListener('window:scroll')
  scrollHandlerFixMenu(): void {
    this.fixed = window.pageYOffset > this.topHostOffsetAtStart;
  }

  onChangeLang(): void {
    this.buildMenuItems();
  }

  /** Encabezado de grupo dentro de un submenú (no navegable). */
  private groupHeader(labelKey: string, icon: string): MenuItem {
    return {
      label: this.translate.instant(labelKey),
      icon,
      disabled: true,
      styleClass: 'pisac-menu-group'
    };
  }

  private addContributionItems(items: MenuItem[]): void {
    const contributionItems: MenuItem[] = [];
    if (this.authService.hasRoleServiceUser() || this.authService.isPublicUser()) {
      this.addInfosourceItems(contributionItems);
    }

    if (this.enableSurveyModule && (this.authService.isSurveyOwnerOnAnyServiceWithAnyRole() || this.authService.isPublicUser())) {
      this.addSurveyItems(contributionItems);
    }

    items.push({
      label: this.translate.instant('menu.nav.contributions'),
      icon: 'pi pi-send',
      styleClass: this.styleClassItem,
      items: contributionItems
    });
  }

  private addInfosourceItems(items: MenuItem[]): void {
    items.push(
      {
        label: this.translate.instant('menu.nav.my-contributions'),
        icon: 'pi pi-list',
        routerLink: '/infosource/tables'
      },
      {
        label: this.translate.instant('menu.nav.new-contribution'),
        icon: 'pi pi-plus',
        routerLink: '/infosource/choice'
      }
    );
  }

  private addSurveyItems(items: MenuItem[]): void {
    /*
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
    */
  }

  private addFolderItems(items: MenuItem[]): void {

    const subItems: MenuItem[] = [
      {
        styleClass: this.styleClassItem,
        label: this.translate.instant('menu.admin.folders-followed'),
        icon: 'pi pi-eye',
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
          icon: 'pi pi-list',
          routerLink: '/folder/tables'
        },
        {
          styleClass: this.styleClassItem,
          label: this.translate.instant('menu.admin.new-folder'),
          icon: 'pi pi-plus',
          routerLink: '/folder/creation'
        }
      );
    }

    items.push({
      styleClass: this.styleClassItem,
      label: this.translate.instant('menu.folders'),
      icon: 'pi pi-folder',
      items: subItems
    });
  }

  private addAdministrationItems(): void {
    if (!(this.authService.isProUser() && this.authService.isLoggedIn())) {
      return;
    }

    const item = (labelKey: string, icon: string, routerLink: string): MenuItem => ({
      styleClass: this.styleClassItem,
      label: this.translate.instant(labelKey),
      icon,
      routerLink
    });

    // Organización
    const items: MenuItem[] = [
      this.groupHeader('menu.nav.group-organization', 'pi pi-sitemap'),
      item('menu.nav.maritime-services', 'pi pi-building', '/administration/service-maritime'),
      item('menu.nav.maritime-entities', 'pi pi-map-marker', '/administration/entites-maritime'),
      item('menu.nav.areas', 'pi pi-th-large', '/administration/regions'),
      item('menu.nav.sub-areas', 'pi pi-clone', '/administration/sous-zones'),
      item('menu.nav.series', 'pi pi-tags', '/administration/series')
    ];

    // Usuarios
    const canSeeProUsers = this.authService.isServiceAdminOnAnyService() || this.authService.hasRoleFunctionalAdmin();
    const isFunctionalAdmin = this.authService.hasRoleFunctionalAdmin();
    if (canSeeProUsers) {
      items.push(
        { separator: true },
        this.groupHeader('menu.nav.group-users', 'pi pi-users'),
        item('menu.nav.pro-users', 'pi pi-id-card', '/administration/utilisateur-pro')
      );
      if (isFunctionalAdmin) {
        items.push(item('menu.nav.public-users', 'pi pi-user', '/administration/utilisateur-public'));
      }
    }

    // Portal y cartografía
    if (isFunctionalAdmin) {
      items.push(
        { separator: true },
        this.groupHeader('menu.nav.group-portal', 'pi pi-globe'),
        item('menu.nav.static-pages', 'pi pi-file', '/administration/static-page'),
        item('menu.nav.static-files', 'pi pi-paperclip', '/administration/static-file'),
        item('menu.nav.static-logos', 'pi pi-image', '/administration/static-logo'),
        item('menu.nav.static-sections', 'pi pi-clone', '/administration/static-section'),
        item('menu.nav.cartography', 'pi pi-map', '/administration/cartographie')
      );
    }

    this.items.push({
      styleClass: `${this.styleClassItem} pisac-menu-end`,
      label: this.translate.instant('menu.admin.title'),
      icon: 'pi pi-cog',
      items
    });
  }
}
