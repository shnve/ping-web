import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurveyTablesComponent } from "@app/survey/components/survey-tables/survey-tables.component";
import { ProUserGuard } from './auth/pro-user.guard';
import { PublicOrServiceUserGuard } from './auth/public-or-service-user-guard';
import { PublicUserGuard } from './auth/public-user.guard';
import { AccountCreationComponent } from './components/pages/account/creation/account-creation.component';
import { AccountEditComponent } from './components/pages/account/edit/account-edit.component';
import { AccountValidationComponent } from './components/pages/account/validation/account-validation.component';
import { AvurnavNoticeComponent } from './components/pages/avurnav-notice/avurnav-notice.component';
import { HomeComponent } from './components/pages/home/home.component';
import { NotFoundComponent } from './components/pages/not-found/not-found.component';
import { RedirectAfterAuthenticationComponent } from './components/pages/redirect-after-authentication/redirect-after-authentication.component';
import { SignInUpComponent } from './components/pages/sign-in-up/sign-in-up.component';
import { FolderAttachmentDownloadPageComponent } from './folder/components/folder-attachment-download-page/folder-attachment-download-page.component';
import { FolderFollowedTablesComponent } from './folder/components/folder-followed-tables/folder-followed-tables.component';
import { FolderTablesComponent } from './folder/components/folder-tables/folder-tables.component';
import { GeoregulationVisuComponent } from './georegulation/components/georegulation-visu/georegulation-visu.component';
import { InfosourceTablesComponent } from './infosource/components/infosource-tables/infosource-tables.component';
import { StaticPageLoaderComponent } from './shared/components/static-page-loader/static-page-loader.component';
import { StaticFileLoaderComponent } from './static-file/components/static-file-loader/static-file-loader.component';
import { SubscriptionDeleteFromLinkComponent } from './subscription/components/subscription-delete-from-link/subscription-delete-from-link.component';
import { SubscriptionChoiceComponent } from '@app/subscription/components/subscription-choice/subscription-choice.component';

