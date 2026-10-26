import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FunctionalAdminOrNoticeProducerGuard } from '@app/auth/functional-admin-or-notice-producer.guard';
import { FunctionalAdminGuard } from '@app/auth/functional-admin.guard';
import { SCOPE } from '@app/types/scope';
import { AdminComponent } from './pages/admin/admin.component';
import { AreaCreationComponent } from './pages/area/area-creation/area-creation.component';
import { AreaListComponent } from './pages/area/area-list/area-list.component';
import { EditAreaComponent } from './pages/area/edit-area/edit-area.component';
import { MaritimeEntityCreationComponent } from './pages/maritime-entity/maritime-entity-creation/maritime-entity-creation.component';
import { MaritimeEntityDetailsComponent } from './pages/maritime-entity/maritime-entity-details/maritime-entity-details.component';
import { MaritimeEntityListComponent } from './pages/maritime-entity/maritime-entity-list/maritime-entity-list.component';
import { MaritimeServiceCreationComponent } from './pages/maritime-service/maritime-service-creation/maritime-service-creation.component';
import { MaritimeServiceDetailsComponent } from './pages/maritime-service/maritime-service-details/maritime-service-details.component';
import { MaritimeServicesListComponent } from './pages/maritime-service/maritime-services-list/maritime-services-list.component';
import { ProUserCreationComponent } from './pages/pro-user/pro-user-creation/pro-user-creation.component';
import { ProUserDetailsComponent } from './pages/pro-user/pro-user-details/pro-user-details.component';
import { ProUserListComponent } from './pages/pro-user/pro-user-list/pro-user-list.component';
import { EditPublicUserComponent } from './pages/public-user/edit-public-user/edit-public-user.component';
import { PublicUserListComponent } from './pages/public-user/public-user-list/public-user-list.component';
import { SerieCreationComponent } from './pages/serie/serie-creation/serie-creation.component';
import { SerieDetailsComponent } from './pages/serie/serie-details/serie-details.component';
import { SerieListComponent } from './pages/serie/serie-list/serie-list.component';
import { StaticPageCreationComponent } from './pages/static-page/static-page-creation/static-page-creation.component';
import { StaticPageDetailsComponent } from './pages/static-page/static-page-details/static-page-details.component';
import { StaticPageListComponent } from './pages/static-page/static-page-list/static-page-list.component';
import { SubAreaCreationComponent } from './pages/sub-area/sub-area-creation/sub-area-creation.component';
import { SubAreaDetailsComponent } from './pages/sub-area/sub-area-details/sub-area-details.component';
import { SubAreaListComponent } from './pages/sub-area/sub-area-list/sub-area-list.component';
import { CartographyManagementComponent } from './pages/cartography/cartography-management.component';

