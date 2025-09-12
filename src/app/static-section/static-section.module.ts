import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { SharedModule } from '@app/shared/shared.module';
import { StaticSectionDetailsComponent } from './components/static-section-details/static-section-details.component';
import { StaticSectionFormComponent } from './components/static-section-form/static-section-form.component';
import { StaticSectionListComponent } from './components/static-section-list/static-section-list.component';
import { StaticSectionDirective } from './directives/static-section.directive';
import { StaticSectionRoutingModule } from './static-section-routing.module';


@NgModule({
  declarations: [
    StaticSectionFormComponent,
    StaticSectionDetailsComponent,
    StaticSectionListComponent,
    StaticSectionDirective
  ],
  imports: [
    CommonModule,
    StaticSectionRoutingModule,
    SharedModule,
    SharedPipeModule
  ],
  exports: [
    StaticSectionDirective
  ]
})
export class StaticSectionModule { }
