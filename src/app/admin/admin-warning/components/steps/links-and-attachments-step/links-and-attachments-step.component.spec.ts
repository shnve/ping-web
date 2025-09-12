import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';

import { LinksAndAttachmentsStepComponent } from './links-and-attachments-step.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('LinksAndAttachmentsStepComponent', () => {
  let component: LinksAndAttachmentsStepComponent;
  let fixture: ComponentFixture<LinksAndAttachmentsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [LinksAndAttachmentsStepComponent],
    imports: [RouterModule.forRoot([])],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinksAndAttachmentsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
