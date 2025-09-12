import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeoregulationFormatNumberPipe } from '@app/georegulation/pipes/georegulation-format-number.pipe';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { GeoregulationModalMapComponent } from './georegulation-modal-map.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('GeoregulationModalMapComponent', () => {
  let component: GeoregulationModalMapComponent;
  let fixture: ComponentFixture<GeoregulationModalMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GeoregulationModalMapComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        GeoregulationFormatNumberPipe,
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationModalMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });
});
