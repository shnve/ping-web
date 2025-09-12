import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SerieType } from '@app/models/serie.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { FormatTypeGeneralPipe } from '@app/shared/pipes/format-type-general.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { FormatWarningNumberPipe } from '@shared/pipes/format-warning-number.pipe';
import { FormatWarningTitlePipe } from '@shared/pipes/format-warning-title.pipe';
import { ButtonModule } from 'primeng/button';
import { AdminWarning } from '../../../../models/warning.model';
import { WarningModalDetailComponent } from './warning-modal-detail.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('WarningModalDetailComponent', () => {
  let component: WarningModalDetailComponent;
  let fixture: ComponentFixture<WarningModalDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FormatWarningNumberPipe, FormatWarningTitlePipe, WarningModalDetailComponent, FormatDatetimePipeMock, LocalizedDatePipe, FormatTypeGeneralPipe],
    imports: [TranslateModule.forRoot(),
        ButtonModule],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningModalDetailComponent);
    component = fixture.componentInstance;
    const warning: AdminWarning = {
      featureParts: [],
      globalWarningType: 'WARNING',
      id: '1',
      nameOfSeries: 'nameOfSeries',
      warningNumber: 1001,
      year: 21,
      generalAreas: { fr: ['generalArea'] },
      localities: {},
      warningHazardTypeGeneral: 'AIDS_TO_NAVIGATION',
      publicationTime: new Date(),
      serieType: SerieType.LOCAL_NAVIGATIONAL_WARNING,
      serieId: '1',
      canBePublished: false
    };

    component.warning = warning;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Pipe({ name: 'formatDatetime' })
class FormatDatetimePipeMock implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}
