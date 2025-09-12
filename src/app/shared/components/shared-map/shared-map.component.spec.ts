import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { default as MapCarto } from '@shom2/carto/core/Map';

import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { MapComponent } from '@sig/components/map/map.component';
import { SharedMapComponent } from './shared-map.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SharedMapComponent', () => {
  let component: SharedMapComponent;
  let fixture: ComponentFixture<SharedMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        SharedMapComponent
    ],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.map = TestBed.createComponent(MapComponent).componentInstance;
    component.map.map = {
      view: {
        getProjection() {
          return 'EPSG:4326'
        }
      }
    } as any as MapCarto;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should verify if KML import is supported Geometry or not and if is point with name or not', done => {
    // Given
    const point = '<Point><coordinates>4.212431640624998,42.883717807560615</coordinates></Point>\n';
    const polygon = '<Polygon><outerBoundaryIs><LinearRing><coordinates>4.056522593152236,42.6505530013026 4.650126296118035,42.830950700361036 5.100446346643817,42.12139688839974 4.158868059180819,41.80176366219508 4.056522593152236,42.6505530013026</coordinates></LinearRing></outerBoundaryIs></Polygon>';
    const multiGeometry = '<MultiGeometry><outerBoundaryIs><LinearRing><coordinates>4.056522593152236,42.6505530013026 4.650126296118035,42.830950700361036 5.100446346643817,42.12139688839974 4.158868059180819,41.80176366219508 4.056522593152236,42.6505530013026</coordinates></LinearRing></outerBoundaryIs></Polygon>';
    const withoutName = '<name></name>';
    const withName = '<name>Anchor berth</name>';

    // table representing the different possible cases in GoemetryType or AreaType, and if there is text in the name tag
    // [name or not, typeGeometry, isGeometry, result]
    const testCase = [
      // Enum SupportedGeometryType
      [withName, point, true, true],
      [withoutName, point, true, false],
      [withName, multiGeometry, true, true],
      [withoutName, multiGeometry, true, true],
      // Enum SupportedAreaType
      [withName, polygon, false, false],
      [withoutName, polygon, false, false],
      [withName, multiGeometry, false, true],
      [withoutName, multiGeometry, false, true],
    ];

    testCase.forEach(test => {
      const kmlFile =
        '<?xml version="1.0" encoding="utf-8" ?>\n' +
        '<kml xmlns="http://www.opengis.net/kml/2.2">\n' +
        '<Document id="root_doc">\n' +
          '<Folder><name>9e855369-560e-4228-981b-d2bcaf2ce260</name>\n' +
            '<Placemark>\n' +
            `${test[0]}\n` +
            '<Style><IconStyle><color>ff0000ff</color><IconStyleSimpleExtensionGroup radius="5" points="Infinity" strokeColor="#ff0000" strokeWidth="2" lineDash="undefined"/></IconStyle><PolyStyle xmlns=""><outline>0</outline></PolyStyle></Style>\n' +
            `${test[1]}\n` +
            '</Placemark>\n' +
          '</Folder>\n' +
        '</Document>\n' +
        '</kml>';

      // When
      const result = component['checkIfKmlContainsUnsupportedGeometryType'](kmlFile, test[2] as boolean);

      // Then
      expect(result).toEqual(test[3] as boolean);
    });

    done();
  });
});
