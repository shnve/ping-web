import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { FormatWarningNumberPipe } from '@app/shared/pipes/format-warning-number.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { PublicsReferencesStepComponent } from './publics-references-step.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PublicsReferencesStepComponent', () => {
  let component: PublicsReferencesStepComponent;
  let fixture: ComponentFixture<PublicsReferencesStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [PublicsReferencesStepComponent],
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        ConfirmationService,
        FormatWarningNumberPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicsReferencesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
