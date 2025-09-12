import { FolderFollowedTablesComponent } from './components/folder-followed-tables/folder-followed-tables.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FolderCreationComponent } from './components/folder-creation/folder-creation.component';
import { FolderTablesComponent } from './components/folder-tables/folder-tables.component';


const routes: Routes = [
  {
    path: 'tables',
    component: FolderTablesComponent,
    data: {
      breadcrumb: 'menu.folder.table'
    },
    title: 'menu.admin.folders'
  },
  {
    path: 'followed',
    component: FolderFollowedTablesComponent,
    data: {
      breadcrumb: 'menu.folder.folders-followed'
    },
    title: 'menu.folder.folders-followed'
  },
  {
    path: 'creation',
    component: FolderCreationComponent,
    data: {
      breadcrumb: 'menu.folder.creation'
    },
    title: 'menu.admin.new-folder'
  },
  {
    path: 'modification/:id',
    component: FolderCreationComponent,
    data: {
      breadcrumb: 'menu.folder.modification'
    },
    title: 'menu.folder.modification'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FolderRoutingModule { }
