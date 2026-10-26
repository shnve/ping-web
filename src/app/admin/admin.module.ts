import { AdminWarningModule } from '@admin-warning/admin-warning.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { SharedModule } from '@app/shared/shared.module';
import { SigModule } from '@sig/sig.module';
import { NgxSummernoteModule } from 'ngx-summernote';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AdminRoutingModule } from './admin-routing';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ServiceAssignForUserComponent } from './components/service-assign-for-user/service-assign-for-user.component';
import { ServiceUsersAssignComponent } from './components/service-users-assign/service-users-assign.component';
import { UpdateEmailComponent } from './components/update-email/update-email.component';
import { ViewGeometryComponent } from './components/view-geometry/view-geometry.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AreaCreationComponent } from './pages/area/area-creation/area-creation.component';
import { AreaFormComponent } from './pages/area/area-form/area-form.component';
import { AreaListComponent } from './pages/area/area-list/area-list.component';
import { EditAreaComponent } from './pages/area/edit-area/edit-area.component';
import { MaritimeEntityCreationComponent } from './pages/maritime-entity/maritime-entity-creation/maritime-entity-creation.component';
import { MaritimeEntityDetailsComponent } from './pages/maritime-entity/maritime-entity-details/maritime-entity-details.component';
import { MaritimeEntityFilterComponent } from './pages/maritime-entity/maritime-entity-filter/maritime-entity-filter.component';
import { MaritimeEntityFormComponent } from './pages/maritime-entity/maritime-entity-form/maritime-entity-form.component';
import { MaritimeEntityListComponent } from './pages/maritime-entity/maritime-entity-list/maritime-entity-list.component';
import { MaritimeServiceCreationComponent } from './pages/maritime-service/maritime-service-creation/maritime-service-creation.component';
import { MaritimeServiceDetailsComponent } from './pages/maritime-service/maritime-service-details/maritime-service-details.component';
import { MaritimeServiceFilterComponent } from './pages/maritime-service/maritime-service-filter/maritime-service-filter.component';
import { MaritimeServiceFormComponent } from './pages/maritime-service/maritime-service-form/maritime-service-form.component';
import { MaritimeServicesListComponent } from './pages/maritime-service/maritime-services-list/maritime-services-list.component';
import { ProUserCreationComponent } from './pages/pro-user/pro-user-creation/pro-user-creation.component';
import { ProUserDetailsComponent } from './pages/pro-user/pro-user-details/pro-user-details.component';
import { ProUserFormComponent } from './pages/pro-user/pro-user-form/pro-user-form.component';
import { ProUserListComponent } from './pages/pro-user/pro-user-list/pro-user-list.component';
import { EditPublicUserComponent } from './pages/public-user/edit-public-user/edit-public-user.component';
import { PublicUserListComponent } from './pages/public-user/public-user-list/public-user-list.component';
import { SerieCreationComponent } from './pages/serie/serie-creation/serie-creation.component';
import { SerieDetailsComponent } from './pages/serie/serie-details/serie-details.component';
import { SerieFormComponent } from './pages/serie/serie-form/serie-form.component';
import { SerieListComponent } from './pages/serie/serie-list/serie-list.component';
import { StaticPageCreationComponent } from './pages/static-page/static-page-creation/static-page-creation.component';
import { StaticPageDetailsComponent } from './pages/static-page/static-page-details/static-page-details.component';
import { StaticPageFormComponent } from './pages/static-page/static-page-form/static-page-form.component';
import { StaticPageListComponent } from './pages/static-page/static-page-list/static-page-list.component';
import { SubAreaCreationComponent } from './pages/sub-area/sub-area-creation/sub-area-creation.component';
import { SubAreaDetailsComponent } from './pages/sub-area/sub-area-details/sub-area-details.component';
import { SubAreaFormComponent } from './pages/sub-area/sub-area-form/sub-area-form.component';
import { SubAreaListComponent } from './pages/sub-area/sub-area-list/sub-area-list.component';
import { CartographyManagementComponent } from './pages/cartography/cartography-management.component';


@NgModule({
  declarations: [
    // Components
    UpdateEmailComponent,
    ResetPasswordComponent,
    ServiceAssignForUserComponent,
    ServiceUsersAssignComponent,
    // Pages
    AdminComponent,
    AreaFormComponent,
    AreaListComponent,
    AreaCreationComponent,
    EditAreaComponent,
    MaritimeEntityDetailsComponent,
    MaritimeEntityFormComponent,
    MaritimeEntityListComponent,
    MaritimeEntityCreationComponent,
    MaritimeEntityFilterComponent,
    MaritimeServiceCreationComponent,
    MaritimeServiceDetailsComponent,
    MaritimeServiceFormComponent,
    MaritimeServicesListComponent,
    ProUserDetailsComponent,
    ProUserFormComponent,
    ProUserListComponent,
    EditPublicUserComponent,
    PublicUserListComponent,
    SerieCreationComponent,
    SerieDetailsComponent,
    SerieFormComponent,
    SerieListComponent,
    SubAreaDetailsComponent,
    SubAreaFormComponent,
    SubAreaListComponent,
    SubAreaCreationComponent,
    ProUserCreationComponent,
    StaticPageDetailsComponent,
    StaticPageListComponent,
    StaticPageCreationComponent,
    StaticPageFormComponent,
    ViewGeometryComponent,
    MaritimeServiceFilterComponent,
    CartographyManagementComponent
  ],
  imports: [
    SharedModule,
    SharedPipeModule,
    CommonModule,
    AdminRoutingModule,
    ConfirmDialogModule,
    SigModule,
    AdminWarningModule,
    NgxSummernoteModule
  ],
  exports: [
    ViewGeometryComponent,
  ]
})
export class AdminModule { }
