import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AccountValidationComponent } from './account-validation.component';
import {PermissionsProvider} from '@app/privileges/permissions-provider';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AccountValidationComponent', () => {
  let component: AccountValidationComponent;
  let fixture: ComponentFixture<AccountValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AccountValidationComponent],
    imports: [RouterModule.forRoot([])],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
