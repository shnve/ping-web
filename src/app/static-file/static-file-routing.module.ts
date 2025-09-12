import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaticFileCreationComponent } from './components/static-file-creation/static-file-creation.component';
import { StaticFileDetailsComponent } from './components/static-file-details/static-file-details.component';
import { StaticFileListComponent } from './components/static-file-list/static-file-list.component';

const routes: Routes = [
  {
    path: '',
    component: StaticFileListComponent,
    data: {
      breadcrumb: undefined
    }
  },
  {
    path: 'creation',
    component: StaticFileCreationComponent,
    data: {
      breadcrumb: 'menu.admin.add'
    }
  },
  {
    path: ':id/details',
    component: StaticFileDetailsComponent,
    data: {
      breadcrumb: 'menu.admin.show'
    }
  },
  {
    path: ':id/edition',
    component: StaticFileDetailsComponent,
    data: {
      breadcrumb: 'menu.admin.edit'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaticFileRoutingModule { }
