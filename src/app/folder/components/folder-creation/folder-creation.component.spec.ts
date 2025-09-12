import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { PermissionsProvider } from '../../../privileges/permissions-provider';

import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AreasApi } from '@app/api/areas.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { SubAreasApi } from '@app/api/sub-areas.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { InfosourceAdminService } from '@app/infosource/services/infosource-admin.service';
import Area from '@app/models/area.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { MaritimeServiceType, ServiceRole } from '@app/models/maritime-service.model';
import { ProUserServices } from '@app/models/pro-user.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { SubArea } from '@app/models/sub-area.model';
import { MockProvider } from 'ng-mocks';
import WKT from 'ol/format/WKT';
import { Polygon } from 'ol/geom';
import { Observable, of } from 'rxjs';
import { FolderCreationComponent } from './folder-creation.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

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

describe('FolderCreationComponent', () => {
  let component: FolderCreationComponent;
  let fixture: ComponentFixture<FolderCreationComponent>;
  let mockAreaApi: AreasApi;
  let mockSubAreasApi: SubAreasApi;
  let mockMaritimeServicesApi: MaritimeServicesApi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FolderCreationComponent],
    imports: [TranslateModule.forRoot(),
        RouterTestingModule],
    providers: [UntypedFormBuilder, PermissionsProvider, ConfirmationService,
        {
            provide: ActivatedRoute,
            useValue: {
                paramMap: of(new Map(Object.entries({ id: 123 })))
            }
        },
        MockProvider(MaritimeServicesApi, {
            findOne(id: string): Observable<MaritimeService> {
                return of({ id: '1', name: 'my-service', maritimeEntities: [], areas: ['area1'] });
            }
        }),
        MockProvider(UsersApi, {
            findProServices(): Observable<ProUserServices[]> {
                return of([{
                        id: 'identifier',
                        name: 'CDN 1',
                        internationalName: 'CDN 1',
                        serviceRole: ServiceRole.SERVICE_OPERATOR,
                        type: MaritimeServiceType.NATIONAL_DELEGATED_COORDINATOR
                    }, {
                        id: 'identifier2',
                        name: 'CDN 2',
                        internationalName: 'CDN 2',
                        serviceRole: ServiceRole.SERVICE_OPERATOR,
                        type: MaritimeServiceType.NATIONAL_DELEGATED_COORDINATOR
                    }]);
            }
        }),
        MockProvider(InfosourceAdminService, {
            getAvailableMaritimeEntitiesForCreation$(): Observable<MaritimeEntityBase[]> {
                return of([{ id: '1', name: 'name1' }]);
            }
        }),
        MockProvider(SubAreasApi, {
            getSubAreasByAreaId$(areaId: string): Observable<SubArea[]> {
                return of([{ id: '1', name: 'subarea1' }]);
            }
        }),
        MockProvider(AreasApi, {
            getAreasByServices(serviceIds: string[]): Observable<Area[]> {
                return of([{ id: '1', name: 'area1', geom: null }]);
            }
        }),
        MockProvider(AuthService, {
            getAuthenticatedUser(): AuthenticatedUser {
                return {
                    serviceId: 'service id',
                    serviceRoles: [ServiceRole.SERVICE_OPERATOR]
                } as any as AuthenticatedUser;
            }
        }), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    mockAreaApi = TestBed.inject(AreasApi);
    mockSubAreasApi = TestBed.inject(SubAreasApi);
    mockMaritimeServicesApi = TestBed.inject(MaritimeServicesApi);
    fixture = TestBed.createComponent(FolderCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update sub-area list when changing selected area', done => {
    // Given
    const spyUpdateSubAreaList = spyOn(component, 'updateSubAreaList').and.callThrough();

    // When
    component.changeSelectedArea('2');

    // Then
    expect(spyUpdateSubAreaList).toHaveBeenCalledWith('2');
    done();
  });

  it('should call services and api on init', done => {
    // Given
    const area1 = {
      id: '1',
      urn: '',
      name: 'Atlantique',
      internationalName: 'Atlantic',
      information: '',
      localizedInformation: '',
      country: 'France',
      geom: geometry,
      borderAreas: []
    };
    const subArea1: SubArea = {
      id: '1',
      name: 'sub01fr',
      internationalName: 'sub01en'
    };
    const subArea2: SubArea = {
      id: '2',
      name: 'sub02fr',
      internationalName: 'sub02en'
    };
    const spyGetAreasByServices = spyOn(mockAreaApi, 'getAreasByServices').and.returnValues(of([area1]));
    const spyFindOne = spyOn(mockMaritimeServicesApi, 'findOne').and.returnValues(of({ id: '1', name: 'my-service', maritimeEntities: [], areas: ['area1'] }));
    const spyUpdateSubAreaList = spyOn(component, 'updateSubAreaList').and.callThrough();
    const spyGetSubAreasByAreaId = spyOn(mockSubAreasApi, 'getSubAreasByAreaId$').and.returnValue(of([subArea2, subArea1]));

    // When
    component.ngOnInit();

    // Then
    expect(spyGetAreasByServices).toHaveBeenCalledWith(['service id']);
    expect(spyFindOne).toHaveBeenCalledWith('service id');
    expect(spyUpdateSubAreaList).toHaveBeenCalledWith('area1');
    expect(spyGetSubAreasByAreaId).toHaveBeenCalledWith('area1');
    component.areas$.subscribe(value => expect(value).toEqual([{id: '1', name: 'Atlantique', internationalName: 'Atlantic'}]));
    component.subArea$.subscribe(value => expect(value).toEqual([subArea1, subArea2]));

    done();
  });
});
