import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiffusionTelexComponent } from '@admin-warning/components/steps/diffusion-step/diffusion-type/diffusion-telex/diffusion-telex.component';
import { PrerequisitesStepComponent } from '@admin-warning/components/steps/prerequisites-step/prerequisites-step.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SeriesAdminApi } from '@app/api/admin/series-admin.api';
import { AuthService } from '@app/auth/auth.service';
import { SeriesAdminFacade } from '@app/facades/admin/series-admin.facade';
import { ServiceRole } from '@app/models/pro-user.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { Serie, SerieType } from '@app/models/serie.model';
import { SubArea } from '@app/models/sub-area.model';
import { Warning, listWarningStatus } from '@app/models/warning.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { FormatWarningNumberPipe } from '@app/shared/pipes/format-warning-number.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { getYear } from 'date-fns';
import { MockProvider } from 'ng-mocks';
import { OrderByImpurePipe, OrderByPipe } from 'ngx-pipes';
import { ConfirmationService } from 'primeng/api';
import { Observable, of } from 'rxjs';

import Spy = jasmine.Spy;

describe('PrerequisitesStepComponent', () => {
  let component: PrerequisitesStepComponent;
  let fixture: ComponentFixture<PrerequisitesStepComponent>;
  let spySeriesAdminFacadeGetSeries: Spy<any>;
  let mockSeriesAdminFacade: SeriesAdminFacade;
  let spyComponentSetDefaultWarningNumber: Spy<any>;
  const serie: Serie = {
    id: '1',
    name: 'avurnav local brest',
    type: SerieType.LOCAL_NAVIGATIONAL_WARNING,
    maritimeService: 'cnd brest',
    ranges: [[1, 999]]
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PrerequisitesStepComponent,
        OrderByPipe,
        OrderByImpurePipe,
        DiffusionTelexComponent
      ],
      imports: [RouterModule.forRoot([]),
        FormsModule,
        ReactiveFormsModule,
      TranslateModule.forRoot()],
      providers: [
        OrderByPipe,
        OrderByImpurePipe,
        PermissionsProvider,
        ConfirmationService,
        FormatWarningNumberPipe,
        MockProvider(AuthService, {
          getAuthenticatedUser(): AuthenticatedUser {
            return {
              serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
              serviceRoles: [ServiceRole.SERVICE_OPERATOR]
            } as any as AuthenticatedUser;
          }
        }),
        MockProvider(SeriesAdminApi, {
          nextAvailableNumber$(serieId: string, year: number): Observable<number> {
            return of(1);
          }
        }),
        MockProvider(SeriesAdminFacade, {
          nextAvailableNumber$(serieId: string, year: number): Observable<number> {
            return of(1);
          }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    mockSeriesAdminFacade = TestBed.inject(SeriesAdminFacade);
    spySeriesAdminFacadeGetSeries = spyOn(mockSeriesAdminFacade, 'getSeriesWithOperatorOrAdminRole$').and.returnValues(of([serie]));

    fixture = TestBed.createComponent(PrerequisitesStepComponent);
    component = fixture.componentInstance;

    spyComponentSetDefaultWarningNumber = spyOn(component, 'setDefaultWarningNumber');
    spyOn(mockSeriesAdminFacade, 'nextAvailableNumber$').withArgs('1', 2023).and.returnValues(of(1));
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should set current year as default value for warning number choice if prerequisite year is null', done => {
    expect(spySeriesAdminFacadeGetSeries).toHaveBeenCalled();
    component.onSelectSerie('1');
    const currentYear = getYear(new Date());
    expect(component.yearList.length).toEqual((currentYear + 1 - 2000) + 1);
    expect(component.yearList).toEqual(Array.from(
      { length: (currentYear + 1 - 2000) + 1 },
      (_, index) => 2000 + index
    ));
    expect(component.selectedYear).toEqual(currentYear);
    expect(spyComponentSetDefaultWarningNumber).toHaveBeenCalled();
    done();
  });

  it('should set current year as default value for warning number choice if prerequisite year is not null', done => {
    expect(spySeriesAdminFacadeGetSeries).toHaveBeenCalled();
    component.prerequisites.year = 2005;
    component.onSelectSerie('1');
    const currentYear = getYear(new Date());
    expect(component.yearList.length).toEqual((currentYear + 1 - 2000) + 1);
    expect(component.yearList).toEqual(Array.from(
      { length: (currentYear + 1 - 2000) + 1 },
      (_, index) => 2000 + index
    ));
    expect(component.selectedYear).toEqual(2005);
    expect(spyComponentSetDefaultWarningNumber).toHaveBeenCalled();
    done();
  });

  it('should set typeGeneral on selection', done => {
    // Given
    component.anInformation.prerequisites.typeGeneral = 'current_type';
    const newTypeGeneral = 'new_type';

    // When
    component.onSelectTypeGeneral(newTypeGeneral);

    // Then
    expect(component.anInformation.prerequisites.typeGeneral).toEqual(newTypeGeneral);
    expect(component.generalTypeReadonly).toBe(true);
    done();
  });

  it('should get selected part index', done => {
    // Given
    const resultMock: Map<number, boolean> = new Map();
    resultMock.set(0, true);
    resultMock.set(1, true);
    spyOn(component, 'areFeaturePartsValid').and.returnValues(resultMock);
    component.featureParts = [
      {
        information: { 'fr': 'information fr' },
        typeDetails: ['typeDetail1'],
        dateRanges: [],
        geometries: [],
        affectedAreas: []
      },
      {
        information: { 'fr': 'information fr' },
        typeDetails: ['typeDetail2'],
        dateRanges: [],
        geometries: [],
        affectedAreas: []
      }
    ];

    // When
    const result = component.getSelectedPartIndex(component.featureParts[1]);

    // Then
    expect(result).toEqual(1);
    done();
  });

  it('should remove part', done => {
    // Given
    component.viewTelex = TestBed.createComponent(DiffusionTelexComponent).componentInstance;
    const resultMock: Map<number, boolean> = new Map();
    resultMock.set(0, true);
    resultMock.set(1, true);
    spyOn(component, 'areFeaturePartsValid').and.returnValues(resultMock);

    component.featureParts = [
      {
        information: { 'fr': 'information fr' },
        typeDetails: ['typeDetail1'],
        dateRanges: [],
        geometries: [],
        affectedAreas: []
      },
      {
        information: { 'fr': 'information fr' },
        typeDetails: ['typeDetail2'],
        dateRanges: [],
        geometries: [],
        affectedAreas: []
      }
    ];

    component.selectedPart = component.featureParts[0];

    // When
    component.removePart(component.featureParts[0]);

    // Then
    expect(component.featureParts.length).toEqual(1);
    expect(component.featureParts).toEqual([
      {
        information: { 'fr': 'information fr' },
        typeDetails: ['typeDetail2'],
        dateRanges: [],
        geometries: [],
        affectedAreas: []
      }
    ]);
    done();
  });

  it('should change selected part info', done => {
    // Given
    component.viewTelex = TestBed.createComponent(DiffusionTelexComponent).componentInstance;
    spyOn(component, 'hasValidInformationOrDetails').and.returnValues(true);

    component.featureParts = [
      {
        information: { 'fr': 'information fr' },
        typeDetails: ['typeDetail1'],
        dateRanges: [],
        geometries: [],
        affectedAreas: []
      },
      {
        information: { 'fr': 'information fr' },
        typeDetails: ['typeDetail2'],
        dateRanges: [],
        geometries: [],
        affectedAreas: []
      }
    ];

    component.selectedPart = component.featureParts[1];

    // When
    component.changeSelectedPart({
      information: { 'fr': 'information fr 2' },
      typeDetails: ['typeDetail3']
    });

    // Then
    expect(component.featureParts.length).toEqual(2);
    expect(component.featureParts).toEqual([
      {
        information: { 'fr': 'information fr' },
        typeDetails: ['typeDetail1'],
        dateRanges: [],
        geometries: [],
        affectedAreas: []
      },
      {
        information: { 'fr': 'information fr 2' },
        typeDetails: ['typeDetail3'],
        dateRanges: [],
        geometries: [],
        affectedAreas: []
      }
    ]);
    done();
  });

  it('should check if feature parts valid', done => {
    // Given
    const resultMock: Map<number, boolean> = new Map();
    resultMock.set(0, true);
    spyOn(component, 'hasValidInformationOrDetails').and.returnValues(true);

    component.featureParts = [
      {
        information: { 'fr': 'information fr' },
        typeDetails: ['typeDetail1'],
        dateRanges: [],
        geometries: [],
        affectedAreas: []
      }
    ];

    // When
    const result = component.areFeaturePartsValid();

    // Then
    expect(result).toEqual(resultMock);
    done();
  });

  it('should call quick create', done => {
    // Given
    spyOn(component, 'saveForm').and.returnValues(true);
    spyOn(component, 'isCreationMode').and.returnValues(true);
    const spyQuickCreate = spyOn<any>(component, 'quickCreate').and.callThrough();

    // When
    component['quickSave']();

    // Then
    expect(spyQuickCreate).toHaveBeenCalled();
    done();
  });

  it('should call quick update', done => {
    // Given
    spyOn(component, 'saveForm').and.returnValues(true);
    spyOn(component, 'isCreationMode').and.returnValues(false);
    const spyQuickUpdate = spyOn<any>(component, 'quickUpdate').and.callThrough();

    // When
    component['quickSave']();

    // Then
    expect(spyQuickUpdate).toHaveBeenCalled();
    done();
  });

  it('should not call quick create nor quick update', done => {
    // Given
    spyOn(component, 'saveForm').and.returnValues(false);
    const spyQuickUpdate = spyOn<any>(component, 'quickUpdate').and.callThrough();
    const spyQuickCreate = spyOn<any>(component, 'quickCreate').and.callThrough();

    // When
    component['quickSave']();

    // Then
    expect(spyQuickUpdate).not.toHaveBeenCalled()
    expect(spyQuickCreate).not.toHaveBeenCalled();
    done();
  });

  it('should call creationService.create()', done => {
    // Given
    const warning: Warning = {
      id: '1',
      status: listWarningStatus.NOT_SAVED,
      globalWarningType: 'WARNING',
      nameOfSeries: 'serie1',
      publicationTime: null,
      year: 2021,
      featureParts: [{
        affectedAreas: [],
        geometries: []
      }],
      generalAreas: {},
      warningHazardTypeGeneral: 'warningHazarTypeGeneral',
      warningNumber: 1001,
      serieType: SerieType.LOCAL_NAVIGATIONAL_WARNING,
      serieId: '1'
    };

    spyOn(component, 'saveForm').and.returnValues(true);
    const spyCreationService = spyOn(component['creationService'], 'create').and.returnValues(of(warning));

    // When
    component['quickCreate']();

    // Then
    expect(spyCreationService).toHaveBeenCalled();
    expect(component['creationService'].getWarningData().id).toEqual('1');
    expect(component['creationService'].getWarningData().status).toEqual(listWarningStatus.NOT_SAVED);
    expect(localStorage.getItem('warningId')).toEqual('1');
    done();
  });

  it('should do quick save when refresh', done => {
    // Given
    component.viewTelex = TestBed.createComponent(DiffusionTelexComponent).componentInstance;
    const spyQuickSave = spyOn<any>(component, 'quickSave');

    // When
    component.viewTelex.needRefresh = true;
    component['refreshTelex']();

    // Then
    expect(spyQuickSave).toHaveBeenCalled();
    done();
  });

  it('should add subscription on init form', done => {
    // Given
    const spyAddSubscribeToRefresh = spyOn<any>(component, 'subscribeToFormValuesChangesForTelex').and.callThrough();
    const spySubscriptionQuickSave = spyOn(component.quickSaved, 'subscribe').and.callThrough();

    // When
    component.initForm();

    // Then
    expect(spyAddSubscribeToRefresh).toHaveBeenCalled();
    expect(spySubscriptionQuickSave).toHaveBeenCalled();
    done();
  });

  it('should not add subscription on init form if status is published', done => {
    // Given
    const spyAddSubscribeToRefresh = spyOn<any>(component, 'subscribeToFormValuesChangesForTelex').and.callThrough();
    const spySubscriptionQuickSave = spyOn(component.quickSaved, 'subscribe').and.callThrough();
    component.anInformation.status = listWarningStatus.PUBLISHED;

    // When
    component.initForm();

    // Then
    expect(spyAddSubscribeToRefresh).not.toHaveBeenCalled();
    expect(spySubscriptionQuickSave).not.toHaveBeenCalled();
    done();
  });

  it('should not add subscription on init form if status is cancelled', done => {
    // Given
    const spyAddSubscribeToRefresh = spyOn<any>(component, 'subscribeToFormValuesChangesForTelex').and.callThrough();
    const spySubscriptionQuickSave = spyOn(component.quickSaved, 'subscribe').and.callThrough();
    component.anInformation.status = listWarningStatus.CANCELLED;

    // When
    component.initForm();

    // Then
    expect(spyAddSubscribeToRefresh).not.toHaveBeenCalled();
    expect(spySubscriptionQuickSave).not.toHaveBeenCalled();
    done();
  });

  it('should receive subscription when warning have been quick save emit', done => {
    // Given
    component.viewTelex = TestBed.createComponent(DiffusionTelexComponent).componentInstance;
    const spyGenerateDiffusion = spyOn(component.viewTelex, 'generateDiffusion').and.callFake(() => { });
    const emitter = component.quickSaved;

    // When
    emitter.emit();

    // Then
    expect(spyGenerateDiffusion).toHaveBeenCalled();
    done();
  });

  it('should check warning number if current step is prerequisite when quickSave', done => {
    // Given
    component.currentStep = '/prerequisites';
    spyOn(component, 'saveForm').and.returnValues(true);
    spyOn(component, 'isCreationMode').and.returnValues(false);
    const spyQuickUpdate = spyOn<any>(component, 'quickUpdate').and.callThrough();
    const spyCheckWarningNumber = spyOn<any>(component, 'checkWarningNumber').and.callThrough();

    // When
    component['quickSave']();

    // Then
    expect(spyQuickUpdate).toHaveBeenCalled();
    expect(spyCheckWarningNumber).toHaveBeenCalled();
    done();
  });

  it('should handle save error if saveForm return false when quickSave', done => {
    // Given
    component.currentStep = '/prerequisites';
    spyOn(component, 'saveForm').and.returnValues(false);
    spyOn(component, 'isCreationMode').and.returnValues(false);
    const spyQuickUpdate = spyOn<any>(component, 'quickUpdate').and.callThrough();
    const spyCheckWarningNumber = spyOn<any>(component, 'checkWarningNumber').and.callThrough();
    const spyHandleSaveError = spyOn<any>(component, 'handleSaveError').and.callThrough();

    // When
    component['quickSave']();

    // Then
    expect(spyQuickUpdate).toHaveBeenCalledTimes(0);
    expect(spyCheckWarningNumber).toHaveBeenCalled();
    expect(spyHandleSaveError).toHaveBeenCalled();
    done();
  });

  it('should check warning number if current step is prerequisite when save', done => {
    // Given
    component.currentStep = '/prerequisites';
    spyOn(component, 'saveForm').and.returnValues(true);
    spyOn(component, 'isCreationMode').and.returnValues(false);
    const spyUpdate = spyOn<any>(component, 'update').and.callThrough();
    const spyCheckWarningNumber = spyOn<any>(component, 'checkWarningNumber').and.callThrough();

    // When
    component['save']();

    // Then
    expect(spyUpdate).toHaveBeenCalled();
    expect(spyCheckWarningNumber).toHaveBeenCalled();
    done();
  });

  it('should handle save error if saveForm return false when save', done => {
    // Given
    component.currentStep = '/prerequisites';
    spyOn(component, 'saveForm').and.returnValues(false);
    spyOn(component, 'isCreationMode').and.returnValues(false);
    const spyQuickUpdate = spyOn<any>(component, 'quickUpdate').and.callThrough();
    const spyCheckWarningNumber = spyOn<any>(component, 'checkWarningNumber').and.callThrough();
    const spyHandleSaveError = spyOn<any>(component, 'handleSaveError').and.callThrough();

    // When
    component['save']();

    // Then
    expect(spyQuickUpdate).toHaveBeenCalledTimes(0);
    expect(spyCheckWarningNumber).toHaveBeenCalled();
    expect(spyHandleSaveError).toHaveBeenCalled();
    done();
  });

  it('should check warning number when clik on nextPage()', done => {
    // Given
    const spyCheckWarningNumber = spyOn<any>(component, 'checkWarningNumber').and.callThrough();
    const spyCreateOrUpdateAN = spyOn<any>(component, 'createOrUpdateAN').and.callThrough();

    // When
    component.nextPage();

    // Then
    expect(spyCheckWarningNumber).toHaveBeenCalled();
    expect(spyCreateOrUpdateAN).toHaveBeenCalled();
    done();
  });

  it('should check warning number when clik on jumpToStep()', done => {
    // Given
    const spyCheckWarningNumber = spyOn<any>(component, 'checkWarningNumber').and.callThrough();
    const spyCreateOrUpdateAN = spyOn<any>(component, 'createOrUpdateAN').and.callThrough();

    // When
    component.jumpToStep();

    // Then
    expect(spyCheckWarningNumber).toHaveBeenCalled();
    expect(spyCreateOrUpdateAN).toHaveBeenCalled();
    done();
  });

  it('should add an area if not already present and remove one which is not selected', done => {
    // Given
    component.prerequisites.generalAreas = [{ id: 'area1', position: 1 }, { id: 'area3', position: 3 }];
    component.selectedAreas = [
      { id: 'area1', name: 'Area 1', urn: '', internationalName: '', geom: null, subAreas: [] },
      { id: 'area3', name: 'Area 3', urn: '', internationalName: '', geom: null, subAreas: [] }
    ];
    component.selectedLocalities = new Map<string, Array<SubArea>>([
      ['area1', []],
      ['area3', []]
    ]);
    const mockSubAreas: Array<SubArea> = [
      { id: 'area1', name: 'Area 1', urn: '', internationalName: '', geom: null, subAreas: [] },
      { id: 'area2', name: 'Area 2', urn: '', internationalName: '', geom: null, subAreas: [] }
    ];
    spyOn<any>(component, 'removeGeneralArea').and.callThrough();
    spyOn<any>(component, 'onAddArea').and.callThrough();

    // When
    component.onSelectArea(mockSubAreas);

    // Then
    expect(component.prerequisites.generalAreas).toEqual([
      { id: 'area1', position: 1 },
      { id: 'area2', position: 2 }
    ]);
    expect(component['removeGeneralArea']).toHaveBeenCalledWith('area3');
    expect(component['removeGeneralArea']).toHaveBeenCalledTimes(1);
    expect(component.onAddArea).toHaveBeenCalled();
    expect(component.prerequisites.generalAreas.length).toEqual(2);
    expect(component.selectedLocalities.has('area3')).toBeFalse();
    done();
  });

  it('should select areas and clear localities', done => {
    // Given
    const mockSubAreas: Array<SubArea> = [
      { id: 'area1', name: 'Area 1', urn: '', internationalName: '', geom: null, subAreas: [] },
      { id: 'area2', name: 'Area 2', urn: '', internationalName: '', geom: null, subAreas: [] }
    ];
    spyOn(component, 'onAddArea');

    // When
    component.onSelectArea(mockSubAreas);

    // Then
    expect(component.selectedAreas).toEqual(mockSubAreas);
    expect(component.checkedLocalities).toEqual([]);
    expect(component.onAddArea).toHaveBeenCalledTimes(2);
    expect(component.onAddArea).toHaveBeenCalledWith('area1');
    expect(component.onAddArea).toHaveBeenCalledWith('area2');
    done();
  });

  it('should add an area if not already present', done => {
    // Given
    component.prerequisites.generalAreas = [{ id: 'area1', position: 1 }];
    spyOn(component, 'refreshSelectedAreas');

    // When
    component.onAddArea('area2');

    // Then
    expect(component.prerequisites.generalAreas).toEqual([
      { id: 'area1', position: 1 },
      { id: 'area2', position: 2 }
    ]);
    expect(component.refreshSelectedAreas).toHaveBeenCalled();
    done();
  });

  it('should not add an area if already present', done => {
    // Given
    component.prerequisites.generalAreas = [{ id: 'area1', position: 1 }];
    spyOn(component, 'refreshSelectedAreas');

    // When
    component.onAddArea('area1');

    // Then
    expect(component.prerequisites.generalAreas).toEqual([{ id: 'area1', position: 1 }]);
    expect(component.refreshSelectedAreas).not.toHaveBeenCalled();
    done();
  });

  it('should not add an area if the warning is published', done => {
    // Given
    spyOn(component, 'isPublished').and.returnValue(true);
    component.prerequisites.generalAreas = [{ id: 'area1', position: 1 }];
    spyOn(component, 'refreshSelectedAreas');

    // When
    component.onAddArea('area2');

    // Then
    expect(component.prerequisites.generalAreas).toEqual([{ id: 'area1', position: 1 }]);
    expect(component.refreshSelectedAreas).not.toHaveBeenCalled();
    done();
  });

  it('should remove an area and update positions', done => {
    // Given
    component.prerequisites.generalAreas = [
      { id: 'area1', position: 1 },
      { id: 'area2', position: 2 },
      { id: 'area3', position: 3 }
    ];
    component.selectedAreas = [
      { id: 'area1', name: 'Area 1', urn: '', internationalName: '', geom: null, subAreas: [] },
      { id: 'area2', name: 'Area 2', urn: '', internationalName: '', geom: null, subAreas: [] },
      { id: 'area3', name: 'Area 3', urn: '', internationalName: '', geom: null, subAreas: [] }
    ];
    component.selectedLocalities = new Map<string, Array<SubArea>>([
      ['area1', []],
      ['area2', []],
      ['area3', []]
    ]);
    spyOn(component, 'refreshSelectedAreas');
    spyOn(component.anForm.get('selectedAreaControl'), 'setValue');
    component.viewTelex = TestBed.createComponent(DiffusionTelexComponent).componentInstance;


    // When
    component.onRemoveArea('area2');

    // Then
    expect(component.prerequisites.generalAreas).toEqual([
      { id: 'area1', position: 1 },
      { id: 'area3', position: 2 }
    ]);
    expect(component.selectedAreas).toEqual([
      { id: 'area1', name: 'Area 1', urn: '', internationalName: '', geom: null, subAreas: [] },
      { id: 'area3', name: 'Area 3', urn: '', internationalName: '', geom: null, subAreas: [] }
    ]);
    expect(component.selectedLocalities.has('area2')).toBeFalse();
    expect(component.refreshSelectedAreas).toHaveBeenCalled();
    expect(component.anForm.get('selectedAreaControl').setValue).toHaveBeenCalledWith(component['getSelectedAreaFiltered']());
    done();
  });

  it('should not remove an area if the warning is published', done => {
    // Given
    spyOn(component, 'isPublished').and.returnValue(true);
    component.prerequisites.generalAreas = [
      { id: 'area1', position: 1 },
      { id: 'area2', position: 2 }
    ];
    spyOn(component, 'refreshSelectedAreas');

    // When
    component.onRemoveArea('area2');

    // Then
    expect(component.prerequisites.generalAreas).toEqual([
      { id: 'area1', position: 1 },
      { id: 'area2', position: 2 }
    ]);
    expect(component.refreshSelectedAreas).not.toHaveBeenCalled();
    done();
  });
});