const routes = [
  // Area
  {
    path: 'regions',
    component: AdminComponent,
    data: {
      breadcrumb: 'menu.admin.area'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: undefined
        },
        component: AreaListComponent
      },
      {
        path: 'ajouter',
        component: AreaCreationComponent,
        canActivate: [FunctionalAdminGuard],
        data: {
          breadcrumb: 'menu.admin.add'
        }
      },
      {
        path: ':areaId/edition',
        component: EditAreaComponent,
        canActivate: [FunctionalAdminGuard],
        data: {
          breadcrumb: 'menu.admin.edit'
        }
      },
      {
        path: ':areaId/details',
        component: EditAreaComponent,
        data: {
          breadcrumb: 'menu.admin.show'
        }
      }
    ]
  },

  // Entité maritime
  {
    path: 'entites-maritime',
    component: AdminComponent,
    data: {
      breadcrumb: 'menu.admin.maritime-entity'
    },
    children: [
      {
        path: '',
        component: MaritimeEntityListComponent,
        data: {
          breadcrumb: undefined
        }
      },
      {
        path: ':id/details',
        component: MaritimeEntityDetailsComponent,
        data: {
          breadcrumb: 'menu.admin.show'
        }
      },
      {
        path: ':id/edition',
        component: MaritimeEntityDetailsComponent,
        canActivate: [FunctionalAdminGuard],
        data: {
          breadcrumb: 'menu.admin.edit'
        }
      },
      {
        path: 'ajouter',
        component: MaritimeEntityCreationComponent,
        canActivate: [FunctionalAdminGuard],
        data: {
          breadcrumb: 'menu.admin.add'
        }
      }
    ]
  },

  // Series
  {
    path: 'series',
    component: AdminComponent,
    data: {
      breadcrumb: 'menu.admin.serie'
    },
    children: [
      {
        path: '',
        component: SerieListComponent,
        data: {
          breadcrumb: undefined
        }
      },
      {
        path: 'ajouter',
        component: SerieCreationComponent,
        canActivate: [FunctionalAdminGuard],
        data: {
          breadcrumb: 'menu.admin.add'
        }
      },
      {
        path: ':id/edition',
        component: SerieDetailsComponent,
        canActivate: [FunctionalAdminGuard],
        data: {
          breadcrumb: 'menu.admin.edit'
        }
      },
      {
        path: ':id/details',
        component: SerieDetailsComponent,
        data: {
          breadcrumb: 'menu.admin.show'
        }
      }
    ]
  },

  // Service maritime
  {
    path: 'service-maritime',
    component: AdminComponent,
    data: {
      breadcrumb: 'menu.admin.maritime-service'
    },
    children: [
      {
        path: '',
        component: MaritimeServicesListComponent,
        data: {
          breadcrumb: undefined
        }
      },
      {
        path: ':id/details',
        component: MaritimeServiceDetailsComponent,
        data: {
          breadcrumb: 'menu.admin.show'
        }
      },
      {
        path: ':id/edition',
        component: MaritimeServiceDetailsComponent,
        data: {
          breadcrumb: 'menu.admin.edit'
        }
      },
      {
        path: 'ajouter',
        component: MaritimeServiceCreationComponent,
        data: {
          breadcrumb: 'menu.admin.add'
        }
      }
    ]
  },
  // Sous zone
  {
    path: 'sous-zones',
    component: AdminComponent,
    data: {
      breadcrumb: 'menu.admin.sub-area'
    },
    children: [
      {
        path: '',
        component: SubAreaListComponent,
        data: {
          breadcrumb: undefined
        }
      },
      {
        path: 'ajouter',
        component: SubAreaCreationComponent,
        data: {
          breadcrumb: 'menu.admin.add'
        },
        canActivate: [FunctionalAdminOrNoticeProducerGuard]
      },
      {
        path: ':id/edition',
        component: SubAreaDetailsComponent,
        data: {
          breadcrumb: 'menu.admin.edit'
        },
        canActivate: [FunctionalAdminOrNoticeProducerGuard]
      },
      {
        path: ':id/details',
        component: SubAreaDetailsComponent,
        data: {
          breadcrumb: 'menu.admin.show'
        }
      }
    ]
  },
  // Public User
  {
    path: 'utilisateur-public',
    component: AdminComponent,
    data: {
      breadcrumb: 'menu.admin.public-user'
    },
    children: [
      {
        path: '',
        component: PublicUserListComponent,
        data: {
          breadcrumb: undefined
        },
        canActivate: [FunctionalAdminGuard]
      },
      {
        path: ':id/details',
        component: EditPublicUserComponent,
        data: {
          breadcrumb: 'menu.admin.show'
        },
        canActivate: [FunctionalAdminGuard]
      },
      {
        path: ':id/edition',
        component: EditPublicUserComponent,
        data: {
          breadcrumb: 'menu.admin.edit'
        },
        canActivate: [FunctionalAdminGuard]
      }
    ]
  },
  // ProUser
  {
    path: 'utilisateur-pro',
    component: AdminComponent,
    data: {
      breadcrumb: 'menu.admin.pro-user'
    },
    children: [
      {
        path: '',
        component: ProUserListComponent,
        data: {
          breadcrumb: undefined
        }
      },
      {
        path: 'ajouter',
        component: ProUserCreationComponent,
        data: {
          breadcrumb: 'menu.admin.add'
        }
      },
      {
        path: ':id/details',
        component: ProUserDetailsComponent,
        data: {
          breadcrumb: 'menu.admin.show'
        }
      },
      {
        path: ':id/edition',
        component: ProUserDetailsComponent,
        data: {
          breadcrumb: 'menu.admin.edit'
        }
      }
    ]
  },
  // static pages
  {
    path: 'static-page',
    component: AdminComponent,
    data: {
      breadcrumb: 'menu.admin.static-page'
    },
    children: [
      {
        path: '',
        component: StaticPageListComponent,
        data: {
          breadcrumb: undefined
        }
      },
      {
        path: 'ajouter',
        component: StaticPageCreationComponent,
        data: {
          breadcrumb: 'menu.admin.add'
        }
      },
      {
        path: ':id/details',
        component: StaticPageDetailsComponent,
        data: {
          breadcrumb: 'menu.admin.show'
        }
      },
      {
        path: ':id/edition',
        component: StaticPageDetailsComponent,
        data: {
          breadcrumb: 'menu.admin.edit'
        }
      }
    ]
  },
  {
    path: 'static-file', loadChildren: () => import('../static-file/static-file.module').then(m => m.StaticFileModule),
    data: {
      breadcrumb: 'menu.admin.static-file'
    }
  },
  {
    path: 'static-section', loadChildren: () => import('../static-section/static-section.module').then(m => m.StaticSectionModule),
    data: {
      breadcrumb: 'menu.admin.static-section'
    }
  },
  {
    path: 'warnings', loadChildren: () => import('./admin-warning/admin-warning.module').then(m => m.AdminWarningModule),
    data: {
      breadcrumb: 'menu.admin-warning.management',
      scope: SCOPE.WARNING
    },
  },
  {
    path: 'static-logo', loadChildren: () => import('../static-logo/static-logo.module').then(m => m.StaticLogoModule),
    data: {
      breadcrumb: 'menu.admin.static-logo'
    }
  },
  {
    path: 'cartographie',
    component: AdminComponent,
    canActivate: [FunctionalAdminGuard],
    data: {
      breadcrumb: 'menu.admin.cartography'
    },
    children: [
      {
        path: '',
        component: CartographyManagementComponent,
        data: {
          breadcrumb: undefined
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
