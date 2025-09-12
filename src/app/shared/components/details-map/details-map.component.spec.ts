import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { MaritimeEntitiesApi } from '@app/api/maritime-entities.api';
import { AuthService } from '@app/auth/auth.service';
import { MapMaritimeEntity } from '@app/models/maritime-entity.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { MaritimeEntitiesService } from '@app/services/maritime-entities.service';
import { GeometryType } from '@app/sig/utils/geometry';
import { MockProvider } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { DetailsMapComponent } from './details-map.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DetailsMapComponent', () => {
  let component: DetailsMapComponent;
  let authService: AuthService;
  let maritimeEntityService: MaritimeEntitiesService;
  let fixture: ComponentFixture<DetailsMapComponent>;
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
    declarations: [DetailsMapComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        MockProvider(MaritimeEntitiesApi, {
            getEntitiesManagedOrObservedByServiceToDisplayOnMap$(): Observable<MapMaritimeEntity[]> {
                return of(entitiesObservedOrManagedByService);
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    authService = TestBed.inject(AuthService);
    maritimeEntityService = TestBed.inject(MaritimeEntitiesService);
    fixture = TestBed.createComponent(DetailsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should display entities observed or managed by service on map', done => {
    // Given
    component.shouldShowMaritimesEntitiesManagedOrObservedByService = true;
    component.enableLayerMaritimesEntitiesManagedOrObservedByService = true;
    const spyComponentLoadMapMaritimeEntities = spyOn(component, 'loadMapMaritimeEntities').and.callThrough();
    const spyComponentDisplaysEntitiesData = spyOn<any>(component, 'displaysEntitiesData').and.callThrough();
    component['createCarto']([]);
    const spyMapAddLayer = spyOn(component.map.olMap, 'addLayer').and.callThrough();
    const spyComponentAddLayer = spyOn<any>(component, 'addLayer').and.callThrough();
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
    expect(spyComponentAddLayer).toHaveBeenCalled();
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
    component['createCarto']([]);
    const spyHasRoleServiceUser = spyOn(authService, 'hasRoleServiceUser').and.returnValue(true);
    const spyIsLoggedIn = spyOn(authService, 'isLoggedIn').and.returnValue(true);
    const spyComponentRemoveLayer = spyOn<any>(component, 'removeLayer').and.callThrough();

    // When
    component.updateMapIfShouldShowMaritimesEntitiesManagedOrObservedByService();

    // Then
    expect(spyHasRoleServiceUser).toHaveBeenCalled();
    expect(spyIsLoggedIn).toHaveBeenCalled();
    expect(spyComponentRemoveLayer).toHaveBeenCalled();
    expect(component.entitiesManagedOrObservedByService).toEqual([]);
    done();
  });

  it('should not display entities on map if user has no rights', done => {
    // Given
    component.shouldShowMaritimesEntitiesManagedOrObservedByService = true;
    component.enableLayerMaritimesEntitiesManagedOrObservedByService = true;
    component['createCarto']([]);
    const spyComponentLoadMapMaritimeEntities = spyOn(component, 'loadMapMaritimeEntities').and.callThrough();

    // When
    component.updateMapIfShouldShowMaritimesEntitiesManagedOrObservedByService();

    // Then
    expect(spyComponentLoadMapMaritimeEntities).toHaveBeenCalledTimes(0);
    done();
  });

});
