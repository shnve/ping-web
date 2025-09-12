import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, ElementRef, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { MaritimeEntitiesApi } from '@app/api/maritime-entities.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { MapMaritimeEntity } from '@app/models/maritime-entity.model';
import { MapWarning } from '@app/models/warning.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { MaritimeEntitiesService } from '@app/services/maritime-entities.service';
import { ModelItemCluster } from '@app/sig/core/model-item-cluster';
import { GeometryType } from '@app/sig/utils/geometry';
import { environment } from '@env/environment';
import { TranslateModule } from '@ngx-translate/core';
import { default as CartoLayer } from '@shom2/carto/core/Layer';
import { default as MapCarto } from '@shom2/carto/core/Map';
import { WarningStyleFactory } from '@sig/core/warning-style.factory';
import { LayersFacade } from '@sig/facades/layers.facade';
import { MousePositionFormatterService } from '@sig/services/mouse-position-formatter.service';
import { MockComponent, MockProvider } from 'ng-mocks';
import { Overlay } from 'ol';
import { default as OlMap } from 'ol/Map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Point from 'ol/geom/Point';
import { Observable, of } from 'rxjs';
import { georegulationServiceProvider } from '../../../georegulation/providers/georegulation.service.provider';
import { PopoverComponent } from '../popover/popover.component';
import { MapComponent } from './map.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


@Component({
  selector: 'map-component',
  templateUrl: './map.component.html'
})
class ExtendsMapComponent extends MapComponent implements OnChanges {
  public createCarto(layers: CartoLayer[]): void {
    super.createCarto(layers);
  }

  public toggleClusterizationAccordingZoom() {
    super.toggleClusterizationAccordingZoom();
  }

  public managePopoverDisplaying(evt: MapBrowserEvent<UIEvent>) {
    super.manageDatasPopoverDisplaying(evt);
  }

  public displayDetectionsData(): void {
    super.displayDetectionsData();
  }

  public initDetectionsVisuLayers(): void {
    super.initDetectionsVisuLayers();
  }

  public updateMapIfShouldShowDetections(): void {
    super.updateMapIfShouldShowDetections();
  }

  public ngOnChanges(changes: any): void {
    super.ngOnChanges(changes);
  }
}

class MockWarningCluser {
  disable() { }
  enable() { }
}

class MockCarto {
  olMap = {
    forEachFeatureAtPixel(coord, cb: () => {}) { }
  };
  view = {
    getZoom() { }
  }
}

class MockOverlay {
  setPosition() { }
}

