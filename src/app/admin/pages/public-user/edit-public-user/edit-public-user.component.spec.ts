import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { EditPublicUserComponent } from './edit-public-user.component';
import Spy = jasmine.Spy;

describe('EditPublicUserComponent', () => {
  let component: EditPublicUserComponent;
  let fixture: ComponentFixture<EditPublicUserComponent>;
  let mockUserApi: UsersApi;
  let mockAuthService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPublicUserComponent],
      imports: [RouterTestingModule],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting(), PermissionsProvider]
    })
      .compileComponents();
  });

  beforeEach(() => {
    mockUserApi = TestBed.inject(UsersApi);
    mockAuthService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(EditPublicUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
