import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicsReferencesStepComponent } from './components/steps/publics-references-step/publics-references-step.component';

import { AuthGuard } from '@app/auth/auth.guard';
import { SCOPE } from '@app/types/scope';
import { DiffusionStepComponent } from './components/steps/diffusion-step/diffusion-step.component';
import { FinalizationStepComponent } from './components/steps/finalization-step/finalization-step.component';
import { LinksAndAttachmentsStepComponent } from './components/steps/links-and-attachments-step/links-and-attachments-step.component';
import { PrerequisitesStepComponent } from './components/steps/prerequisites-step/prerequisites-step.component';
import { CreationPageComponent } from './pages/creation-page/creation-page.component';
import { TablesPageComponent } from './pages/tables-page/tables-page.component';

const warningCreationSteps: Routes = [
  { path: '', redirectTo: 'prerequisites', pathMatch: 'full' },
  {
    path: 'prerequisites',
    component: PrerequisitesStepComponent,
    data: {
      breadcrumb: 'menu.admin-warning.edition.prerequisites',
      action: 'creation',
      scope: SCOPE.WARNING
    }
  },
  {
    path: 'links-and-attachments',
    component: LinksAndAttachmentsStepComponent,
    data: {
      breadcrumb: 'menu.admin-warning.edition.links-and-attachments',
      action: 'creation',
      scope: SCOPE.WARNING
    }
  },
  {
    path: 'publics-references',
    component: PublicsReferencesStepComponent,
    data: {
      breadcrumb: 'menu.admin-warning.edition.publics-references',
      action: 'creation',
      scope: SCOPE.WARNING
    }
  },
  {
    path: 'diffusion',
    component: DiffusionStepComponent,
    data: {
      breadcrumb: 'menu.admin-warning.edition.diffusion',
      action: 'creation',
      scope: SCOPE.WARNING
    }
  },
  {
    path: 'finalization',
    component: FinalizationStepComponent,
    data: {
      breadcrumb: 'menu.admin-warning.edition.finalization',
      action: 'creation',
      scope: SCOPE.WARNING
    }
  }
];

const routes: Routes = [
  {path: '', redirectTo: 'tables', pathMatch: 'full'},
  {
    path: 'tables',
    component: TablesPageComponent,
    data: {
      breadcrumb: 'menu.admin-warning.tables',
      scope: SCOPE.WARNING
    },
    title: 'menu.admin-warning.management',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard]
  },
  {
    path: 'creation',
    component: CreationPageComponent,
    data: {
      breadcrumb: 'menu.admin-warning.creation',
      scope: SCOPE.WARNING
    },
    title: 'menu.admin-warning.creation',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: warningCreationSteps
  },
  {
    path: 'edition/:warningId',
    component: CreationPageComponent,
    data: {
      breadcrumb: 'menu.admin-warning.edit',
      scope: SCOPE.WARNING
    },
    title: 'menu.admin-warning.edit',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: warningCreationSteps
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminWarningRoutingModule { }
