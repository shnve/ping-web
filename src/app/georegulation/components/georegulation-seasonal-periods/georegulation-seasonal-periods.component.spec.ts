import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { GeoregulationSeasonalPeriodsComponent } from './georegulation-seasonal-periods.component';


describe('GeoregulationSeasonalPeriodsComponent', () => {
  let component: GeoregulationSeasonalPeriodsComponent;
  let fixture: ComponentFixture<GeoregulationSeasonalPeriodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeoregulationSeasonalPeriodsComponent],
      imports: [TranslateModule.forRoot()]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationSeasonalPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
