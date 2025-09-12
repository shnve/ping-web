import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaticLogoCreationComponent } from './components/static-logo-creation/static-logo-creation.component';
import { StaticLogoDetailsComponent } from './components/static-logo-details/static-logo-details.component';
import { StaticLogoListComponent } from './components/static-logo-list/static-logo-list.component';

const routes: Routes = [
  {
    path: '',
    component: StaticLogoListComponent,
    data: {
      breadcrumb: undefined
    }
  },
  {
    path: 'creation',
    component: StaticLogoCreationComponent,
    data: {
      breadcrumb: 'menu.admin.add'
    }
  },
  {
    path: ':id/details',
    component: StaticLogoDetailsComponent,
    data: {
      breadcrumb: 'menu.admin.show'
    }
  },
  {
    path: ':id/edition',
    component: StaticLogoDetailsComponent,
    data: {
      breadcrumb: 'menu.admin.edit'
    }
  }
  
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaticLogoRoutingModule { }
