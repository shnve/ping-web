import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule, convertToParamMap } from '@angular/router';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { InfosourceAdminApi } from '@app/infosource/api/infosource-admin.api';
import { InfosourceReportServiceUser } from '@app/infosource/models/infosource.model';
import { InfosourceAdminService } from '@app/infosource/services/infosource-admin.service';
import { AbstractInfosourceService } from '@app/infosource/services/infosource.service';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { MaritimeServiceType, ServiceRole } from '@app/models/maritime-service.model';
import { ProUserServices } from '@app/models/pro-user.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { formatPeriodForEdition } from '@app/shared/date-utils';
import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MockComponent, MockProvider } from 'ng-mocks';
import { Feature } from 'ol';
import { Point, Polygon } from 'ol/geom';
import { ConfirmationService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { SharedReportFormComponent } from '../shared-report/shared-report-form.component';
import { ReportBathyDangerComponent } from './report-bathy-danger.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ReportBathyDangerComponent', () => {
  let component: ReportBathyDangerComponent;
  let fixture: ComponentFixture<ReportBathyDangerComponent>;
  let infosourceReportServiceUser: InfosourceReportServiceUser = {
    localisation: [
      new Feature(new Point([-327051.55438601, 6002105.92020062])),
      new Feature(new Point([-327052.55438601, 6002104.92020062])),
      new Feature(new Point([-327053.55438601, 6002103.92020062])),
      new Feature(new Point([-327054.55438601, 6002102.92020062])),
      new Feature(new Point([-327055.55438601, 6002101.92020062])),
      new Feature(new Polygon
        (
          [
            [
              [
                -330479.33754236,
                6004612.78160141
              ],
              [
                -330273.73044287,
                6004856.95758656
              ],
              [
                -329689.9821651,
                6004520.32138914
              ],
              [
                -329897.9492378,
                6004257.18344469
              ],
              [
                -330479.33754236,
                6004612.78160141
              ]
            ]
          ]
        )
      )
    ],
    description: 'name and location',
    attachmentIds: [],
    timezone: null,
    surveyPeriod: {
      dateEnd: '2023-07-17',
      dateStart: '2023-07-03'
    },
    confidentialityInformation: 'a confidentiality information',
    serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
    concernedMaritimeEntityIds: [],
    internalComment: null,
    id: '1b60a992-c6c5-4559-998b-05189caf523a'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        ReportBathyDangerComponent,
        TranslatePipe,
        MockComponent(SharedReportFormComponent),
    ],
    imports: [RouterModule.forRoot([]),
        SharedPipeModule,
        TranslatePipe,
        TranslateModule.forRoot()],
    providers: [
        UntypedFormBuilder,
        PermissionsProvider,
        ConfirmationService,
        TranslateService,
        SharedPipeModule,
        TranslatePipe,
        {
            provide: ActivatedRoute,
            useValue: {
                paramMap: of(convertToParamMap({ id: '1b60a992-c6c5-4559-998b-05189caf523a' })),
                snapshot: { params: { id: '1b60a992-c6c5-4559-998b-05189caf523a' } }
            },
        },
        MockProvider(AbstractInfosourceService, {
            getInfosourceReportById$(id: string): Observable<InfosourceReportServiceUser> {
                return of(infosourceReportServiceUser);
            },
            getAvailableMaritimeEntitiesForCreation$(): Observable<MaritimeEntityBase[]> {
                return of([{ id: '1', name: 'name1' }]);
            },
            updateInfosourceBathyReport(infosourceBathyReportServiceUser: InfosourceReportServiceUser): Observable<string> {
                return of('1b60a992-c6c5-4559-998b-05189caf523a');
            }
        }),
        MockProvider(InfosourceAdminApi, {
            getInfosourceReportById$(id: string): Observable<InfosourceReportServiceUser> {
                return of(infosourceReportServiceUser);
            },
            getAvailableMaritimeEntities$(): Observable<MaritimeEntityBase[]> {
                return of([{ id: '1', name: 'name1' }]);
            },
            updateInfosourceBathyReportServiceUser(infosourceBathyReportServiceUser: InfosourceReportServiceUser): Observable<string> {
                return of('1b60a992-c6c5-4559-998b-05189caf523a');
            }
        }),
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
            },
            hasRoleServiceUser(): boolean {
                return true;
            },
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();

    fixture = TestBed.createComponent(ReportBathyDangerComponent);
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

  it('should get confidentiality', done => {
    expect(component.confidentialityInformation.value).toEqual(infosourceReportServiceUser.confidentialityInformation);
    done();
  });

  it('should get survey period', done => {
    expect(component.surveyPeriod.value).toEqual(formatPeriodForEdition(infosourceReportServiceUser.surveyPeriod));
    done();
  });

  it('should save form and update IS bathy', done => {
    // Given
    const spyComponentSaveForm = spyOn(component, 'saveForm').and.callThrough();
    const spyComponentGetInformationsRequired = spyOn(component, 'getInformationsRequired').and.callThrough();
    const spyComponentUpdateInfosourceBathy = spyOn(component, 'updateInfosourceBathy').and.callThrough();
    const spyComponentIsFormSaveable = spyOn(component.sharedReport, 'isFormSaveable').and.returnValue(true);
    const spyComponentGetGeometries = spyOn(component.sharedReport, 'getGeometries').and.returnValue(infosourceReportServiceUser.localisation);

    component.initForm();
    component['dateValidated'](true);

    // When
    component.validate();

    // Then
    expect(spyComponentSaveForm).toHaveBeenCalled();
    expect(spyComponentIsFormSaveable).toHaveBeenCalled();
    expect(spyComponentGetGeometries).toHaveBeenCalled();
    expect(spyComponentGetInformationsRequired).toHaveBeenCalled();
    expect(spyComponentUpdateInfosourceBathy).toHaveBeenCalled();
    done();
  });
});
