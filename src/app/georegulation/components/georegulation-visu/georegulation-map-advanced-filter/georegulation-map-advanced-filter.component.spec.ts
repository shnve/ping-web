import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GeoregulationMapAdvancedFilterComponent } from './georegulation-map-advanced-filter.component';


describe('GeoregulationMapAdvancedFilterComponent', () => {
  let component: GeoregulationMapAdvancedFilterComponent;
  let fixture: ComponentFixture<GeoregulationMapAdvancedFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoregulationMapAdvancedFilterComponent ],
      imports: [ TranslateModule.forRoot() ],
      providers: [ UntypedFormBuilder ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationMapAdvancedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
