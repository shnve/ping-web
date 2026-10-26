import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { WarningCreationData } from '@app/admin/admin-warning/models/creation-warning.model';
import { CreationService } from '@app/admin/admin-warning/services/creation.service';
import { DiffusionNavtexSource, SerieType } from '@app/models/serie.model';
import { DiffusionNavtexEmergencyLevel, DiffusionNavtexType, listWarningStatus } from '@app/models/warning.model';
import { DiffusionNavtexConfigurationComponent } from './diffusion-navtex-configuration.component';
import Spy = jasmine.Spy;

describe('DiffusionNavtexConfigurationComponent', () => {
  let component: DiffusionNavtexConfigurationComponent;
  let fixture: ComponentFixture<DiffusionNavtexConfigurationComponent>;
  let creationService: CreationService;
  let spyAddEndDayHourControls: Spy<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [DiffusionNavtexConfigurationComponent],
    imports: [FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()],
    providers: [
        UntypedFormBuilder,
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    creationService = TestBed.inject(CreationService);
    fixture = TestBed.createComponent(DiffusionNavtexConfigurationComponent);
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
      },
      navtexConfig: {
        emergencyLevel: DiffusionNavtexEmergencyLevel.IMPORTANT,
        communicationType: DiffusionNavtexType.A,
        endDay: 1,
        endHour: 1
      }
    };
    component.warning = warning;
    spyAddEndDayHourControls = spyOn<any>(component, 'addEndDayHourControls').and.callThrough();
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });



  it('should raise error if endDay not conform min value', done => {
    // Given
    const spyCreationService = spyOn(creationService, 'getNavtexSource').and.returnValue(DiffusionNavtexSource.N4);
    component['buildNavtexConfigurationForm']();

    // When
    component.navtexConfigurationForm.get('endDay').setValue(-1);

    // Then
    expect(spyCreationService).toHaveBeenCalled();
    expect(spyAddEndDayHourControls).toHaveBeenCalled();
    expect(component.navtexConfigurationForm.get('endDay').hasError('min')).toBeTruthy();
    done();
  });

  it('should raise error if endDay not conform max value', done => {
    // Given
    spyOn(creationService, 'getNavtexSource').and.returnValue(DiffusionNavtexSource.N4);
    component['buildNavtexConfigurationForm']();

    // When
    component.navtexConfigurationForm.get('endDay').setValue(32);

    // Then
    expect(component.navtexConfigurationForm.get('endDay').hasError('max')).toBeTruthy();
    done();
  });

  it('should raise error if endHour not conform min value', done => {
    // Given
    spyOn(creationService, 'getNavtexSource').and.returnValue(DiffusionNavtexSource.N4);
    component['buildNavtexConfigurationForm']();

    // When
    component.navtexConfigurationForm.get('endHour').setValue(-1);

    // Then
    expect(component.navtexConfigurationForm.get('endHour').hasError('min')).toBeTruthy();
    done();
  });

  it('should raise error if endHour not conform max value', done => {
    // Given
    spyOn(creationService, 'getNavtexSource').and.returnValue(DiffusionNavtexSource.N4);

    // When
    component['buildNavtexConfigurationForm']();
    component.navtexConfigurationForm.get('endHour').setValue(24);

    // Then
    expect(component.navtexConfigurationForm.get('endHour').hasError('max')).toBeTruthy();
    done();
  });

  it('should raise error if endDay and endHour are not filled together', done => {
    // Given
    spyOn(creationService, 'getNavtexSource').and.returnValue(DiffusionNavtexSource.N4);
    component['buildNavtexConfigurationForm']();

    // When
    component.navtexConfigurationForm.get('endDay').setValue(1);
    component.navtexConfigurationForm.get('endHour').setValue(null);
    fixture.detectChanges();

    // Then
    expect(component.navtexConfigurationForm.hasError('endHourShouldBeFilled')).toBeTruthy();
    done();
  });

  it('should not raise error if endDay and endHour are all null', done => {
    // Given
    spyOn(creationService, 'getNavtexSource').and.returnValue(DiffusionNavtexSource.N4);
    component.warning.navtexConfig.endDay = 2;
    component.warning.navtexConfig.endHour = 2;
    component['buildNavtexConfigurationForm']();

    // When
    component.navtexConfigurationForm.get('endDay').setValue(null);
    component.navtexConfigurationForm.get('endHour').setValue(null);
    fixture.detectChanges();

    // Then
    expect(component.navtexConfigurationForm.hasError('endDayShouldBeFilled')).toBeFalsy();
    expect(component.navtexConfigurationForm.hasError('endHourShouldBeFilled')).toBeFalsy();
    done();
  });
});
