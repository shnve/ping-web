import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { GeoregulationTableFilterBannerComponent } from './georegulation-table-filter-banner.component';


describe('GeoregulationTableFilterBannerComponent', () => {
  let component: GeoregulationTableFilterBannerComponent;
  let fixture: ComponentFixture<GeoregulationTableFilterBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeoregulationTableFilterBannerComponent],
      imports: [
        TranslateModule.forRoot()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationTableFilterBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