describe('MapComponent', () => {
  let component: ExtendsMapComponent;
  let authService: AuthService;
  let maritimeEntityService: MaritimeEntitiesService;
  let fixture: ComponentFixture<ExtendsMapComponent>;
  const entitiesObservedOrManagedByService: MapMaritimeEntity[] = [
    {
      id: '1',
      name: 'entity1',
      geom: {
        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10]]],
        type: GeometryType.POLYGON
      }
    },
    {
      id: '2',
      name: 'entity2',
      geom: {
        coordinates: [[[0, 0], [10, 0], [10, 15], [0, 10]]],
        type: GeometryType.POLYGON
      }
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        MockComponent(PopoverComponent),
        ExtendsMapComponent
    ],
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        infosourceServiceProvider,
        georegulationServiceProvider,
        MockProvider(MaritimeEntitiesApi, {
            getEntitiesManagedOrObservedByServiceToDisplayOnMap$(): Observable<MapMaritimeEntity[]> {
                return of(entitiesObservedOrManagedByService);
            }
        }),
        MockProvider(LayersFacade, {
            getBaseLayers$() {
                return new Observable();
            }
        }),
        MockProvider(AlertMessageService),
        MockProvider(MousePositionFormatterService),
        MockProvider(WarningStyleFactory),
        MockProvider(ElementRef),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    authService = TestBed.inject(AuthService);
    maritimeEntityService = TestBed.inject(MaritimeEntitiesService);
    fixture = TestBed.createComponent(ExtendsMapComponent);
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

  it('should create simple carto with no baselayers and no warnings', done => {
    // Given
    component.popover = true;
    fixture.detectChanges();
    component.popoverComponent.element = { nativeElement: null };

    // When
    component.createCarto([]);

    // Expect
    expect(component.isLoaded).toBeTrue();
    expect(component.map.olMap).toBeInstanceOf(OlMap);
    expect(component.popoverOverlay).toBeInstanceOf(Overlay);
    done();
  });

  it('should disable cluster for zoom maxZoomLevel', done => {
    const mockCluster = new MockWarningCluser() as ModelItemCluster;
    const mockCarto = new MockCarto() as any as MapCarto;
    const spyDisable = spyOn(mockCluster, 'disable').and.callThrough();
    const spyEnable = spyOn(mockCluster, 'enable').and.callThrough();
    const spyZoom = spyOn(mockCarto.view, 'getZoom').and.returnValues(environment.carto.aggregation.maxZoomLevel + 1);

    component.warningCluster = mockCluster;
    component.map = mockCarto;
    component.toggleClusterizationAccordingZoom();
    expect(spyZoom).toHaveBeenCalled();
    expect(spyDisable).toHaveBeenCalled();
    expect(spyEnable).not.toHaveBeenCalled();
    done();
  });

  it('managePopoverDisplaying - Mouse on no feature', done => {
    const mapEvent = { pixel: [10, 10] };
    const warning: MapWarning = {
      id: '1',
      year: 21,
      warningTypeDetails: '',
      warningNumber: 1008,
      nameOfSeries: 'serie1',
      globalWarningType: 'NOTICE',
      affectedAreas: [],
      geometries: []
    };
    component.map = new MockCarto() as any as MapCarto;
    component.popoverComponent = TestBed.createComponent(PopoverComponent).componentInstance;

    const spyForEachFeatureAtPixel = spyOn(component.map.olMap, 'forEachFeatureAtPixel').and.callThrough();
    const spyPopoverHide = spyOn(component.popoverComponent, 'hide');
    component.warnings = [warning];

    component.managePopoverDisplaying(mapEvent as any as MapBrowserEvent<UIEvent>);

    expect(spyForEachFeatureAtPixel.calls.mostRecent().args[0]).toEqual(mapEvent.pixel);
    expect(spyPopoverHide).toHaveBeenCalled();
    done();
  });

  it('managePopoverDisplaying - Mouse on a cluster with two features and one warning', done => {
    // Given
    const mapEvent = { pixel: [10, 10], coordinate: [43.5, 2.5] };
    const warning: MapWarning = {
      id: '1',
      year: 21,
      warningTypeDetails: '',
      warningNumber: 1008,
      nameOfSeries: 'serie1',
      globalWarningType: 'NOTICE',
      affectedAreas: [],
      geometries: []
    };
    const features = [
      new Point([10, 10]),
      new Point([10, 10])
    ];
    features[0].set('warning', warning);
    features[1].set('warning', warning);
    const clusterFeature = new Point([10, 10]);
    clusterFeature.setProperties({ isCluster: true, features });

    component.popover = true;
    component.map = new MockCarto() as any as MapCarto;
    component.popoverComponent = TestBed.createComponent(PopoverComponent).componentInstance;
    component.popoverOverlay = new MockOverlay() as any as Overlay;
    component.warnings = [warning];

    const spyForEachFeatureAtPixel = spyOn(component.map.olMap, 'forEachFeatureAtPixel').and
      .callFake((pixel, cb) => {
        features.forEach((feature) => {
          cb.call(null, feature, null);
        });
        return null;
      });
    const spyOverlaySetPosition = spyOn(component.popoverOverlay, 'setPosition');
    const spyPopoverSetDatas = spyOn(component.popoverComponent, 'setDataToDisplayOnHoverNotion');
    const spyPopoverShow = spyOn(component.popoverComponent, 'show');

    // When
    component.managePopoverDisplaying(mapEvent as any as MapBrowserEvent<UIEvent>);

    // Expect
    expect(spyForEachFeatureAtPixel.calls.mostRecent().args[0]).toEqual(mapEvent.pixel);
    expect(spyOverlaySetPosition).toHaveBeenCalledWith(mapEvent.coordinate);
    expect(spyPopoverSetDatas.calls.mostRecent().args[0]).toContain(warning);
    expect(spyPopoverShow).toHaveBeenCalled();
    done();
  });

  it('managePopoverDisplaying - Mouse on a cluster with two features and two warning', done => {
    // Given
    const mapEvent = { pixel: [10, 10], coordinate: [43.5, 2.5] };
    const warnings: MapWarning[] = [{
      id: '1',
      year: 21,
      warningTypeDetails: '',
      warningNumber: 1008,
      nameOfSeries: 'serie1',
      globalWarningType: 'NOTICE',
      affectedAreas: [],
      geometries: []
    }, {
      id: '2',
      year: 22,
      warningTypeDetails: '',
      warningNumber: 1010,
      nameOfSeries: 'serie2',
      globalWarningType: 'WARNING',
      affectedAreas: [],
      geometries: []
    }];
    const features = [
      new Point([10, 10]),
      new Point([10, 10])
    ];
    features[0].set('warning', warnings[0]);
    features[1].set('warning', warnings[1]);
    const clusterFeature = new Point([10, 10]);
    clusterFeature.setProperties({ isCluster: true, features });

    component.popover = true;
    component.map = new MockCarto() as any as MapCarto;
    component.popoverComponent = TestBed.createComponent(PopoverComponent).componentInstance;
    component.popoverOverlay = new MockOverlay() as any as Overlay;
    component.warnings = warnings;

    const spyForEachFeatureAtPixel = spyOn(component.map.olMap, 'forEachFeatureAtPixel').and
      .callFake((pixel, cb) => {
        features.forEach((feature) => {
          cb.call(null, feature, null);
        });
        return null;
      });
    const spyOverlaySetPosition = spyOn(component.popoverOverlay, 'setPosition');
    const spyPopoverSetDatas = spyOn(component.popoverComponent, 'setDataToDisplayOnHoverNotion');
    const spyPopoverShow = spyOn(component.popoverComponent, 'show');

    // When
    component.managePopoverDisplaying(mapEvent as any as MapBrowserEvent<UIEvent>);

    // Expect
    expect(spyForEachFeatureAtPixel.calls.mostRecent().args[0]).toEqual(mapEvent.pixel);
    expect(spyOverlaySetPosition).toHaveBeenCalledWith(mapEvent.coordinate);
    expect(spyPopoverSetDatas.calls.mostRecent().args[0].size).toEqual(2);
    expect(spyPopoverSetDatas.calls.mostRecent().args[0]).toContain(warnings[1]);
    expect(spyPopoverShow).toHaveBeenCalled();
    done();
  });

  it('should put the size on the map when the window dimension changes or load', done => {
    // Given
    const spyOnResizeWindow = spyOn(component, 'onResize').and.callThrough();
    const spyOnCalcHeightOfMap = spyOn<any>(MapComponent, 'calcHeightOfMap');
    const mapContainer = document.querySelector('.map-container');
    const sigMapContainer = document.createElement('sig-map');
    sigMapContainer.appendChild(mapContainer)
    document.body.appendChild(sigMapContainer);

    // When
    const mockEvent = { target: { innerHeight: 800 } };
    component.onResize(mockEvent);

    // Expect
    expect(spyOnResizeWindow).toHaveBeenCalled();
    expect(spyOnCalcHeightOfMap).toHaveBeenCalledWith(mockEvent.target.innerHeight, false);
    done();
  });

  it('should display entities observed or managed by service on map', done => {
    // Given
    component.shouldShowMaritimesEntitiesManagedOrObservedByService = true;
    component.enableLayerMaritimesEntitiesManagedOrObservedByService = true;
    component.createCarto([]);
    const spyComponentLoadMapMaritimeEntities = spyOn(component, 'loadMapMaritimeEntities').and.callThrough();
    const spyComponentDisplaysEntitiesData = spyOn<any>(component, 'displaysEntitiesData').and.callThrough();

    const spyMapAddLayer = spyOn(component.map.olMap, 'addLayer').and.callThrough();
    const spyComponentInitMaritimeEntityVisuLayers = spyOn<any>(component, 'initMaritimeEntityVisuLayers').and.callThrough();
    const spyGetEntitiesManagedOrObservedByServiceToDisplayOnMap = spyOn(maritimeEntityService, 'getEntitiesManagedOrObservedByServiceToDisplayOnMap$').and.returnValues(of(entitiesObservedOrManagedByService));
    const spyHasRoleServiceUser = spyOn(authService, 'hasRoleServiceUser').and.returnValue(true);
    const spyIsLoggedIn = spyOn(authService, 'isLoggedIn').and.returnValue(true);

    // When
    component.updateMapIfShouldShowMaritimesEntitiesManagedOrObservedByService();

    // Then
    expect(component.entitiesManagedOrObservedByService).toEqual(entitiesObservedOrManagedByService);
    expect(spyComponentLoadMapMaritimeEntities).toHaveBeenCalled();
    expect(spyComponentDisplaysEntitiesData).toHaveBeenCalled();
    expect(spyComponentInitMaritimeEntityVisuLayers).toHaveBeenCalled();
    expect(spyGetEntitiesManagedOrObservedByServiceToDisplayOnMap).toHaveBeenCalled();
    expect(spyHasRoleServiceUser).toHaveBeenCalled();
    expect(spyIsLoggedIn).toHaveBeenCalled();
    expect(spyMapAddLayer).toHaveBeenCalled();
    done();
  });

  it('should remove enitities from map', done => {
    // Given
    component.shouldShowMaritimesEntitiesManagedOrObservedByService = false;
    component.enableLayerMaritimesEntitiesManagedOrObservedByService = true;
    component.entitiesManagedOrObservedByService = entitiesObservedOrManagedByService;
    component.createCarto([]);
    const spyHasRoleServiceUser = spyOn(authService, 'hasRoleServiceUser').and.returnValue(true);
    const spyIsLoggedIn = spyOn(authService, 'isLoggedIn').and.returnValue(true);

    // When
    component.updateMapIfShouldShowMaritimesEntitiesManagedOrObservedByService();

    // Then
    expect(spyHasRoleServiceUser).toHaveBeenCalled();
    expect(spyIsLoggedIn).toHaveBeenCalled();
    expect(component.entitiesManagedOrObservedByService).toEqual([]);
    done();
  });

  it('should not display entities on map if user has no rights', done => {
    // Given
    component.shouldShowMaritimesEntitiesManagedOrObservedByService = true;
    component.enableLayerMaritimesEntitiesManagedOrObservedByService = true;
    component.createCarto([]);
    const spyComponentLoadMapMaritimeEntities = spyOn(component, 'loadMapMaritimeEntities').and.callThrough();

    // When
    component.updateMapIfShouldShowMaritimesEntitiesManagedOrObservedByService();

    // Then
    expect(spyComponentLoadMapMaritimeEntities).toHaveBeenCalledTimes(0);
    done();
  });


  it('should display detections on map', done => {
    // Given
    const detections = [
      {
        geometry: {
          type: GeometryType.POINT,
          coordinates: [10, 0]
        },
        depth: 3.2,
        difference: 0.3,
        color: 2
      },
      {
        geometry: {
          type: GeometryType.POINT,
          coordinates: [10, 10]
        },
        depth: 3.2,
        difference: 0.3,
        color: 2
      }
    ];

    const changes: SimpleChanges = {
      surveyDetections: new SimpleChange(null, detections, true)
    };
    component.surveyDetections = detections;
    component.shouldShowDetections = true;
    component.showDetections = true;
    const spyComponentUpdateMapIfShouldShowDetections = spyOn(component, 'updateMapIfShouldShowDetections').and.callThrough();
    const spyComponentInitDetectionsVisuLayers = spyOn(component, 'initDetectionsVisuLayers').and.callThrough();
    const spyComponentDisplayDetectionsData = spyOn(component, 'displayDetectionsData').and.callThrough();
    component.isLoaded = true;

    // When
    component.ngOnChanges(changes);

    // Then
    expect(spyComponentUpdateMapIfShouldShowDetections).toHaveBeenCalled();
    expect(spyComponentInitDetectionsVisuLayers).toHaveBeenCalled();
    expect(spyComponentDisplayDetectionsData).toHaveBeenCalled();
    done();
  });

  it('should remove detections from map', done => {
    // Given
    const detections = [
      {
        geometry: {
          type: GeometryType.POINT,
          coordinates: [10, 0]
        },
        depth: 3.2,
        difference: 0.3,
        color: 2
      },
      {
        geometry: {
          type: GeometryType.POINT,
          coordinates: [10, 10]
        },
        depth: 3.2,
        difference: 0.3,
        color: 2
      }
    ];

    const changes: SimpleChanges = {
      surveyDetections: new SimpleChange(null, detections, true)
    };
    component.surveyDetections = detections;
    component.shouldShowDetections = true;
    component.showDetections = true;
    component.isLoaded = true;
    component.ngOnChanges(changes);

    // When
    component.updateMapIfShouldShowDetections();

    // Then
    expect(component.showDetectionData).toBeFalse();
    expect(component['detectionFeatures']).toEqual([]);
    done();
  });
});
