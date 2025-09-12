import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { SharedModule } from '@app/shared/shared.module';
import { StaticFileCreationComponent } from './components/static-file-creation/static-file-creation.component';
import { StaticFileDetailsComponent } from './components/static-file-details/static-file-details.component';
import { StaticFileFormComponent } from './components/static-file-form/static-file-form.component';
import { StaticFileListComponent } from './components/static-file-list/static-file-list.component';
import { StaticFileRoutingModule } from './static-file-routing.module';
import { StaticFileLoaderComponent } from './components/static-file-loader/static-file-loader.component';
import { StaticFileComponent } from './components/static-file/static-file.component';


@NgModule({
  declarations: [
    StaticFileCreationComponent,
    StaticFileFormComponent,
    StaticFileDetailsComponent,
    StaticFileListComponent,
    StaticFileLoaderComponent,
    StaticFileComponent
  ],
  imports: [
    CommonModule,
    StaticFileRoutingModule,
    SharedModule,
    SharedPipeModule
  ]
})
export class StaticFileModule { }
