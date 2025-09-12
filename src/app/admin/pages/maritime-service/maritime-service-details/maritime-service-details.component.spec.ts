import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ServiceUsersAssignComponent } from '@app/admin/components/service-users-assign/service-users-assign.component';
import { MaritimeServiceFormComponent } from '@app/admin/pages/maritime-service/maritime-service-form/maritime-service-form.component';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AuthService } from '@app/auth/auth.service';
import MaritimeService from '@app/models/maritime-service.model';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { OrderByPipe } from 'ngx-pipes';
import { ConfirmationService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable, of } from 'rxjs';
import { MaritimeServiceDetailsComponent } from './maritime-service-details.component';


describe('MaritimeServiceDetailsComponent', () => {
  let component: MaritimeServiceDetailsComponent;
  let fixture: ComponentFixture<MaritimeServiceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [MaritimeServiceDetailsComponent, MaritimeServiceFormComponent, ServiceUsersAssignComponent, OrderByPipe],
    imports: [ReactiveFormsModule, FormsModule, TranslateModule.forRoot(), DropdownModule,
        MultiSelectModule, NoopAnimationsModule, RouterTestingModule],
    providers: [{
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    params: {
                        id: '1',
                    }
                }
            }
        },
        ConfirmationService,
        MockProvider(AuthService, {
            hasAccessToService(): boolean {
                return false;
            }
        }),
        MockProvider(MaritimeServicesApi, {
            findOne(id: string): Observable<MaritimeService> {
                return of({ id: '1', name: 'my-service', maritimeEntities: [], observedMaritimeEntities: [] });
            }
        }), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaritimeServiceDetailsComponent);
    component = fixture.componentInstance;
    component.maritimeService = {
      id: null,
      name: null,
      maritimeEntities: []
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
