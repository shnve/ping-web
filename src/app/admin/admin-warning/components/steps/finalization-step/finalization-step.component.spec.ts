import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { FinalizationStepComponent } from './finalization-step.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('FinalizationStepComponent', () => {
  let component: FinalizationStepComponent;
  let fixture: ComponentFixture<FinalizationStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FinalizationStepComponent],
    imports: [RouterModule.forRoot([]),
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalizationStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });
});
