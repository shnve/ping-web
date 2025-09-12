import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GeoregulationPartsMapComponent } from './georegulation-parts-map.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('GeoregulationPartsMapComponent', () => {
  let component: GeoregulationPartsMapComponent;
  let fixture: ComponentFixture<GeoregulationPartsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GeoregulationPartsMapComponent],
    imports: [TranslateModule.forRoot()],
    providers: [UntypedFormBuilder, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationPartsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
