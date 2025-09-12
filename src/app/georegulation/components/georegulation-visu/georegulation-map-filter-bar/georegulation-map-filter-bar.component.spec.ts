import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { GeoregulationMapFilterBarComponent } from './georegulation-map-filter-bar.component';


describe('GeoregulationMapFilterBarComponent', () => {
  let component: GeoregulationMapFilterBarComponent;
  let fixture: ComponentFixture<GeoregulationMapFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoregulationMapFilterBarComponent ],
      imports: [ TranslateModule.forRoot() ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationMapFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
