import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { GeoregulationMapFilterBannerComponent } from './georegulation-map-filter-banner.component';


describe('GeoregulationMapFilterBannerComponent', () => {
  let component: GeoregulationMapFilterBannerComponent;
  let fixture: ComponentFixture<GeoregulationMapFilterBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoregulationMapFilterBannerComponent ],
      imports: [ TranslateModule.forRoot() ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationMapFilterBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
