import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaticSectionDetailsComponent } from './components/static-section-details/static-section-details.component';
import { StaticSectionListComponent } from './components/static-section-list/static-section-list.component';

const routes: Routes = [
  {
    path: '',
    component: StaticSectionListComponent,
    data: {
      breadcrumb: undefined
    }
  },
  {
    path: ':id/details',
    component: StaticSectionDetailsComponent,
    data: {
      breadcrumb: 'menu.admin.show'
    }
  },
  {
    path: ':id/edition',
    component: StaticSectionDetailsComponent,
    data: {
      breadcrumb: 'menu.admin.edit'
    }
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaticSectionRoutingModule { }
