import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { InfosourceStatusByService } from '@app/infosource/models/infosource.model';
import MaritimeService from '@app/models/maritime-service.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { InfosourceService } from '../../../services/infosource.service';
import { InfosourceModalStatusByServiceComponent } from './infosource-modal-status-by-service.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('InfosourceModalStatusByServiceComponent', () => {
  let component: InfosourceModalStatusByServiceComponent;
  let fixture: ComponentFixture<InfosourceModalStatusByServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [InfosourceModalStatusByServiceComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        MockProvider(MaritimeServicesApi, {
            findByServiceIds(ids: string[]): Observable<MaritimeService[]> {
                return of([{ id: '1', name: 'my-service', maritimeEntities: [] }]);
            }
        }),
        MockProvider(InfosourceService, {
            getServiceStatuses$(): Observable<InfosourceStatusByService[]> {
                return of([{ serviceId: '1', serviceName: 'myservice', actionType: 'action' }]);
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceModalStatusByServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
