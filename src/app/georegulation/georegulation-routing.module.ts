import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeoregulationCreationComponent } from './components/georegulation-creation/georegulation-creation.component';
import { GeoregulationTablesComponent } from './components/georegulation-tables/georegulation-tables.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tables',
    pathMatch: 'full'
  },
  {
    path: 'tables',
    component: GeoregulationTablesComponent,
    data: {
      breadcrumb: 'menu.georegulation.tables'
    },
    title: 'menu.georegulation.manage'
  },
  {
    path: 'creation',
    component: GeoregulationCreationComponent,
    data: {
      breadcrumb: 'menu.georegulation.creation'
    },
    title: 'menu.georegulation.creation'
  },
  {
    path: 'edition/:id',
    component: GeoregulationCreationComponent,
    data: {
      breadcrumb: 'menu.georegulation.edition'
    },
    title: 'menu.georegulation.edition'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeoregulationRoutingModule { }
