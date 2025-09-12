import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxFlowModule } from '@flowjs/ngx-flow';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { AttachmentsStepComponent } from '@app/admin/admin-warning/components/steps/links-and-attachments-step/attachments-step/attachments-step.component';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { AttachmentService } from '@app/shared/services/attachment.service';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { CreationService } from '../../../../services/creation.service';


describe('AttachmentsStepComponent', () => {
  let component: AttachmentsStepComponent;
  let fixture: ComponentFixture<AttachmentsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AttachmentsStepComponent],
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        NgxFlowModule],
    providers: [
        PermissionsProvider,
        MockProvider(AttachmentService, {
            checkFileRequirements$(filename, fileSize) {
                return of('');
            }
        }),
        MockProvider(CreationService, {
            getWarningData() {
                return {
                    status: 'NOT_SAVED',
                    prerequisites: {
                        serviceId: '',
                        serieId: '',
                        serieType: null,
                        generalAreas: [],
                        localityNames: [],
                        warningNumber: null,
                        year: null,
                        typeGeneral: null,
                        cancellationTime: null,
                        addCancellationTimeToTelex: false,
                        timezone: null,
                        serieName: null
                    },
                    links: {
                        cancelledWarningIds: [],
                        replacedWarningIds: [],
                        parentWarningIds: [],
                        infosourcesIds: [],
                        infosources: [],
                        maritimeEntitiesIds: [],
                        georegulationIds: []
                    },
                    attachments: {
                        attachmentIds: [],
                        attachmentFiles: []
                    },
                    references: {
                        warningPublicsReferences: [],
                        georegulationReferenceIds: [],
                        attachmentReferenceIds: [],
                        entityReferenceIds: [],
                        warningLinksPublicsReferences: []
                    },
                    warningParts: {
                        featureParts: [],
                        mandatoryLanguages: [],
                        optionalLanguages: []
                    },
                    finalizationData: {
                        estimatedPublicationDate: null,
                        reviewDate: null,
                        internalComment: null
                    }
                };
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
