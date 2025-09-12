import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersApi } from '@app/api/users.api';
import { MaritimeServiceType } from '@app/models/maritime-service.model';
import { ProUserServices, ServiceRole } from '@app/models/pro-user.model';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Observable } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { ServiceAssignForUserComponent } from './service-assign-for-user.component';


describe('ServiceAssignForUserComponent', () => {
  let component: ServiceAssignForUserComponent;
  let fixture: ComponentFixture<ServiceAssignForUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceAssignForUserComponent ],
      imports: [TranslateModule.forRoot()],
      providers: [
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
        })
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceAssignForUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display all roles', () => {
    const rolesElement: HTMLElement = fixture.nativeElement;
    expect(rolesElement.querySelectorAll('table tbody tr').length).toEqual(2);
    expect(rolesElement.querySelector('table tbody tr:first-child td:first-child a').innerHTML).toEqual('CDN 1');
  });
});
