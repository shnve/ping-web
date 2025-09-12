import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResetPasswordComponent} from './reset-password.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MockProvider} from 'ng-mocks';
import {Observable, of} from 'rxjs';
import {UsersApi} from '@app/api/users.api';
import Spy = jasmine.Spy;

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let spyUserApi: Spy<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResetPasswordComponent],
      imports: [ReactiveFormsModule,
        TranslateModule.forRoot(),
        NoopAnimationsModule],
      providers: [
        MockProvider(UsersApi, {
          resetPassword(): Observable<void> {
            return of();
          }
        })
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    const mockUserApi = TestBed.inject(UsersApi);
    spyUserApi = spyOn(mockUserApi, 'resetPassword').and.returnValues(of());

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should reset password', async () => {
    expect(component).toBeTruthy();
    const resetForm: HTMLElement = fixture.nativeElement;
    (resetForm.querySelector('#password') as HTMLInputElement).value = 'Password';
    resetForm.querySelector('#password').dispatchEvent(new Event('input'));
    await (resetForm.querySelector('#reset-submit') as HTMLButtonElement).click();
    resetForm.querySelector('.user-form').dispatchEvent(new Event('submit'));
    expect(spyUserApi).toHaveBeenCalled();
  });
});
