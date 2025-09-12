import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@app/auth/auth.service';
import { GeoregulationApi } from '@app/georegulation/api/georegulation.api';
import { GeoregulationActivity, GeoregulationPartModalDetails, GeoregulationStatusEnum, GeoregulationType, JsonGeoregulationModalDetails } from '@app/georegulation/models/georegulation.model';
import { GeoregulationFormatNumberPipe } from '@app/georegulation/pipes/georegulation-format-number.pipe';
import { georegulationServiceProvider } from '@app/georegulation/providers/georegulation.service.provider';
import { AbstractGeoregulationService } from '@app/georegulation/services/abstract-georegulation.service';
import { NotionType } from '@app/models/notion.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { DetailsMapComponent } from '@app/shared/components/details-map/details-map.component';
import { FormatMonthPipe } from '@app/shared/pipes/format-month.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { TranslateNamePipe } from '@app/shared/pipes/translate-name.pipe';
import { ExportPdfService } from '@app/shared/services/export-pdf.service';
import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { GeometryType } from '@app/sig/utils/geometry';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { ConfirmationService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { GeoregulationDetailComponent } from '../georegulation-detail/georegulation-detail.component';
import { GeoregulationModalComponent } from './georegulation-modal.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class MockExportPdfService {
}

