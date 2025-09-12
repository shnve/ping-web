import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import MaritimeService from '@app/models/maritime-service.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { MockProvider } from 'ng-mocks';
import { Observable, of } from 'rxjs';

import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { SurveyProcessingStatusTranslationPipe } from '@app/survey/pipes/survey-processing-status-translation.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { SurveyTablesComponent } from './survey-tables.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SurveyTablesComponent', () => {
  let component: SurveyTablesComponent;
  let fixture: ComponentFixture<SurveyTablesComponent>;
  let mockAuthService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SurveyTablesComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        SurveyProcessingStatusTranslationPipe,
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: { paramMap: convertToParamMap({ surveyId: '6cac9acb-927e-4394-b523-edfe754f335c' }) }
            },
        },
        MockProvider(MaritimeServicesApi, {
            findByServiceIds(ids: string[]): Observable<MaritimeService[]> {
                return of([{ id: '1', name: 'my-service', maritimeEntities: [] }]);
            }
        }),
        MockProvider(AuthService),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();

    mockAuthService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(SurveyTablesComponent);
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

  it('should change tabsClass and tabs if bri', done => {
    // Given
    spyOn(mockAuthService, 'isBri').and.returnValue(true);

    // When
    component.ngOnInit();

    // Then
    expect(component.tabsClass).toEqual('one-tab');
    expect(component.tabs.length).toEqual(1);
    done();
  });

  it('should change tabsClass and tabs if not bri', done => {
    // Given
    spyOn(mockAuthService, 'isBri').and.returnValue(false);

    // When
    component.ngOnInit();

    // Then
    expect(component.tabsClass).toEqual('three-tabs');
    expect(component.tabs.length).toEqual(3);
    done();
  });
});
