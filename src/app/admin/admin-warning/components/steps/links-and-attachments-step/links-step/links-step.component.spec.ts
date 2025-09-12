import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { MainWarningPart } from '@app/models/warning.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { FormatWarningNumberPipe } from '@app/shared/pipes/format-warning-number.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { OrderByPipe } from 'ngx-pipes';
import { LinksStepComponent, mapWarnings } from './links-step.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('LinksStepComponent', () => {
  let component: LinksStepComponent;
  let fixture: ComponentFixture<LinksStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        LinksStepComponent,
        OrderByPipe
    ],
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        FormatWarningNumberPipe,
        OrderByPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinksStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map warnings', done => {
    // Given
    const warnings: MainWarningPart[] = [{
      id: 'id_warning',
      nameOfSeries: 'AVURNAV Local BREST',
      warningNumber: 1005,
      year: 2023
    }];

    // When
    const result = mapWarnings(warnings, new FormatWarningNumberPipe());

    // Then
    expect(result).toEqual([{
      id: 'id_warning',
      warningNumber: 'AVURNAV Local BREST 1005/23'
    }]);
    done();
  });
});