describe('GeoregulationModalComponent', () => {
  let component: GeoregulationModalComponent;
  let mockExportPdfService: MockExportPdfService;
  let fixture: ComponentFixture<GeoregulationModalComponent>;
  let authService: AuthService;
  const georegulation: JsonGeoregulationModalDetails = {
    id: '1',
    issuingService: {
      id: 'service id',
      name: 'service name',
      internationalName: 'service international_name'
    },
    mainNumber: {
      year: 2022,
      text: 'some text',
      authorityIds: ['auth_id01', 'auth_id02'],
      date: '26042022',
      authorityCodes: ['Code1', 'Code2']
    },
    parts: [
      {
        features: [{
          geometry: {
            coordinates: [[0, 0], [4, 5], [10, 10]],
            type: GeometryType.LINE_STRING
          }
        }]
      }
    ],
    temporary: false,
    type: GeoregulationType.NAVIGATION,
    hasCoastlineLimit: false,
    activities: [GeoregulationActivity.NAVIGATION],
    status: GeoregulationStatusEnum.DRAFT,
    canBeSent: true,
    lastUpdate: new Date(2023, 6, 15),
    lastUpdateUser: 'service user'
  };

  beforeEach(async () => {
    mockExportPdfService = new MockExportPdfService();

    await TestBed.configureTestingModule({
    declarations: [
        GeoregulationModalComponent,
        GeoregulationDetailComponent,
        GeoregulationFormatNumberPipe,
        LocalizedDatePipe,
        TranslateNamePipe,
        FormatMonthPipe,
        TranslatePipe
    ],
    imports: [RouterTestingModule,
        TranslateModule.forRoot(),
        SharedPipeModule],
    providers: [
        PermissionsProvider,
        GeoregulationFormatNumberPipe,
        LocalizedDatePipe,
        TranslateNamePipe,
        FormatMonthPipe,
        TranslatePipe,
        { provide: ExportPdfService, useValue: mockExportPdfService },
        georegulationServiceProvider,
        ConfirmationService,
        MockProvider(AbstractGeoregulationService, {
            getModalDetails$(id: string): Observable<JsonGeoregulationModalDetails> {
                return of(georegulation);
            }
        }),
        MockProvider(GeoregulationApi, {
            getModalDetails$(id: string): Observable<JsonGeoregulationModalDetails> {
                return of(georegulation);
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationModalComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide', done => {
    // Given
    component.display = true;
    spyOn(component.onClose, 'emit');

    // When
    component.hide();

    // Then
    expect(component.display).toBeFalse();
    expect(component.onClose.emit).toHaveBeenCalled();
    done();
  });

  it('should select previous georegulation', done => {
    // Given
    component.georegulationIds = ['1', '2'];
    component.currentPosition = 1;
    component.hasPrevious = true;

    // When
    component.previous();

    // Then
    expect(component.currentPosition).toBe(0);
    expect(component['georegulation'].id).toBe('1');
    expect(component.hasPrevious).toBe(false);
    expect(component.hasNext).toBe(true);
    done();
  });

  it('should select next georegulation', done => {
    // Given
    component.georegulationIds = ['1', '2'];
    component.currentPosition = 0;
    component.hasNext = true;

    // When
    component.next();

    // Then
    expect(component.currentPosition).toBe(1);
    expect(component['georegulation'].id).toBe('1');
    expect(component.hasPrevious).toBe(true);
    expect(component.hasNext).toBe(false);
    done();
  });

  it('should set georegulation from JsonGeoregulationModalDetails', done => {
    // Given
    const changes: SimpleChanges = {
      georegulationIds: new SimpleChange(null, ['1', '2'], true),
    };
    component.georegulationIds = ['1', '2'];
    component.currentPosition = 0;
    const spyComponentShow = spyOn(component, 'show').and.callThrough();
    const spyComponentLoadGeoregulation = spyOn<any>(component, 'loadGeoregulation').and.callThrough();
    const spyComponentFormatGeoregulationModalDatas = spyOn<any>(component, 'formatGeoregulationModalDatas').and.callThrough();
    const spyAuthServiceIsProUser = spyOn(authService, 'isProUser').and.returnValue(false);

    // When
    component.ngOnChanges(changes);

    // Expect
    expect(spyComponentShow).toHaveBeenCalled();
    expect(spyComponentLoadGeoregulation).toHaveBeenCalled();
    expect(spyComponentFormatGeoregulationModalDatas).toHaveBeenCalledWith(georegulation);
    expect(component.display).toBe(true);
    expect(component['notionType']).toEqual(NotionType.GEOREGULATION);
    expect(spyAuthServiceIsProUser).toHaveBeenCalled();
    done();
  });

  it('should highlight features in feature part on select feature part', done => {
    // Given
    const featurePart: GeoregulationPartModalDetails = {
      features: [
        new Feature(
          new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
        )
      ]
    };
    component.mapComponent = TestBed.createComponent(DetailsMapComponent).componentInstance;
    component['notionType'] = NotionType.GEOREGULATION;
    component['loadGeoregulation']();

    // When
    component['selectFeaturePart'](featurePart);

    // Expect
    expect(component['highlightedFeatures'].features).toEqual(featurePart.features);
    done();
  });

  it('should remove highlighting on feature parts', done => {
    // Given
    const featurePart: GeoregulationPartModalDetails = {
      features: [
        new Feature(
          new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
        )
      ]
    };
    component.mapComponent = TestBed.createComponent(DetailsMapComponent).componentInstance;
    component.georegulationDetailComponent = TestBed.createComponent(GeoregulationDetailComponent).componentInstance;
    component['notionType'] = NotionType.GEOREGULATION;
    component['loadGeoregulation']();
    component.georegulationDetailComponent.featurePartBeingVisualized = 1;
    component['highlightedFeatures'].features = featurePart.features;

    // When
    component['selectFeaturePart'](featurePart);

    // Expect
    expect(component['highlightedFeatures'].features).toEqual([]);
    done();
  });

  it('should visualize all feature parts', done => {
    // Given
    const featurePart: GeoregulationPartModalDetails = {
      features: [
        new Feature(
          new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
        )
      ]
    };
    component.mapComponent = TestBed.createComponent(DetailsMapComponent).componentInstance;
    component.georegulationDetailComponent = TestBed.createComponent(GeoregulationDetailComponent).componentInstance;
    const spyComponentFormatGeoregulationModalDatas = spyOn<any>(component, 'formatGeoregulationModalDatas').and.callThrough();
    const spyComponentFitToModelItem = spyOn<any>(component.mapComponent, 'fitToModelItem').and.callThrough();
    component.georegulationDetailComponent.featurePartBeingVisualized = 1;
    component['notionType'] = NotionType.GEOREGULATION;
    component['loadGeoregulation']();
    component['highlightedFeatures'].features = featurePart.features;
    component.georegulationDetailComponent.georegulation = component['georegulation'];

    // When
    component['visualizeAllFeatures']();

    // Expect
    expect(component['highlightedFeatures'].features).toEqual([]);
    expect(component['previousHighlightedFeatures'].features).toEqual([]);
    expect(component.georegulationDetailComponent.featurePartBeingVisualized).toBeNull();
    expect(spyComponentFormatGeoregulationModalDatas).toHaveBeenCalled();
    expect(spyComponentFitToModelItem).toHaveBeenCalled();
    done();
  });

  it('should can repeal', done => {
    // Given

    const changes: SimpleChanges = {
      georegulationIds: new SimpleChange(null, ['1', '2'], true),
    };
    component.georegulationIds = ['1', '2'];
    component.currentPosition = 0;
    georegulation.status = GeoregulationStatusEnum.PUBLISHED;
    const spyComponentCheckActions = spyOn<any>(component, 'checkActions').and.callThrough();
    const spyAuthServiceIsLoggedIn = spyOn(authService, 'isLoggedIn').and.returnValue(true);
    const spyAuthServiceIsProUser = spyOn(authService, 'isProUser').and.returnValue(true);
    const spyComponentFormatGeoregulationModalDatas = spyOn<any>(component, 'formatGeoregulationModalDatas').and.callThrough();
    const spyAuthServiceHasAnyRole = spyOn(authService, 'hasAnyRoleOnService').and.returnValue(true);
    const spyAuthServiceHasRoleServiceUser = spyOn(authService, 'hasRoleServiceUser').and.returnValue(true);
    const spyAuthServiceHasRightsOnAnyAuthorityService = spyOn(authService, 'hasRightsOnAnyAuthorityService').and.returnValue(true);
    const spyAuthServiceHasShomGeographicAreaType = spyOn(authService, 'hasShomGeographicAreaType').and.returnValue(true);


    // When
    component.ngOnChanges(changes);

    // Then
    expect(spyAuthServiceIsProUser).toHaveBeenCalled();
    expect(spyAuthServiceIsLoggedIn).toHaveBeenCalled();
    expect(spyComponentCheckActions).toHaveBeenCalled();
    expect(spyComponentFormatGeoregulationModalDatas).toHaveBeenCalled();
    expect(spyAuthServiceHasRoleServiceUser).toHaveBeenCalled();
    expect(spyAuthServiceHasAnyRole).toHaveBeenCalled();
    expect(spyAuthServiceHasRightsOnAnyAuthorityService).toHaveBeenCalled();
    expect(spyAuthServiceHasShomGeographicAreaType).toHaveBeenCalled();
    expect(component.canRepeal).toBe(true);
    done();
  });

  it('should manage georegulation', done => {
    // Given

    const changes: SimpleChanges = {
      georegulationIds: new SimpleChange(null, ['1', '2'], true),
    };
    component.georegulationIds = ['1', '2'];
    component.currentPosition = 0;
    georegulation.status = GeoregulationStatusEnum.DRAFT;
    const spyComponentShow = spyOn(component, 'show').and.callThrough();
    const spyComponentLoadGeoregulation = spyOn<any>(component, 'loadGeoregulation').and.callThrough();
    const spyComponentFormatGeoregulationModalDatas = spyOn<any>(component, 'formatGeoregulationModalDatas').and.callThrough();
    const spyComponentCheckActions = spyOn<any>(component, 'checkActions').and.callThrough();
    const spyAuthServiceIsLoggedIn = spyOn(authService, 'isLoggedIn').and.returnValue(true);
    const spyAuthServiceIsProUser = spyOn(authService, 'isProUser').and.returnValue(true);
    const spyAuthServiceHasAnyRole = spyOn(authService, 'hasAnyRoleOnService').and.returnValue(true);
    const spyAuthServiceHasRoleServiceUser = spyOn(authService, 'hasRoleServiceUser').and.returnValue(true);
    const spyAuthServiceHasRightsOnAnyAuthorityService = spyOn(authService, 'hasRightsOnAnyAuthorityService').and.returnValue(true);
    const spyAuthServiceHasShomGeographicAreaType = spyOn(authService, 'hasShomGeographicAreaType').and.returnValue(true);

    // When
    component.ngOnChanges(changes);

    // Then
    expect(spyAuthServiceIsProUser).toHaveBeenCalled();
    expect(spyAuthServiceIsLoggedIn).toHaveBeenCalled();
    expect(spyComponentFormatGeoregulationModalDatas).toHaveBeenCalled();
    expect(spyComponentCheckActions).toHaveBeenCalled();
    expect(spyComponentShow).toHaveBeenCalled();
    expect(spyComponentLoadGeoregulation).toHaveBeenCalled();
    expect(spyAuthServiceHasRoleServiceUser).toHaveBeenCalled();
    expect(spyAuthServiceHasRightsOnAnyAuthorityService).toHaveBeenCalled();
    expect(spyAuthServiceHasShomGeographicAreaType).toHaveBeenCalled();
    expect(spyAuthServiceHasAnyRole).toHaveBeenCalled();
    expect(component['notionType']).toEqual(NotionType.GEOREGULATION);
    expect(component['proUser']).toBe(true);
    expect(component.canPublish).toBe(true);
    expect(component.canEdit).toBe(true);
    expect(component.canDelete).toBe(true);
    expect(component['georegulation'].canBeSent).toBe(true);
    expect(component.canClone).toBe(true);
    expect(component['canManage']).toBe(true);
    expect(component['items'].length).toEqual(5);
    done();
  });
});
