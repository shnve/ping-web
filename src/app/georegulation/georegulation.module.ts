import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { SharedModule } from '@app/shared/shared.module';
import { SigModule } from '@app/sig/sig.module';
import { GeoregulationCreationComponent } from './components/georegulation-creation/georegulation-creation.component';
import { GeoregulationModalMapComponent } from './components/georegulation-modal/georegulation-modal-map/georegulation-modal-map.component';
import { GeoregulationModalComponent } from './components/georegulation-modal/georegulation-modal.component';
import { GeoregulationNumberInputComponent } from './components/georegulation-number/georegulation-number-input/georegulation-number-input.component';
import { GeoregulationNumberListComponent } from './components/georegulation-number/georegulation-number-list/georegulation-number-list.component';
import { GeoregulationInputInformationComponent } from './components/georegulation-parts/georegulation-part-form/georegulation-input-information/georegulation-input-information.component';
import { GeoregulationPartFormComponent } from './components/georegulation-parts/georegulation-part-form/georegulation-part-form.component';
import { GeoregulationPartsListComponent } from './components/georegulation-parts/georegulation-parts-list/georegulation-parts-list.component';
import { GeoregulationPartsMapComponent } from './components/georegulation-parts/georegulation-parts-map/georegulation-parts-map.component';
import { GeoregulationPartsComponent } from './components/georegulation-parts/georegulation-parts.component';
import { GeoregulationAdvancedFilterComponent } from './components/georegulation-tables/georegulation-advanced-filter/georegulation-advanced-filter.component';
import { GeoregulationPaginatedTableComponent } from './components/georegulation-tables/georegulation-paginated-table/georegulation-paginated-table.component';
import { GeoregulationTableFilterBannerComponent } from './components/georegulation-tables/georegulation-table-filter-banner/georegulation-table-filter-banner.component';
import { GeoregulationTablesComponent } from './components/georegulation-tables/georegulation-tables.component';
import { GeoregulationMapAdvancedFilterComponent } from './components/georegulation-visu/georegulation-map-advanced-filter/georegulation-map-advanced-filter.component';
import { GeoregulationMapFilterBannerComponent } from './components/georegulation-visu/georegulation-map-filter-banner/georegulation-map-filter-banner.component';
import { GeoregulationVisuComponent } from './components/georegulation-visu/georegulation-visu.component';
import { GeoregulationRoutingModule } from './georegulation-routing.module';
import { GeoregulationFormatNumberPipe } from './pipes/georegulation-format-number.pipe';
import { GeoregulationMapFilterBarComponent } from './components/georegulation-visu/georegulation-map-filter-bar/georegulation-map-filter-bar.component';
import { GeoregulationSeasonalPeriodsComponent } from './components/georegulation-seasonal-periods/georegulation-seasonal-periods.component';
import { GeoregulationSeasonalPeriodComponent } from './components/georegulation-seasonal-periods/georegulation-seasonal-period/georegulation-seasonal-period.component';
import { GeoregulationDetailComponent } from './components/georegulation-detail/georegulation-detail.component';


@NgModule({
  declarations: [
    GeoregulationTablesComponent,
    GeoregulationCreationComponent,
    GeoregulationNumberInputComponent,
    GeoregulationNumberListComponent,
    GeoregulationFormatNumberPipe,
    GeoregulationPartsComponent,
    GeoregulationPartFormComponent,
    GeoregulationPartsListComponent,
    GeoregulationPartsMapComponent,
    GeoregulationInputInformationComponent,
    GeoregulationPaginatedTableComponent,
    GeoregulationTableFilterBannerComponent,
    GeoregulationAdvancedFilterComponent,
    GeoregulationModalComponent,
    GeoregulationModalMapComponent,
    GeoregulationVisuComponent,
    GeoregulationMapFilterBannerComponent,
    GeoregulationMapAdvancedFilterComponent,
    GeoregulationMapFilterBarComponent,
    GeoregulationSeasonalPeriodsComponent,
    GeoregulationSeasonalPeriodComponent,
    GeoregulationDetailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SigModule,
    SharedPipeModule,
    GeoregulationRoutingModule
  ],
  providers: [
    GeoregulationFormatNumberPipe
  ]
})
export class GeoregulationModule { }
