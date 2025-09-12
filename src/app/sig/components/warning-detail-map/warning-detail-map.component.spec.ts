import { ComponentFixture, TestBed } from '@angular/core/testing';
import { default as MapCarto } from '@shom2/carto/core/Map';
import { LayersFacade } from '@sig/facades/layers.facade';
import { MockProvider } from 'ng-mocks';
import VectorSource from 'ol/source/Vector';
import { Observable, of } from 'rxjs';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SerieType } from '@app/models/serie.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { GeometryType } from '@app/sig/utils/geometry';
import { TranslateModule } from '@ngx-translate/core';
import { WarningStyleFactory } from '@sig/core/warning-style.factory';
import Feature from 'ol/Feature';
import { LineString, Polygon } from 'ol/geom';
import { WarningDetailMapComponent } from './warning-detail-map.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class ExtendWarningDetailMapComponent extends WarningDetailMapComponent {
  public displaysModelItemFeatures() {
    super.displaysModelItemFeatures();
  }
  public doHighlightingFeatures() {
    super.doHighlightingFeatures();
  }
}

describe('WarningDetailMapComponent', () => {
  let component: ExtendWarningDetailMapComponent;
  let fixture: ComponentFixture<ExtendWarningDetailMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        ExtendWarningDetailMapComponent
    ],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        MockProvider(LayersFacade, {
            getBaseLayers$(): Observable<any> {
                return new Observable();
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendWarningDetailMapComponent);
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

  it('should create carto when baselayers are received', done => {
    // Given
    const layerFacade = TestBed.inject(LayersFacade);
    const $baseLayers = layerFacade.getBaseLayers$();
    spyOn(layerFacade, 'getBaseLayers$').and.callFake(() => {
      return of([]);
    });

    // When
    component.ngAfterViewInit();

    // Expect
    expect(component.carto).toBeTruthy();
    expect(component.map).toBeTruthy();
    done();
  });

  it('should add warning feature in vectorSource', done => {
    // Given
    component.modelItem = {
      id: '1',
      generalAreas: {},
      globalWarningType: 'WARNING',
      nameOfSeries: 'serie1',
      warningNumber: 1001,
      year: 21,
      warningHazardTypeGeneral: 'warningHazard',
      publicationTime: null,
      featureParts: [{
        affectedAreas: [
          new Feature(
            new Polygon([[[0, 0], [0, 10], [10, 10], [10, 0]]])
          )
        ],
        geometries: [
          new Feature(
            new Polygon([[[0, 0], [0, 1], [1, 1], [1, 0]]])
          )
        ]
      }],
      serieType: SerieType.LOCAL_NAVIGATIONAL_WARNING,
      serieId: '1'
    };
    component.vectorSource = new VectorSource();
    component.map = {
      view: {
        fit: jasmine.createSpy()
      }
    } as any as MapCarto;

    // When
    component.displaysModelItemFeatures();

    // Expect
    expect(component.vectorSource.getFeatures().length).toBe(2);
    expect(component.map.view.fit).toHaveBeenCalledOnceWith([-4, -4, 14, 14]);
    done();
  });


  it('should highlight some feature from a warning', done => {
    // Given
    const styleFactory = TestBed.inject(WarningStyleFactory);
    const affectedArea = new Feature(
      new Polygon([[[0, 0], [0, 1], [1, 1], [1, 0]]])
    );
    const geometry = new Feature(
      new LineString([[0, 0], [1, 1]])
    );
    component.modelItem = {
      id: '1',
      generalAreas: {},
      globalWarningType: 'WARNING',
      nameOfSeries: 'serie1',
      warningNumber: 1001,
      year: 21,
      warningHazardTypeGeneral: 'warningHazard',
      publicationTime: null,
      featureParts: [{
        affectedAreas: [
          affectedArea
        ],
        geometries: [
          geometry
        ]
      }],
      serieType: SerieType.LOCAL_NAVIGATIONAL_WARNING,
      serieId: '1'
    };
    component.featuresToHighlight = {
      affectedAreas: [affectedArea],
      geometries: [geometry]
    };
    spyOn(styleFactory, 'getRollOverStyleForAffectedArea');
    spyOn(styleFactory, 'getRollOverStyleForGeometry');
    spyOn(affectedArea, 'setStyle').and.stub();
    spyOn(geometry, 'setStyle').and.stub();

    // When
    component.doHighlightingFeatures();

    // Expect
    expect(styleFactory.getRollOverStyleForAffectedArea).toHaveBeenCalledWith(
      'WARNING',
      GeometryType.POLYGON
    );
    expect(styleFactory.getRollOverStyleForGeometry).toHaveBeenCalledWith(
      'WARNING',
      GeometryType.LINE_STRING
    );
    expect(affectedArea.setStyle).toHaveBeenCalled();
    expect(geometry.setStyle).toHaveBeenCalled();
    done();
  });
});