const routes: Routes = [
  {
    path: 'avurnav-notice/:warningId',
    component: AvurnavNoticeComponent,
    data: {
      breadcrumb: 'menu.avurnav-notice'
    },
    title: 'menu.avurnav-notice'
  },
  {
    path: 'avurnav-notice',
    component: AvurnavNoticeComponent,
    data: {
      breadcrumb: 'menu.avurnav-notice',
    },
    title: 'menu.avurnav-notice'
  },
  {
    path: 'georegulation-visu/:georegulationId',
    component: GeoregulationVisuComponent,
    data: {
      breadcrumb: 'menu.georegulation-visu'
    },
    title: 'menu.georegulation-visu'
  },
  {
    path: 'georegulation-visu',
    component: GeoregulationVisuComponent,
    data: {
      breadcrumb: 'menu.georegulation-visu'
    },
    title: 'menu.georegulation-visu'
  },
  {
    path: 'sign-in-up',
    component: SignInUpComponent,
    data: {
      breadcrumb: 'menu.sign-in-up',
      section: 'contribution'
    },
    title: 'menu.sign-in-up'
  },
  {
    path: 'sign-in-up-subscription',
    component: SignInUpComponent,
    data: {
      breadcrumb: 'menu.sign-in-up-subscription',
      section: 'subscription'
    },
    title: 'menu.sign-in-up-subscription'
  },
  {
    path: 'account-creation',
    component: AccountCreationComponent,
    data: {
      breadcrumb: 'menu.account-creation'
    },
    title: 'menu.account-creation'
  },
  {
    path: 'account-edition/:userId',
    component: AccountEditComponent,
    canActivate: [PublicUserGuard],
    data: {
      breadcrumb: 'menu.account-edition'
    },
    title: 'menu.account-edition'
  },
  {
    path: 'account-validation',
    component: AccountValidationComponent,
    canActivate: [PublicUserGuard],
  },
  {
    path: 'administration',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [ProUserGuard],
    data: {
      breadcrumb: 'menu.admin.title'
    },
    title: 'menu.admin.title'
  },
  {
    path: 'infosource',
    loadChildren: () => import('./infosource/infosource.module').then(m => m.InfosourceModule),
    canActivate: [PublicOrServiceUserGuard],
    canActivateChild: [PublicOrServiceUserGuard],
    data: {
      breadcrumb: 'menu.infosource.title'
    },
    title: 'menu.infosource.title'
  },
  {
    path: 'subscription',
    component: SubscriptionChoiceComponent,
    canActivate: [PublicOrServiceUserGuard],
    canActivateChild: [PublicOrServiceUserGuard],
    data: {
      breadcrumb: 'menu.subscription.title'
    },
    title: 'menu.subscription.title'
  },
  {
    path: 'subscription/warning',
    loadChildren: () => import('./subscription/subscription.module').then(m => m.SubscriptionModule),
    canActivate: [PublicOrServiceUserGuard],
    canActivateChild: [PublicOrServiceUserGuard],
    data: {
      breadcrumb: 'menu.subscription.warning'
    },
    title: 'menu.subscription.warning'
  },
  {
    path: 'subscription/georegulation',
    loadChildren: () => import('./subscription/subscription.module').then(m => m.SubscriptionModule),
    canActivate: [ProUserGuard],
    canActivateChild: [ProUserGuard],
    data: {
      breadcrumb: 'menu.subscription.georegulation'
    },
    title: 'menu.subscription.georegulation'
  },
  {
    path: 'subscription/delete/:subscriptionId',
    component: SubscriptionDeleteFromLinkComponent,
    canActivate: [PublicOrServiceUserGuard],
    data: {
      breadcrumb: 'menu.subscription.delete'
    },
    title: 'menu.subscription.delete'
  },
  {
    path: 'infosource/tables/:infosourceId',
    component: InfosourceTablesComponent,
    canActivate: [ProUserGuard],
    data: {
      breadcrumb: 'menu.infosource.title'
    },
    title: 'menu.infosource.title'
  },
  {
    path: 'folder',
    loadChildren: () => import('./folder/folder.module').then(m => m.FolderModule),
    canActivate: [PublicOrServiceUserGuard],
    canActivateChild: [PublicOrServiceUserGuard],
    data: {
      breadcrumb: 'menu.folder.title'
    },
    title: 'menu.folder.title'
  },
  {
    path: 'folder/tables/:folderId',
    component: FolderTablesComponent,
    canActivate: [ProUserGuard],
    data: {
      breadcrumb: 'menu.folder.title'
    },
    title: 'menu.folder.title'
  },
  {
    path: 'folder/followed/:folderId',
    component: FolderFollowedTablesComponent,
    canActivate: [ProUserGuard],
    data: {
      breadcrumb: 'menu.admin.folders-followed'
    },
    title: 'menu.admin.folders-followed'
  },
  {
    path: 'folder/attachments/:attachmentId',
    component: FolderAttachmentDownloadPageComponent,
    canActivate: [ProUserGuard],
    data: {
      breadcrumb: 'menu.folder.attachment-download'
    },
    title: 'menu.folder.attachment-download'
  },
  {
    path: 'survey/tables/:surveyId',
    component: SurveyTablesComponent,
    canActivate: [PublicOrServiceUserGuard],
    canActivateChild: [PublicOrServiceUserGuard]
  },
  {
    path: 'survey',
    loadChildren: () => import('./survey/survey.module').then(m => m.SurveyModule),
    canActivate: [PublicOrServiceUserGuard],
    canActivateChild: [PublicOrServiceUserGuard],
    data: {
      breadcrumb: 'menu.infosource.title'
    }
  },
  {
    path: 'georegulation',
    loadChildren: () => import('./georegulation/georegulation.module').then(m => m.GeoregulationModule),
    canActivate: [ProUserGuard],
    data: {
      breadcrumb: 'menu.georegulation.manage'
    }
  },
  {
    path: 'redirect',
    component: RedirectAfterAuthenticationComponent,
    data: {
      breadcrumb: 'menu.redirect'
    },
    title: 'menu.redirect'
  },
  {
    path: 'static/accueil',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'static/:path',
    component: StaticPageLoaderComponent
  },
  {
    path: 'static-file/:path',
    component: StaticFileLoaderComponent
  },
  { path: '', component: HomeComponent },
  { path: '**', component: NotFoundComponent, title: 'pages.not-found.title' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
