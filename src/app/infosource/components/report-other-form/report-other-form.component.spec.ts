import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

import { ReportOtherFormComponent } from './report-other-form.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ReportOtherFormComponent', () => {
  let component: ReportOtherFormComponent;
  let fixture: ComponentFixture<ReportOtherFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ReportOtherFormComponent],
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot()],
    providers: [UntypedFormBuilder, PermissionsProvider, ConfirmationService,
        {
            provide: ActivatedRoute,
            useValue: {
                paramMap: of(new Map(Object.entries({ id: 123 })))
            }
        }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportOtherFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
