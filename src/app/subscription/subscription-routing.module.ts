import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  SubscriptionTablesComponent
} from '@app/subscription/components/subscription-tables/subscription-tables.component';
import {
  SubscriptionCreationComponent
} from '@app/subscription/components/subscription-creation/subscription-creation.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionTablesComponent,
    data: {
      breadcrumb: undefined
    }
  },
  {
    path: 'creation',
    component: SubscriptionCreationComponent,
    data: {
      breadcrumb: 'menu.subscription.creation'
    }
  },
  {
    path: ':subscriptionId',
    component: SubscriptionTablesComponent,
    data: {
      breadcrumb: undefined
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule { }
