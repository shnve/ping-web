import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { StepTransitionButtonComponent } from './step-transition-button.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StepTransitionButtonComponent', () => {
  let component: StepTransitionButtonComponent;
  let fixture: ComponentFixture<StepTransitionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StepTransitionButtonComponent],
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot()],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepTransitionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
