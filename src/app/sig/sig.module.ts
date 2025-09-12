import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule as PrimeButtonModule } from 'primeng/button';
import { CheckboxModule as PrimeCheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule as PrimeOverlayPanelModule } from 'primeng/overlaypanel';
import { MapComponent } from './components/map/map.component';
import { PopoverComponent } from './components/popover/popover.component';
import { WarningDetailMapComponent } from './components/warning-detail-map/warning-detail-map.component';

@NgModule({
  declarations: [
    MapComponent,
    PopoverComponent,
    WarningDetailMapComponent
  ],
  exports: [
    MapComponent,
    PopoverComponent,
    WarningDetailMapComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedPipeModule,
    PrimeOverlayPanelModule,
    DialogModule,
    PrimeCheckboxModule,
    PrimeButtonModule,
    TranslateModule.forChild()
  ]
})
export class SigModule { }
