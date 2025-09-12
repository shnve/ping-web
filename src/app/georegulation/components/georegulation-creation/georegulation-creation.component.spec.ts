import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UsersApi } from '@app/api/users.api';
import { GeoregulationAdminService } from '@app/georegulation/services/georegulation-admin.service';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { MaritimeServiceType, ServiceRole } from '@app/models/maritime-service.model';
import { ProUserServices } from '@app/models/pro-user.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { MaritimeServiceService } from '@app/services/maritime-services.service';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { ConfirmationService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { GeoregulationCreationComponent } from './georegulation-creation.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('GeoregulationCreationComponent', () => {
  let component: GeoregulationCreationComponent;
  let fixture: ComponentFixture<GeoregulationCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GeoregulationCreationComponent],
    imports: [TranslateModule.forRoot(),
        RouterTestingModule],
    providers: [
        ConfirmationService,
        UntypedFormBuilder,
        PermissionsProvider,
        {
            provide: ActivatedRoute,
            useValue: {
                paramMap: of(new Map(Object.entries({ id: 123 })))
            }
        },
        MockProvider(MaritimeServiceService, {
            findByServiceIds$(ids: string[]): Observable<MaritimeService[]> {
                return of([{ id: '1', name: 'my-service', maritimeEntities: [] }]);
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
        MockProvider(GeoregulationAdminService, {
            getAvailableMaritimeEntitiesForCreation$(): Observable<MaritimeEntityBase[]> {
                return of([{ id: '1', name: 'name1' }]);
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });
});
