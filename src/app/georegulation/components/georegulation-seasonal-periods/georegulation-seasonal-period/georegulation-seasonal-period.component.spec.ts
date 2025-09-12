import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { GeoregulationSeasonalPeriodComponent } from './georegulation-seasonal-period.component';


describe('GeoregulationSeasonalPeriodComponent', () => {
  let component: GeoregulationSeasonalPeriodComponent;
  let fixture: ComponentFixture<GeoregulationSeasonalPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoregulationSeasonalPeriodComponent ],
      imports: [ TranslateModule.forRoot() ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationSeasonalPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
