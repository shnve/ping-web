import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { Observable, of } from 'rxjs';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { InfosourceAdminService } from '@app/infosource/services/infosource-admin.service';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { MaritimeServiceType, ServiceRole } from '@app/models/maritime-service.model';
import { ProUserServices } from '@app/models/pro-user.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { MockProvider } from 'ng-mocks';
import { SharedReportFormComponent } from './shared-report-form.component';

describe('SharedReportFormComponent', () => {
  let component: SharedReportFormComponent;
  let fixture: ComponentFixture<SharedReportFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SharedReportFormComponent],
    imports: [RouterModule.forRoot([]),
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
                    id: 'identifier',
                    serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36'
                } as any as AuthenticatedUser;
            }
        }), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedReportFormComponent);
    component = fixture.componentInstance;
    component.infosSourceReport.internalComment = 'a comment';
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should get form not valid with anomaly description with space only', done => {
    // When
    component.initSharedForm();

    // Then
    component.sharedReportForm.get('anomalyDescription').setValue('  ');
    expect(component.sharedReportForm.controls['anomalyDescription'].valid).toBe(false);
    done();
  });

  it('should get form not valid with internal comment with space only', done => {
    // When
    component.initSharedForm();

    // Then
    component.sharedReportForm.get('internalComment').setValue('  ');
    expect(component.sharedReportForm.controls['internalComment'].valid).toBe(false);
    done();
  });

  it('should get form valid with internal comment without space only', done => {
    // When
    component.initSharedForm();

    // Then
    expect(component.sharedReportForm.controls['internalComment'].valid).toBe(true);
    expect(component.sharedReportForm.get('internalComment').value).toEqual('a comment');
    done();
  });

  it('should call refreshAvailableMaritimeEntitiesList if there are localisation ', done => {
    // Given
    spyOn(component, 'refreshAvailableMaritimeEntitiesList');

    // When
    component.infosSourceReport = { localisation: [] };
    component.ngAfterViewInit();

    // Then
    expect(component.refreshAvailableMaritimeEntitiesList).toHaveBeenCalled();
    expect(component['geometriesLoaded']).toBeFalse();
    done();
  });

  it('should not call refreshAvailableMaritimeEntitiesList if there are not localisation', done => {
    // Given
    spyOn(component, 'refreshAvailableMaritimeEntitiesList');

    // When
    component.ngAfterViewInit();

    // Then
    expect(component.refreshAvailableMaritimeEntitiesList).not.toHaveBeenCalled();
    expect(component['geometriesLoaded']).toBeFalse();
    done();
  });
});
