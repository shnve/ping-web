import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { NgxCaptchaComponent } from '@binssoft/ngx-captcha';
import { TranslateModule } from '@ngx-translate/core';
import { AccountEditComponent } from './account-edit.component';
describe('AccountEditComponent', () => {
  let component: AccountEditComponent;
  let fixture: ComponentFixture<AccountEditComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    await TestBed.configureTestingModule({
    declarations: [AccountEditComponent, NgxCaptchaComponent],
    imports: [FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot()],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
