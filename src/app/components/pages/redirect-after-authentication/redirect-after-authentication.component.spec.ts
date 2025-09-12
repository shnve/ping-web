import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';

import { RedirectAfterAuthenticationComponent } from './redirect-after-authentication.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RedirectAfterAuthenticationComponent', () => {
  let component: RedirectAfterAuthenticationComponent;
  let fixture: ComponentFixture<RedirectAfterAuthenticationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [RedirectAfterAuthenticationComponent],
    imports: [TranslateModule.forRoot(),
        RouterModule.forRoot([])],
    providers: [
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectAfterAuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
