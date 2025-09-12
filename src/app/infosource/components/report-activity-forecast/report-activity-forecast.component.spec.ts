import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { InfosourceAdminService } from '@app/infosource/services/infosource-admin.service';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { MaritimeServiceType, ServiceRole } from '@app/models/maritime-service.model';
import { ProUserServices } from '@app/models/pro-user.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { GeometryType } from '@app/sig/utils/geometry';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { ConfirmationService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { ReportActivityForecastComponent } from './report-activity-forecast.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ReportActivityForecastComponent', () => {
  let component: ReportActivityForecastComponent;
  let fixture: ComponentFixture<ReportActivityForecastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ReportActivityForecastComponent],
    imports: [RouterTestingModule,
        TranslateModule.forRoot()],
    providers: [UntypedFormBuilder, PermissionsProvider, ConfirmationService,
        {
            provide: ActivatedRoute,
            useValue: {
                paramMap: of(new Map(Object.entries({ id: 123 })))
            }
        },
        MockProvider(MaritimeServicesApi, {
            findOne(id: string): Observable<MaritimeService> {
                return of({ id: '1', name: 'my-service', maritimeEntities: [], tags: [] });
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
        MockProvider(AuthService, {
            getAuthenticatedUser(): AuthenticatedUser {
                return {
                    serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36'
                } as any as AuthenticatedUser;
            }
        }), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportActivityForecastComponent);
    component = fixture.componentInstance;
    component.report.internalComment = 'a comment';
    component.report.concernedMaritimeEntityIds = ['68a6e75d-4b15-41e6-a65a-dc739f8e7d36']
    component.report.parts = [
      {
        description: 'description',
        internationalDescription: '',
        localisation: [{
          geometry: {
            type: GeometryType.POINT,
            coordinates: [1, 1]
          }
        }],
        dateRanges: [],
        geometries: [new Feature(
          new Polygon([[[0, 0], [0, 10], [10, 10], [10, 0]]])
        )],
        object: null
      }
    ];
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should get internal comment in form', () => {
    // When
    component.initForm();

    // Then
    expect(component.internalComment.value).toEqual('a comment');
  });

  it('should not save form with internal comment which contains only space', () => {
    // Given
    component.infosourceParts.updateFeaturePartsFromForm = () => { };

    // When
    component.initForm();
    component.form.get('parts').value[0].information = { 'fr': 'information' };
    component.form.get('internalComment').setValue('     ');
    component.saveForm();

    // Then
    expect(component.saveForm()).toBe(false);
  });
});
