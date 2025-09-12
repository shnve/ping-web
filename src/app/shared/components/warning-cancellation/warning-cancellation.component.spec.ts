import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { SerieType } from '@app/models/serie.model';
import { AdminWarning } from '@app/models/warning.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { WarningCancellationService } from '@app/shared/services/warning-cancellation-service';
import { TranslateModule } from '@ngx-translate/core';
import { WarningCancellationComponent } from './warning-cancellation.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('WarningCancellationComponent', () => {
  let component: WarningCancellationComponent;
  let fixture: ComponentFixture<WarningCancellationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [WarningCancellationComponent],
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        WarningCancellationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningCancellationComponent);
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
