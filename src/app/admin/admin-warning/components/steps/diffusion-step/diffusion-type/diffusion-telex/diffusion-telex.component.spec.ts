import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WarningCreationData } from '@app/admin/admin-warning/models/creation-warning.model';
import { WarningAdminApi } from '@app/api/admin/warning-admin.api';
import { SerieType } from '@app/models/serie.model';
import { listWarningStatus } from '@app/models/warning.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Observable, of } from 'rxjs';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DiffusionTelexComponent } from './diffusion-telex.component';

describe('DiffusionTelexComponent', () => {
  let component: DiffusionTelexComponent;
  let fixture: ComponentFixture<DiffusionTelexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [DiffusionTelexComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        MockProvider(WarningAdminApi, {
            generateTelex$(): Observable<string> {
                return of('telex content');
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiffusionTelexComponent);
    component = fixture.componentInstance;
    const warning: WarningCreationData = {
      id: '1',
      status: listWarningStatus.DRAFT,
      prerequisites: {
        serviceId: '',
        serieId: '',
        generalAreas: [],
        warningNumber: 1001,
        year: 21,
        typeGeneral: 'AIDS_TO_NAVIGATION',
        serieType: SerieType.COASTAL_NAVIGATIONAL_WARNING,
        cancellationTime: '',
        addCancellationTimeToTelex: false,
        localityNames: []
      },
      links: {},
      warningParts: {
        featureParts: [],
        mandatoryLanguages: []
      },
      attachments: {
        attachmentIds: []
      },
      references: {
        warningPublicsReferences: [],
        georegulationReferenceIds: [],
        attachmentReferenceIds: [],
        entityReferenceIds: [],
        warningLinksPublicsReferences: []
      },
      finalizationData: {
        estimatedPublicationDate: '',
        reviewDate: '',
        internalComment: ''
      }
    };
    component.warning = warning;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not refresh TELEX if no refresh needed or form not saveable', done => {
    const testSample = [[false, true], [true, false], [false, false]];
    const spyTelexRefreshed = spyOn(component.telexRefreshed, 'emit');

    testSample.forEach(sample => {
      // Given
      component.needRefresh = sample[0];
      component.isPrerequisitesFormSavable = sample[1];

      // When
      component['refreshTelex']();

      // Then
      expect(spyTelexRefreshed).not.toHaveBeenCalled();
    })

    done();
  });

  it('should refresh TELEX if no refresh needed and form saveable', done => {
    // Given
    const spyTelexRefreshed = spyOn(component.telexRefreshed, 'emit');
    component.needRefresh = true;
    component.isPrerequisitesFormSavable = false;

    // When
    component['refreshTelex']();

    // Then
    expect(spyTelexRefreshed).not.toHaveBeenCalled();

    done();
  });
});
