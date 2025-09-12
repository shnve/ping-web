import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import Area from '@app/models/area.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { GeometryType } from '@app/sig/utils/geometry';
import { StaticSectionApi } from '@app/static-section/api/static-section.api';
import { StaticSection } from '@app/static-section/models/static-section.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { GeoregulationVisuComponent } from './georegulation-visu.component';


describe('GeoregulationVisuComponent', () => {
  let component: GeoregulationVisuComponent;
  let fixture: ComponentFixture<GeoregulationVisuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeoregulationVisuComponent],
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        TranslateService,
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ georegulationId: '6cac9acb-927e-4394-b523-edfe754f335c' }) }
          },
        },
        MockProvider(StaticSectionApi, {
          findOneByKey$(key: string): Observable<StaticSection> {
            return of({
              id: '1',
              key: 'key',
              location: 'location',
              path: 'path',
              name: 'name',
              content: 'georegulation disclaimer content',
              internationalContent: 'georegulation disclaimer internationalContent'
            });
          }
        }),
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationVisuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should put global disclaimer on fr', done => {
    // When
    component['translate'].currentLang = 'fr';
    component['showGlobalDisclaimerOnMap']();

    // Expect
    expect(component.areaDisclaimerContent).toEqual('georegulation disclaimer content');
    expect(component.currentAreaDisclaimerId).toEqual('global');
    done();
  });

  it('should put global disclaimer on en', done => {
    // When
    component['translate'].currentLang = 'en';
    component['showGlobalDisclaimerOnMap']();

    // Expect
    expect(component.areaDisclaimerContent).toEqual('georegulation disclaimer internationalContent');
    expect(component.currentAreaDisclaimerId).toEqual('global');
    done();
  });

  it('should put area disclaimer', done => {
    // Given
    const area: Area = {
      id: '1',
      internationalName: 'Atlantic',
      name: 'Atlantique',
      information: '',
      localizedInformation: '',
      urn: 'urn1',
      country: 'France',
      geom: {
        type: GeometryType.MULTI_POLYGON,
        coordinates: []
      },
      internationalDisclaimer: 'internationalDisclaimer',
      disclaimer: 'disclaimer'
    };

    // When
    component['updateMapDisclaimer'](area);

    // Expect
    expect(component.areaDisclaimerContent).toEqual('internationalDisclaimer');
    expect(component.currentAreaDisclaimerId).toEqual('1');
    done();
  });

});
