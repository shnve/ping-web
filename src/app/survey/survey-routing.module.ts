import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurveyDepositComponent } from './components/survey-creation/survey-deposit/survey-deposit.component';
import { SurveyTestComponent } from './components/survey-creation/survey-test/survey-test.component';
import { SurveyTablesComponent } from './components/survey-tables/survey-tables.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tables',
    pathMatch: 'full'
  },
  {
    path: 'tables',
    component: SurveyTablesComponent,
    data: {
      breadcrumb: 'menu.survey.my-surveys'
    }
  },
  {
    path: 'deposit',
    component: SurveyDepositComponent,
    data: {
      breadcrumb: 'menu.survey.new-deposit'
    }
  },
  {
    path: 'deposit/edition/:id',
    component: SurveyDepositComponent,
    data: {
      breadcrumb: 'menu.survey.edit-deposit'
    }
  },
  {
    path: 'notdeposit',
    component: SurveyTestComponent,
    data: {
      breadcrumb: 'menu.survey.new-test'
    }
  },
  {
    path: 'notdeposit/edition/:id',
    component: SurveyTestComponent,
    data: {
      breadcrumb: 'menu.survey.edit-test'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SurveyRoutingModule { }
