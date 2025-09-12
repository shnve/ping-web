import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

import { ControlUserEnabledStatusComponent } from './control-user-enabled-status.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ControlUserEnabledStatusComponent', () => {
  let component: ControlUserEnabledStatusComponent;
  let fixture: ComponentFixture<ControlUserEnabledStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ControlUserEnabledStatusComponent],
    imports: [ReactiveFormsModule, TranslateModule.forRoot()],
    providers: [PermissionsProvider, ConfirmationService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlUserEnabledStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
