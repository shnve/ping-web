import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { TranslateInPipe } from '@app/shared/pipes/translateIn.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { GeoregulationInputInformationComponent } from './georegulation-input-information.component';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('GeoregulationInputInformationComponent', () => {
  let component: GeoregulationInputInformationComponent;
  let fixture: ComponentFixture<GeoregulationInputInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GeoregulationInputInformationComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        TranslateInPipe,
        CapitalizeFirstPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationInputInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add geometries of lang textarea corresponding', done => {
    // Given
    component.geometries = [new Feature(new Point([1000, 2500]))];
    const sampleFr = '00°01,35\'N 000°00,54\'E'
    const button = fixture.nativeElement.querySelector('.button-add-geometries');
    let spyUpdateInformationsClipBoard = spyOn<any>(component, 'updateInformationsClipBoard').and.callThrough();
    let spyAddGeometryToTextContent = spyOn<any>(component, 'addGeometryToTextContent').and.callThrough();

    // When
    button.click();

    // Then
    expect(spyAddGeometryToTextContent).toHaveBeenCalled();
    expect(spyUpdateInformationsClipBoard).toHaveBeenCalled();
    expect(component['informationsClipBoard']['fr']).toEqual(sampleFr)
    done();
  });

  it('should copy geometries of lang to clip board', done => {
    // Given
    const btnCopyToClipboard = fixture.nativeElement.querySelector('.btn-copy-to-clipboard');
    let spyCopyGeometriesLangToClipBoard = spyOn<any>(component, 'copyGeometriesLangToClipBoard').and.callThrough();
    // we spy the method  execCommand use in copyToClipBoard
    let spyCopyToClipboard = spyOn<any>(document, 'execCommand');
    // we spy the method add alertMessageService of Toast
    let spyAlertMessageService = spyOn<any>(component['alertMessageService'], 'add');

    component['informationsClipBoard'] = {
      'fr': 'zone d\'un rayon de 10.52 NM autour de 42°53,99\'N 005°11,10\'E.',
      'en': 'area within 10.52 NM radius of 42°53,99\'N 005°11,10\'E.'
    }

    // When
    btnCopyToClipboard.click();

    // Then
    expect(spyCopyGeometriesLangToClipBoard).toHaveBeenCalled();
    expect(spyCopyToClipboard).toHaveBeenCalled();
    expect(spyAlertMessageService).toHaveBeenCalled();
    done();
  });
});
