import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProUserDetailsComponent} from './pro-user-details.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {DropdownModule} from 'primeng/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute} from '@angular/router';
import {ProUserFormComponent} from '@app/admin/pages/pro-user/pro-user-form/pro-user-form.component';
import {ServiceAssignForUserComponent} from '@app/admin/components/service-assign-for-user/service-assign-for-user.component';
import {MockProvider} from 'ng-mocks';
import {UsersApi} from '@app/api/users.api';
import {Observable, of} from 'rxjs';
import ProUser from '@app/models/pro-user.model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProUserDetailsComponent', () => {
  let component: ProUserDetailsComponent;
  let fixture: ComponentFixture<ProUserDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ProUserDetailsComponent, ProUserFormComponent, ServiceAssignForUserComponent],
    imports: [ReactiveFormsModule, TranslateModule.forRoot(), DropdownModule,
        MultiSelectModule, NoopAnimationsModule, RouterTestingModule],
    providers: [
        MockProvider(UsersApi, {
            findOnePro(): Observable<ProUser> {
                return of();
            }
        }),
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    params: {
                        id: '1',
                    }
                }
            }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProUserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
