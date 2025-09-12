import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { UsersApi } from '@app/api/users.api';
import MaritimeServiceUserRole from '@app/models/maritime-service-user-role';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { Observable } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { ServiceUsersAssignComponent } from './service-users-assign.component';
import Spy = jasmine.Spy;

describe('ServiceUsersAssignComponent', () => {
  let component: ServiceUsersAssignComponent;
  let fixture: ComponentFixture<ServiceUsersAssignComponent>;
  let spyApiRole: Spy<any>;
  let user = {serviceUserId: 'id-user', serviceRole: 'id-role', email: 'some@email.com', serviceId: 'id-service' }
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceUsersAssignComponent],
      imports: [TranslateModule.forRoot(),
        DropdownModule,
        NoopAnimationsModule,
        ConfirmDialogModule,
        ReactiveFormsModule],
      providers: [
        ConfirmationService,
        MockProvider(MaritimeServicesApi, {
          findUsers(): Observable<MaritimeServiceUserRole[]> {
            return of([user]);
          },
          addRole(): Observable<void> {
            return of();
          },
          deleteRole(): Observable<void>{
            return of();
          }
        }),
        MockProvider(UsersApi, {
          findAllServiceUser(serviceId: string): Observable<any> {
            return of([{
              id: 'identifier',
              email: 'some@email.com'
            }]);
          }
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceUsersAssignComponent);
    const mockApi = TestBed.inject(MaritimeServicesApi);
    spyApiRole = spyOn(mockApi, 'addRole');

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should add role', async () => {
    const serviceUser: HTMLElement = fixture.nativeElement;
    // Select user
    await (serviceUser.querySelector('#user-id > .p-dropdown') as HTMLDivElement).click();
    expect(serviceUser.querySelectorAll('.p-dropdown-item').length).toEqual(1);
    const userDropdown: Dropdown = fixture.debugElement.query(By.css('#user-id')).componentInstance;
    userDropdown.onOptionSelect(new Event('change'), userDropdown.options[0]);
    await (serviceUser.querySelector('#user-id > .p-dropdown') as HTMLDivElement).click();

    // Select role
    await (serviceUser.querySelector('#user-role > .p-dropdown') as HTMLDivElement).click();
    expect(serviceUser.querySelectorAll('.p-dropdown-item').length).toEqual(4);
    const roleDropdown: Dropdown = fixture.debugElement.query(By.css('#user-role')).componentInstance;
    roleDropdown.onOptionSelect(new Event('change'), roleDropdown.options[0]);
    await (serviceUser.querySelector('#user-role > .p-dropdown') as HTMLDivElement).click();


    expect(fixture.componentInstance.form.valid).toEqual(true);

    // Send form
    serviceUser.querySelector('.form').dispatchEvent(new Event('submit'));

    expect(spyApiRole).toHaveBeenCalled();
  });

  it('should call confirm with accept button click', () => {
    let confirmdialog : ConfirmDialog;
    confirmdialog = fixture.debugElement.query(By.css('p-confirmdialog')).componentInstance;
    let accept = spyOn(confirmdialog,"accept").and.callThrough();
    component.confirm(user);
    fixture.detectChanges();
    let acceptBtn = fixture.debugElement.nativeElement.querySelector('.p-confirm-dialog-accept');
    acceptBtn.click();
    expect(accept).toHaveBeenCalled();
  })

});
