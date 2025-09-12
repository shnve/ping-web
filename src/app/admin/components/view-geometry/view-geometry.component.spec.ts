import { ComponentFixture, TestBed } from '@angular/core/testing';
import WKT from 'ol/format/WKT';
import { Polygon } from 'ol/geom';
import { ViewGeometryComponent } from './view-geometry.component';
import { default as MapCarto } from '@shom2/carto/core/Map';


const wkt =
  'POLYGON((10.689 -25.092, 34.595 ' +
  '-20.170, 38.814 -35.639, 13.502 ' +
  '-39.155, 10.689 -25.092))';

const format = new WKT();

const feature = format.readFeature(wkt, {
  dataProjection: 'EPSG:4326',
  featureProjection: 'EPSG:3857',
});

const geometry = {
  type: (feature?.getGeometry() as Polygon)?.getType(),
  coordinates: (feature?.getGeometry() as Polygon)?.getCoordinates()
    .map(coordinate => coordinate.map(coordinates => coordinates.slice(0, 2)))
};

describe('ViewGeometryComponent', () => {
  let component: ViewGeometryComponent;
  let fixture: ComponentFixture<ViewGeometryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewGeometryComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewGeometryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add geometry on the map', () => {
    // Given
    component.isEditionMode = false;
    component.geometry = geometry;

    // When
    component.addGeomOnMap();
    component.canEditGeometry();

    // Then
    expect(component.geometriesLayer.getSource().getFeatures().length).toBe(1);
  })

  it('should be possible to save geometry', () => {
    // Given
    component.isEditionMode = true;
    component.geometry = geometry;

    // When
    component.addGeomOnMap();
    component.canEditGeometry();

    // Then
    expect(component.canSaveGeometry()).toBe(true);
  })

  it('should not add geometry on the map', () => {
    // Given
    component.isEditionMode = false;
    component.geometry = null;

    // When
    component.addGeomOnMap();
    component.canEditGeometry();

    // Then
    expect(component.geometriesLayer.getSource().getFeatures().length).toBe(0);
    expect(component.canSaveGeometry()).toBe(false);
  })

  it('should be possible to edit geometry', () => {
    // Given
    component.isEditionMode = true;
    component.geometry = geometry;

    // When
    component.addGeomOnMap();
    component.canEditGeometry();

    // Then
    expect(component.modulesOptions.drawingModule.enable).toBe(true);
  })

  it('should not be possible to edit geometry', () => {
    // Given
    component.isEditionMode = false;
    component.geometry = geometry;

    // When
    component.addGeomOnMap();
    component.canEditGeometry();

    // Then
    expect(component.modulesOptions).toBe(undefined);
  })

  describe('checkIfKmlContainsUnsupportedGeometryType', () => {
    beforeEach(() => {
      component.map.map = {
        view: {
          getProjection() {
            return 'EPSG:4326'
          }
        }
      } as any as MapCarto;
    });

    it('should pass check if Kml is valid', () => {
      // Given
      const validKmlAsString = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark><Style><LineStyle></LineStyle><PolyStyle></PolyStyle></Style><Polygon><outerBoundaryIs><LinearRing><coordinates>-4.701655178964076,49.51245962743525 -7.821772366464075,46.90684082520224 -4.086420803964077,45.028600761754944 1.5825245085359227,47.97677728428829 -0.790522366464075,49.24064535251719 -4.701655178964076,49.51245962743525</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';


      // When
      const isKmlNotValid = component.checkIfKmlContainsUnsupportedGeometryType(validKmlAsString);

      // Then
      expect(isKmlNotValid).toBeFalse();
    })

    it('should not pass check if KML contains multigeometry', () => {
      // Given
      const multigeomKmlAsString = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark><Style><LineStyle></LineStyle><PolyStyle></PolyStyle></Style><MultiGeometry><Point><coordinates>138.600000,-34.910000</coordinates></Point><Polygon><outerBoundaryIs><LinearRing><coordinates>-4.701655178964076,49.51245962743525 -7.821772366464075,46.90684082520224 -4.086420803964077,45.028600761754944 1.5825245085359227,47.97677728428829 -0.790522366464075,49.24064535251719 -4.701655178964076,49.51245962743525</coordinates></LinearRing></outerBoundaryIs></Polygon></MultiGeometry></Placemark></kml>';

      // When
      const isKmlNotValid = component.checkIfKmlContainsUnsupportedGeometryType(multigeomKmlAsString);

      // Then
      expect(isKmlNotValid).toBeTrue();
    })

    it('should not pass check if KML contains unclosed polygon', () => {
      // Given
      const unclosedPolygonKmlAsString = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark><name>AR 2024-043</name><description></description><Style><LineStyle></LineStyle><PolyStyle></PolyStyle></Style><Polygon><outerBoundaryIs><LinearRing><coordinates>-2.6176,48.89654999999999 -2.5685833329999994,48.929733333 -2.5056666669999994,48.88929999999999 -2.45435,48.81761666700001 -2.449433333,48.798283333 -2.5092166670000005,48.791650000000004 -2.55515,48.8064 -2.578116667,48.821350000000024 -2.59245,48.84486666699999</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';

      // When
      const isKmlNotValid = component.checkIfKmlContainsUnsupportedGeometryType(unclosedPolygonKmlAsString);

      // Then
      expect(isKmlNotValid).toBeTrue();
    })

    it('should not pass check if KML contains polygon with less than 3 points', () => {
      // Given
      const twoPointsPolygonKmlAsString = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark><name>AR 2024-043</name><description></description><Style><LineStyle></LineStyle><PolyStyle></PolyStyle></Style><Polygon><outerBoundaryIs><LinearRing><coordinates>-2.6176,48.89654999999999 -2.5685833329999994,48.929733333 -2.6176,48.89654999999999</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';

      // When
      const isKmlNotValid = component.checkIfKmlContainsUnsupportedGeometryType(twoPointsPolygonKmlAsString);

      // Then
      expect(isKmlNotValid).toBeTrue();
    })
  });
});
