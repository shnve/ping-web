import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { SharedModule } from '@app/shared/shared.module';
import { StaticLogoCreationComponent } from './components/static-logo-creation/static-logo-creation.component';
import { StaticLogoDetailsComponent } from './components/static-logo-details/static-logo-details.component';
import { StaticLogoFormComponent } from './components/static-logo-form/static-logo-form.component';
import { StaticLogoListComponent } from './components/static-logo-list/static-logo-list.component';
import { StaticLogoDirective } from './directives/static-logo.directive';
import { StaticLogoRoutingModule } from './static-logo-routing.module';


@NgModule({
  declarations: [
    StaticLogoDirective,
    StaticLogoDetailsComponent,
    StaticLogoFormComponent,
    StaticLogoListComponent,
    StaticLogoCreationComponent
  ],
  imports: [
    CommonModule,
    StaticLogoRoutingModule,
    SharedModule,
    SharedPipeModule
  ],
  exports: [
    StaticLogoDirective
  ]
})
export class StaticLogoModule { }
