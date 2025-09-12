import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEmailComponent } from './update-email.component';
import {UsersApi} from '@app/api/users.api';
import {Observable, of} from 'rxjs';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MockProvider} from 'ng-mocks';
import Spy = jasmine.Spy;

describe('UpdateEmailComponent', () => {
  let component: UpdateEmailComponent;
  let fixture: ComponentFixture<UpdateEmailComponent>;
  let spyUserApi: Spy<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateEmailComponent ],
      imports: [ReactiveFormsModule,
        TranslateModule.forRoot(),
        NoopAnimationsModule],
      providers: [
        MockProvider(UsersApi, {
          updateEmail(): Observable<void> {
            return of();
          }
        })
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    const mockUserApi = TestBed.inject(UsersApi);
    spyUserApi = spyOn(mockUserApi, 'updateEmail').and.returnValues(of());

    fixture = TestBed.createComponent(UpdateEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should update mail', async () => {
    expect(component).toBeTruthy();
    const resetForm: HTMLElement = fixture.nativeElement;
    (resetForm.querySelector('#update-email') as HTMLInputElement).value = 'mail@mail.com';
    resetForm.querySelector('#update-email').dispatchEvent(new Event('input'));
    await (resetForm.querySelector('#update-email-submit') as HTMLButtonElement).click();
    resetForm.querySelector('.user-form').dispatchEvent(new Event('submit'));
    expect(spyUserApi).toHaveBeenCalled();
  });
});
