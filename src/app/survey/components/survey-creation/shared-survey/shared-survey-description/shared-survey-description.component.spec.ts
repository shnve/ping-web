import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { MaritimeServiceType, ServiceRole } from '@app/models/maritime-service.model';
import { ProUserServices } from '@app/models/pro-user.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { SharedSurveyDescriptionComponent } from './shared-survey-description.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SharedSurveyDescriptionComponent', () => {
  let component: SharedSurveyDescriptionComponent;
  let fixture: ComponentFixture<SharedSurveyDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SharedSurveyDescriptionComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        UntypedFormBuilder,
        PermissionsProvider,
        MockProvider(AuthService, {
            isLoggedIn(): boolean {
                return true;
            },
            isPublicUser(): boolean {
                return true;
            },
            getConnected$(): Observable<boolean> {
                return of(true);
            },
            hasRoleServiceUser(): boolean {
                return true;
            },
            hasRightsOnAnyAuthorityService(): boolean {
                return false;
            },
            hasAccess(): boolean {
                return false;
            },
            getAuthenticatedUser(): AuthenticatedUser {
                return {
                    serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
                    serviceRoles: [ServiceRole.SERVICE_OPERATOR]
                } as any as AuthenticatedUser;
            }
        }),
        MockProvider(UsersApi, {
            findProServices(): Observable<ProUserServices[]> {
                return of([{
                        id: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
                        name: 'CDN 1',
                        internationalName: 'CDN 1',
                        serviceRole: ServiceRole.SERVICE_OPERATOR,
                        type: MaritimeServiceType.NATIONAL_DELEGATED_COORDINATOR,
                        surveyOwner: true
                    }, {
                        id: 'identifier2',
                        name: 'CDN 2',
                        internationalName: 'CDN 2',
                        serviceRole: ServiceRole.SERVICE_OPERATOR,
                        type: MaritimeServiceType.NATIONAL_DELEGATED_COORDINATOR
                    }]);
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(SharedSurveyDescriptionComponent);
    component = fixture.componentInstance;
    component.survey = {
      nameAndLocation: 'nameAndLocation',
      areaId: 'areaId',
      achievementPeriod: {
        dateStart: '12/04/2023',
        dateEnd: '13/04/2023'
      },
      serviceId: 'issuingServiceId'
    };
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    (component as any).onTouched();
    (component as any).onChange();
    done();
  });

  it('should register the onChange function', done => {
    const fn = () => {};
    component.registerOnChange(fn);
    expect((component as any).onChange).toBe(fn);
    done();
  });

  it('should register the onTouch function', done => {
    const fn = () => {};
    component.registerOnTouched(fn);
    expect((component as any).onTouched).toBe(fn);
    done();
  });

  it('should write a value', () => {
    const newValue = {
      nameAndLocation: 'nameAndLocation2',
      areaId: 'areaId',
      achievementPeriod: {
        dateStart: null,
        dateEnd: null
      },
      serviceId: 'issuingServiceId2'
    };

    component.writeValue(newValue);

    expect(component.survey).toEqual(newValue);
  });

  it('should not write a value when null', () => {
    const oldValue = {
      nameAndLocation: 'nameAndLocation',
      areaId: 'areaId',
      achievementPeriod: {
        dateStart: '12/04/2023',
        dateEnd: '13/04/2023'
      },
      serviceId: 'issuingServiceId'
    };

    component.writeValue(null);

    expect(component.survey).toEqual(oldValue);
  });

  it('should call initForm on init', done => {
    spyOn((component as any), 'initForm');
    component.ngOnInit();
    expect((component as any).initForm).toHaveBeenCalled();
    component['proUserServices$'].subscribe(result => {
      expect(result.length).toEqual(1);
    }).unsubscribe();
    done();
  });

  it('should init form', done => {
    (component as any).initForm();
    expect((component as any).form).toBeTruthy();
    expect(component.nameAndLocation.value).toEqual('nameAndLocation');
    expect(component.areaId.value).toEqual('areaId');
    expect(component.achievementPeriod.value).toEqual({
      dateStart: '12/04/2023',
      dateEnd: '13/04/2023'
    });
    expect(component.serviceId.value).toEqual('issuingServiceId');
    done();
  });

  it('should init form without serviceId', done => {
    component.survey = {
      nameAndLocation: 'nameAndLocation',
      areaId: 'areaId',
      achievementPeriod: {
        dateStart: '12/04/2023',
        dateEnd: '13/04/2023'
      }
    };
    (component as any).initForm();
    expect((component as any).form).toBeTruthy();
    expect(component.nameAndLocation.value).toEqual('nameAndLocation');
    expect(component.areaId.value).toEqual('areaId');
    expect(component.achievementPeriod.value).toEqual({
      dateStart: '12/04/2023',
      dateEnd: '13/04/2023'
    });
    expect(component.serviceId.value).toEqual('69a6e75d-4b15-41e6-a65a-dc739f8e7d36');
    done();
  });
});
