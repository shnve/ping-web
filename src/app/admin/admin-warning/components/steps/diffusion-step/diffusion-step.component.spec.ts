import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { DiffusionStepComponent } from './diffusion-step.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('DiffusionStepComponent', () => {
  let component: DiffusionStepComponent;
  let fixture: ComponentFixture<DiffusionStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [DiffusionStepComponent],
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot()],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiffusionStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
