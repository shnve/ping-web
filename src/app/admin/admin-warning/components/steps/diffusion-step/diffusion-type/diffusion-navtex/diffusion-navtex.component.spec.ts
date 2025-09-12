import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WarningCreationData } from '@app/admin/admin-warning/models/creation-warning.model';
import { SerieType } from '@app/models/serie.model';
import { listWarningStatus } from '@app/models/warning.model';
import { TranslateModule } from '@ngx-translate/core';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DiffusionNavtexComponent } from './diffusion-navtex.component';

describe('DiffusionNavtexComponent', () => {
  let component: DiffusionNavtexComponent;
  let fixture: ComponentFixture<DiffusionNavtexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [DiffusionNavtexComponent],
    imports: [TranslateModule.forRoot()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiffusionNavtexComponent);
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
});
