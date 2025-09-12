import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { SurveyTestComponent } from './survey-test.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SurveyTestComponent', () => {
  let component: SurveyTestComponent;
  let fixture: ComponentFixture<SurveyTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SurveyTestComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        ConfirmationService,
        UntypedFormBuilder,
        TranslateService,
        {
            provide: ActivatedRoute,
            useValue: {
                paramMap: of(new Map(Object.entries({ id: 123 })))
            }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(SurveyTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });
});
