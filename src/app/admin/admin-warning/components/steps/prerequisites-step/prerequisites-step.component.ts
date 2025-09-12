import { DiffusionTelexComponent } from '@admin-warning/components/steps/diffusion-step/diffusion-type/diffusion-telex/diffusion-telex.component';
import { FeaturePart, FeaturePartInformation, WarningCreationData, WarningCreationPrerequisites } from '@admin-warning/models/creation-warning.model';
import { CreationService } from '@admin-warning/services/creation.service';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { fieldRequired } from '@app/components/shared/validators/field-required.validator';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { SeriesAdminFacade } from '@app/facades/admin/series-admin.facade';
import { WarningsFacade } from '@app/facades/admin/warnings.facade';
import MaritimeService from '@app/models/maritime-service.model';
import { Serie, SerieType } from '@app/models/serie.model';
import { SubArea } from '@app/models/sub-area.model';
import { listWarningHazardTypeGeneral } from '@app/models/warning.model';
import { FormatWarningNumberPipe } from '@app/shared/pipes/format-warning-number.pipe';
import { TranslateService } from '@ngx-translate/core';
import { LoaderService } from '@sig/services/loader.service';
import { getYear } from 'date-fns';
import { cloneDeep } from 'lodash-es';
import Geometry from 'ol/geom/Geometry';
import { VectorSourceEvent } from 'ol/source/Vector';
import { ConfirmationService } from 'primeng/api';
import { Calendar } from 'primeng/calendar';
import { Observable, of, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { getNumberForPart } from '../../feature-part-utils';
import { GeometriesFormComponent } from '../../geometries-form/geometries-form.component';
import { mapWarnings, WarningSelectOption } from '../links-and-attachments-step/links-step/links-step.component';
import { StepComponent } from '../step.component';
import { environment } from './../../../../../../environments/environment.local';
import { LocalityComponent } from './locality/locality.component';

export type FeaturePartMainInfo = Pick<FeaturePart, 'information' | 'typeDetails'>;

const REQUIRED_CONTROL_FOR_TELEX = [
  'serie',
  'numberReservation',
  'selectedAreaControl',
  'typeGeneral',
  'cancellationTime',
  'addCancellationTimeToTelex',
  'selectedCancellableWarnings'
];

@Component({
  selector: 'aw-prerequisites-step',
  templateUrl: './prerequisites-step.component.html',
  styleUrls: ['../step.component.scss', './prerequisites-step.component.scss']
})
@Localize()
export class PrerequisitesStepComponent extends StepComponent implements OnInit, OnDestroy, OnChangeLang {
  @ViewChild('geometriesForm') geometriesForm: GeometriesFormComponent;
  @ViewChild('pCalendar') pCalendar: Calendar;
  @ViewChild('viewTelex') viewTelex: DiffusionTelexComponent;
  featureParts: FeaturePart[] = [];
  selectedPart: FeaturePart;
  partsInfo: FeaturePartInformation[] = [];
  routerEventsSubscription: Subscription;

  anForm: UntypedFormGroup;
  series: Serie[];
  areasList: Array<SubArea>;
  localitiesList: Array<any>;
  availableCategories: Array<{ key: string, value: string }>;
  prerequisites: WarningCreationPrerequisites;
  seriesSubscription: Subscription;
  seriesOnUpdateSubscription: Subscription;
  numberReservationRequired: boolean;
  serieEditable: boolean;
  generalTypeRequired: boolean;
  serieReadonly: boolean;
  generalTypeReadonly: boolean;
  modelNameRequired: boolean;
  isNotSavedStatus: boolean;
  selectedArea: SubArea;
  selectedAreas: Array<SubArea> = [];
  selectedLocalities: Map<string, Array<SubArea>>;
  checkedLocalities: Array<SubArea>;
  subAreasSubscription: Subscription;
  saveLocalitySubscription: Subscription;
  missingSector = false;
  serieId: string;
  serieName: string;
  serieType: SerieType;
  availableWarningNumber: number;
  newLocalityName: string;
  newLocalityInternationalName: string;
  selectedYear: number;
  yearList: number[];
  private warningCreationDataSubscription: Subscription;
  subscription: Subscription;
  cancellableWarnings: WarningSelectOption[];
  cancellableWarningsSubscription: Subscription;
  isPublishedWarning = false;
  isWarningModel = false;
  protected enableAutoCancellationChoice = false;

  constructor(protected readonly router: Router,
    private readonly formBuilder: UntypedFormBuilder,
    protected readonly creationService: CreationService,
    private readonly seriesAdminFacade: SeriesAdminFacade,
    private readonly confirmationService: ConfirmationService,
    public readonly translate: TranslateService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly warningsFacade: WarningsFacade,
    private readonly formatWarningNumberPipe: FormatWarningNumberPipe,
    protected readonly alertMessageService: AlertMessageService,
    private readonly authService: AuthService,
    protected elemRef: ElementRef,
    protected readonly loader: LoaderService) {
    super(router, creationService, alertMessageService, loader);
    this.baseElementRef = this.elemRef;
    this.currentStep = '/prerequisites';
    this.nextStep = '/links-and-attachments';
    this.prerequisites = this.anInformation.prerequisites;
    this.series = [];
    this.initRequiredFlags(this.anInformation);
    this.buildLocalizedItems();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.seriesSubscription = this.getSeries();
    this.routerEventsSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        this.updateFeaturePartsFromForm();
        this.creationService.setFeatureParts(this.featureParts);
        this.routerEventsSubscription.unsubscribe();
        this.routerEventsSubscription = null;
      });
    this.warningCreationDataSubscription = this.creationService.warningCreationDataSubject
      .subscribe(data => {
        this.seriesOnUpdateSubscription = this.getSeries();
      });

    this.initForm();
  }

  loadLinkeableWarnings(serieId: string): void {
    this.cancellableWarningsSubscription = this.warningsFacade.getCancellable$(serieId)
      .subscribe(cancellableWarnings => this.cancellableWarnings = mapWarnings(cancellableWarnings, this.formatWarningNumberPipe));
  }

  private getSeries(): Subscription {
    return this.seriesAdminFacade.getSeriesWithOperatorOrAdminRole$()
      .pipe(
        tap(series => {
          this.series = series;
          if (this.series.length === 1) {
            const warningData = this.creationService.getWarningData();
            warningData.prerequisites.serieId = this.series[0].id;
            this.creationService.setWarningData(warningData);
          }
        }),
        tap(() => this.updateForm())
      )
      .subscribe(() => {
        if (this.prerequisites.serieId) { setTimeout(() => this.onSelectSerie(this.prerequisites.serieId)); }
        if (this.prerequisites.generalAreas.length) { this.refreshSelectedAreas(); }
        if (this.prerequisites.year) { setTimeout(() => this.onSelectYear(this.prerequisites.year)); }
        this.initForm();
      });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.routerEventsSubscription) { this.routerEventsSubscription.unsubscribe(); }
    if (this.seriesSubscription) { this.seriesSubscription.unsubscribe(); }
    if (this.seriesOnUpdateSubscription) { this.seriesOnUpdateSubscription.unsubscribe(); }
    if (this.subAreasSubscription) { this.subAreasSubscription.unsubscribe(); }
    if (this.saveLocalitySubscription) { this.saveLocalitySubscription.unsubscribe(); }
    if (this.warningCreationDataSubscription) { this.warningCreationDataSubscription.unsubscribe(); }
    if (this.cancellableWarningsSubscription) { this.cancellableWarningsSubscription.unsubscribe(); }
  }

  resetDefaultTimeIfNeeded(): void {
    const hasCancellationtime = !!this.cancellationTime.value;
    if (!hasCancellationtime) {
      this.pCalendar.currentHour = 0;
      this.pCalendar.currentMinute = 0;
    }
  }

  initForm(): void {
    this.anForm = this.formBuilder.group({
      serie: [this.prerequisites.serieId, Validators.required],
      selectedAreaControl: [this.getSelectedAreaFiltered(), Validators.required],
      useAsModel: [false],
      modelName: [this.prerequisites.modelName ?? '', fieldRequired(this.modelNameRequired)],
      numberReservation: [this.prerequisites.warningNumber, Validators.pattern('^[0-9]*$')],
      typeGeneral: [this.prerequisites.typeGeneral, fieldRequired(this.generalTypeRequired)],
      cancellationTime: [this.prerequisites.cancellationTime],
      addCancellationTimeToTelex: [this.prerequisites.addCancellationTimeToTelex ?? true],
      selectedCancellableWarnings: [this.anInformation.links.cancelledWarningIds]
    });

    if (!this.isPublished() && !this.isAnCancelledStatus(this.anInformation)) {
      this.subscribeToFormValuesChangesForTelex();
    }
  }

  private subscribeToFormValuesChangesForTelex(): void {
    REQUIRED_CONTROL_FOR_TELEX.forEach(control =>
      this.anForm.get(control).valueChanges.pipe(this.scavenger.collect()).subscribe(() => {
        const canCheckChangeForTelex = this.isAnDraftStatus(this.anInformation) || this.isAnModelStatus(this.anInformation);
        if (this.viewTelex) {
          this.checkIfPrerequisitesFormSavable();
          if (canCheckChangeForTelex && !this.anForm.get(control).pristine) {
            this.viewTelex.needRefresh = true;
          }
        }
      })
    );

    this.quickSaved.pipe(this.scavenger.collect()).subscribe(() => this.viewTelex?.generateDiffusion());
  }

  private checkIfFormValuesChangedValid(requiredControlForTelex: string[]): boolean {
    return requiredControlForTelex.every(abstractControl => this.anForm.get(abstractControl).valid) && this.updateAndCheckIfFeaturesPartValid();
  }

  protected refreshTelex(): void {
    this.submitted = true;
    this.quickSave();
  }

  protected needRefreshTelexForLocalities(): void {
    if (!this.viewTelex) {
      return;
    }

    this.checkIfPrerequisitesFormSavable();
    this.viewTelex.needRefresh = this.isAnDraftStatus(this.anInformation) || this.isAnModelStatus(this.anInformation);
  }

  private updateAndCheckIfFeaturesPartValid(): boolean {
    this.updateFeaturePartsFromForm();
    this.creationService.setFeatureParts(this.featureParts);
    return this.checkFeatureParts(this.featureParts, this.anInformation);
  }

  checkIfSomeWarningsCanNotBeCancelled(): void {
    if (!this.anInformation?.id || !this.isDraft()) {
      return;
    }

    const warningIdsWhichCouldBeCancelled = this.creationService.getWarningData().links.cancelledWarningIds ?? [];
    if (warningIdsWhichCouldBeCancelled.length) {
      this.creationService.getWarningIdsWhichCanBeCancelled(this.anInformation.id)
        .pipe(this.scavenger.collect())
        .subscribe(warningIdsWhichCanBeCancelled => {
          if (warningIdsWhichCanBeCancelled.length !== warningIdsWhichCouldBeCancelled.length) {
            this.creationService.getWarningData().links.cancelledWarningIds = warningIdsWhichCanBeCancelled;

            // force refresh to avoid 'null' display in field
            this.anForm.get('selectedCancellableWarnings').setValue(this.creationService.getWarningData().links.cancelledWarningIds);
            
            this.alertMessageService.add({
              summary: 'message.summary.warn',
              severity: 'warn',
              detail: 'message.summary.warn.update.cancelled-warnings'
            });
          }
        });
    }
  }

  getValidWarningNumber(): any {
    if (!this.prerequisites.warningNumber || this.prerequisites.warningNumber === 0) { return ''; }
    return this.prerequisites.warningNumber;
  }

  updateForm(): void {
    if (!this.anForm) { return; }
    this.anInformation = this.creationService.getWarningData();
    this.checkIfSomeWarningsCanNotBeCancelled();
    this.initRequiredFlags(this.anInformation);
    this.prerequisites = this.anInformation.prerequisites;
    const mapWarningHazardTypeGeneral = new Map(listWarningHazardTypeGeneral.map(e => [e.key, e.value]));
    const matchFound = [...mapWarningHazardTypeGeneral].find(([key, val]) => val === this.prerequisites.typeGeneral);

    if (this.prerequisites.generalAreas.length) {
      this.loadAreaList();
      this.refreshSelectedAreas();
    }

    if (matchFound) {
      this.prerequisites.typeGeneral = matchFound[0];
    }
    this.anForm.setValue({
      serie: this.prerequisites.serieId,
      selectedAreaControl: this.getSelectedAreaFiltered(),
      useAsModel: false,
      modelName: this.prerequisites.modelName ?? '',
      numberReservation: this.getValidWarningNumber(),
      typeGeneral: this.prerequisites.typeGeneral,
      cancellationTime: this.prerequisites.cancellationTime ?? '',
      addCancellationTimeToTelex: this.prerequisites.addCancellationTimeToTelex,
      selectedCancellableWarnings: [this.anInformation.links.cancelledWarningIds]
    });

    if (this.isPublished()) {
      this.anForm.get('numberReservation').disable();
      this.anForm.get('cancellationTime').disable();
    } else {
      this.anForm.get('numberReservation').enable();
      this.anForm.get('cancellationTime').enable();
    }
  }

  private getSelectedAreaFiltered(): Array<SubArea> {
    return this.areasList.filter(area => this.selectedAreas.map(area => area.id).includes(area.id));
  }

  get serie(): AbstractControl {
    return this.anForm.get('serie');
  }

  get selectedAreaControl(): AbstractControl {
    return this.anForm.get('selectedAreaControl');
  }

  get numberReservation(): AbstractControl {
    return this.anForm.get('numberReservation');
  }

  get typeGeneral(): AbstractControl {
    return this.anForm.get('typeGeneral');
  }

  get useAsModel(): AbstractControl {
    return this.anForm.get('useAsModel');
  }

  get addCancellationTimeToTelex(): AbstractControl {
    return this.anForm.get('addCancellationTimeToTelex');
  }

  get cancellationTime(): AbstractControl {
    return this.anForm.get('cancellationTime');
  }

  get modelName(): AbstractControl {
    return this.anForm.get('modelName');
  }

  checkWarningNumber(): Observable<boolean> {
    if (!(this.numberReservation.touched && this.numberReservation.dirty) || !this.numberReservation.value?.length) {
      return of(true);
    }

    if (!this.numberReservation.valid) {
      this.handleSaveError(null, 'number-reservation-invalid');
      return of(false);
    }

    const warningNumber = Number(this.numberReservation.value);
    if (this.prerequisites.warningNumber === warningNumber) {
      return of(true);
    }

    return this.seriesAdminFacade.isWarningNumberAvailable$(this.serieId, warningNumber, this.selectedYear);
  }

  saveForm(force = false): boolean {
    this.missingSector = !(this.selectedAreas && this.selectedAreas.length);
    if (!force && !this.anForm.valid) {
      this.showToast(`admin-warning.creation.errors.invalid-form-warning`, 'error');
      return false;
    }
    if (!this.anForm.valid || this.missingSector || (this.useAsModel.value && !this.modelName.value.length)) { return false; }

    if (!this.updateAndCheckIfFeaturesPartValid()) {
      this.showToast(`admin-warning.creation.errors.parts-invalid`, 'error');
      return false;
    }

    const formValue = this.anForm.value;
    this.prerequisites = {
      serieId: formValue.serie,
      serieName: this.serieName,
      serieType: this.serieType,
      warningNumber: (this.numberReservation.value ? +this.numberReservation.value : null),
      generalAreas: this.selectedAreas.map(area => ({ id: area.id, position: area.position })),
      useAsModel: formValue.useAsModel,
      modelName: formValue.modelName,
      localityNames: LocalityComponent.convertMapSectorLocalitiesToWarningLocalityNamesArray(this.selectedLocalities),
      serviceId: (this.series.find(serie => serie.id === formValue.serie).maritimeService as MaritimeService).id,
      year: !this.numberReservation.value ? null : this.selectedYear,
      typeGeneral: formValue.typeGeneral,
      selectedLocalities: this.selectedLocalities,
      cancellationTime: this.cancellationTime.value,
      addCancellationTimeToTelex: this.addCancellationTimeToTelex.value
    };
    const typeGeneral = this.creationService.getWarningData().prerequisites.typeGeneral;
    if (typeGeneral && typeGeneral !== this.prerequisites.typeGeneral) {
      this.creationService.getFeatureParts().forEach(featurePart => featurePart.typeDetails = []);
    }
    this.creationService.getWarningData().prerequisites = this.prerequisites;
    this.isModelCreation = this.isCreationMode() && this.useAsModel.value;
    if (!this.isWarningModel) {
      this.creationService.getWarningData().links.cancelledWarningIds = formValue.selectedCancellableWarnings;
    }
    return true;
  }

  private goToNextStep(event?: string): void {
    this.checkWarningNumber()
      .pipe(this.scavenger.collect())
      .subscribe(isAvailable => {
        this.validWarningNumber = isAvailable;
        this.checkIfPrerequisitesFormSavable();
        if (isAvailable) {
          this.createOrUpdateAN(event);
        }
      });
  }

  checkIfPrerequisitesFormSavable(): void {
    if (this.viewTelex) {
      this.viewTelex.isPrerequisitesFormSavable = this.validWarningNumber && this.checkIfFormValuesChangedValid(REQUIRED_CONTROL_FOR_TELEX);
    }
  }

  nextPage(event?: string): void {
    this.goToNextStep(event);
  }

  jumpToStep(event?: string): void {
    this.goToNextStep(event);
  }

  createOrUpdateAN(event?: string): void {
    if (this.saveForm()) {
      this.isCreationMode() ? this.create(false) : this.update(false, event);
      this.nextStep = event ?? this.nextStep;
      return;
    } else {
      this.handleSaveError(null, 'form-invalid');
    }

    this.submitted = true;
  }

  onSelectTypeGeneral(typeGeneral: string): void {
    this.anInformation.prerequisites.typeGeneral = typeGeneral;
    if (typeGeneral) {
      this.generalTypeReadonly = true;
      this.selectedPart = this.featureParts?.length && !this.isPublished() ? this.featureParts[0] : null;
    }
  }

  onSelectSerie(id: string): void {
    if (!id || id === '') { return; }
    // TODO : next commented 'if' statement to prevent calling nextAvailableNumber API twice
    // TODO : should refactor whole step, currently series API is also called twice
    // if (this.serieId === id) { return; }
    this.serieId = id;
    const currSerie = this.series.find(s => s.id === this.serieId);
    this.serieName = currSerie.name;
    this.serieType = currSerie.type;
    this.anInformation.prerequisites.serieId = this.serieId;
    this.anInformation.prerequisites.serieName = this.serieName;
    this.anInformation.warningParts.mandatoryLanguages = currSerie.mandatoryLanguages;
    this.anInformation.warningParts.optionalLanguages = currSerie.optionalLanguages;
    this.loadAreaList();
    this.serieReadonly = true;
    const currentYear = getYear(new Date());
    const yearArrayRange = (start, stop, step) =>
      Array.from(
        { length: ((stop - start) / step) + 1 },
        (_, index) => start + index * step
      );
    this.yearList = yearArrayRange(environment.minYearForWarningNumber, currentYear + 1, 1);
    this.cdRef.detectChanges();
    this.selectedYear = this.yearList.find(y => y === this.prerequisites.year) ?? currentYear;
    if (!this.prerequisites.warningNumber) {
      this.setDefaultWarningNumber();
    }
    this.creationService.setNavtexSource(currSerie.navtexSource);

    this.isPublishedWarning = this.isPublished();
    this.isWarningModel = this.isModel();
    if (this.serieId && !this.isWarningModel) {
      this.loadLinkeableWarnings(this.serieId);
    }
  }

  setDefaultWarningNumber(): void {
    this.seriesAdminFacade.nextAvailableNumber$(this.serieId, this.selectedYear).subscribe(availableWarningNumber => this.availableWarningNumber = availableWarningNumber);
  }

  loadAreaList(): void {
    if (!this.serieId) { return; }
    this.areasList = this.series.find(serie => serie.id === this.serieId)?.subAreas as Array<SubArea>;
  }

  onSelectArea(selectedSubArea: Array<SubArea>): void {
    if (!selectedSubArea) { return; }

    const previousSelectedAreas = cloneDeep(this.selectedAreas);
    this.selectedAreas = selectedSubArea;

    // check if some areas are removed
    previousSelectedAreas.filter(area => !selectedSubArea.some(subArea => subArea.id === area.id)).forEach(removedArea => this.removeGeneralArea(removedArea.id));

    // clear localities selection
    this.checkedLocalities = [];

    // check localities for selected area
    if (this.selectedAreas?.length) {
      // is all area in selectedAreas are already in generalAreas
      const isAllAreaInGeneralAreas = this.selectedAreas.every(area => this.prerequisites.generalAreas.some(generalArea => generalArea.id === area.id));
      if (!isAllAreaInGeneralAreas) {
        this.selectedAreas.forEach(element => this.onAddArea(element.id));
      } else {
        // if some areas are removed from selectedAreas using primeng multiselect, synchronize remaining selectedAreas with generalAreas
        this.refreshSelectedAreas();
      }
    }
  }

  private removeGeneralArea(areaId: string): void {
    if (this.isPublished()) {
      return;
    }
    this.prerequisites.generalAreas = this.prerequisites.generalAreas.filter(area => area.id !== areaId).map((area, index) => {
      area.position = index + 1;
      return area;
    });
    this.selectedLocalities.delete(areaId);
  }

  onAddArea(areaId: string): void {
    if (this.isPublished()) { return; }
    if (!this.prerequisites?.generalAreas?.map(area => area.id).includes(areaId)) {
      const position = this.prerequisites.generalAreas.length ? Math.max(...this.prerequisites.generalAreas.map(area => area.position)) + 1 : 1;
      this.prerequisites.generalAreas.push({ id: areaId, position });
      this.refreshSelectedAreas();
    }
  }

  loadLocalitiesList(): void {
    this.localitiesList = this.areasList.filter(area => this.selectedArea.id === area.id && area.subAreas?.length)
      .flatMap(area => area.subAreas);
  }

  confirmReset(event: Event): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('admin-warning.creation.labels.reset-serie-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.resetSerie()
    });
  }

  confirmResetTypeGeneral(event: Event): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('admin-warning.creation.labels.reset-type-general-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.resetTypeGeneral()
    });
  }

  resetSerie(): void {
    this.creationService.initWarningData();
    this.anInformation = this.creationService.getWarningData();
    this.creationService.warningChange.next(this.anInformation);
  }

  resetTypeGeneral(): void {
    this.prerequisites.typeGeneral = null;
    this.anForm.get('typeGeneral').setValue(null);
    this.anForm.get('typeGeneral').markAsDirty({ onlySelf: true });
    this.generalTypeReadonly = false;
    this.featureParts.forEach(featurePart => featurePart.typeDetails = []);
    this.updateFeaturePartsFromForm();
    this.selectedPart = null;
    this.anInformation.prerequisites.typeGeneral = null;
  }

  resetStep(): void {
    this.featureParts = [];
    this.selectedPart = null;
    this.prerequisites = this.anInformation.prerequisites;
    this.initRequiredFlags(this.anInformation);
    this.refreshSelectedAreas();
    this.initForm();
    this.serieReadonly = false;
    this.generalTypeReadonly = false;
  }

  onChangeLang(): void {
    this.buildLocalizedItems();
  }

  buildLocalizedItems(): void {
    this.availableCategories = listWarningHazardTypeGeneral.map(({ key, value }) => ({
      key,
      value: this.translate.instant(value)
    })
    );
  }

  initRequiredFlags(anInformation: WarningCreationData): void {
    this.availableWarningNumber = null;
    this.areasList = [];
    this.localitiesList = [];
    this.serieReadonly = false;
    this.selectedAreas = [];
    this.checkedLocalities = [];
    this.newLocalityName = null;
    this.newLocalityInternationalName = null;
    this.selectedYear = null;
    this.yearList = [];
    this.selectedLocalities = anInformation.prerequisites.selectedLocalities || new Map<string, Array<SubArea>>();
    this.numberReservationRequired = this.isAnDraftStatus(anInformation);
    this.generalTypeRequired = this.isAnNotSavedStatus(anInformation);
    this.serieEditable = this.generalTypeRequired;
    this.generalTypeReadonly = false;
    this.modelNameRequired = this.isAnModelStatus(anInformation);
    this.isNotSavedStatus = this.isAnNotSavedStatus(anInformation);
    this.featureParts = anInformation.warningParts.featureParts;
    this.featureParts.forEach(featurePart => this.parseDateRanges(featurePart));
    this.selectedPart = this.featureParts?.length && !this.isPublished() ? this.featureParts[0] : null;
    this.enableAutoCancellationChoice = !this.isAnPublishedStatus(anInformation) && !this.isAnCancelledStatus(anInformation);
  }

  onRemoveArea(id: string): void {
    if (this.isPublished()) { return; }
    this.selectedAreas = this.selectedAreas.filter(area => area.id !== id);
    this.removeGeneralArea(id);
    this.anForm.get('selectedAreaControl').setValue(this.getSelectedAreaFiltered());
    this.refreshSelectedAreas();

    if (this.viewTelex) {
      this.viewTelex.needRefresh = true;
    }
  }

  refreshSelectedAreas(): void {
    this.selectedAreas = [];
    this.prerequisites.generalAreas.map(area => area.id).forEach(areaId => {
      const foundArea = cloneDeep(this.areasList.find(area => area.id === areaId));
      if (foundArea) {
        foundArea.position = this.prerequisites.generalAreas.find(area => area.id === areaId).position;
        this.selectedAreas.push(foundArea);
      }
    });
  }

  createCopy(area: SubArea | string): SubArea | string {
    if (typeof area === 'string') {
      return area;
    }
    return {
      id: area.id,
      name: area.name,
      urn: area.urn,
      internationalName: area.internationalName,
      geom: area.geom,
      subAreas: []
    };
  }

  isSelectedAreaAdded(): boolean {
    return this.selectedAreas.some(s => s.id === this.selectedArea.id);
  }

  onSelectYear($event: any): void {
    if (($event === null) || (this.selectedYear === null && $event !== getYear(new Date()))) { return; }
    this.selectedYear = $event as number;
    this.setDefaultWarningNumber();
  }

  addFeaturePart(): void {
    this.updateFeaturePartsFromForm();
    this.selectedPart = {
      information: {},
      typeDetails: [],
      dateRanges: [],
      affectedAreas: [],
      geometries: []
    };
    this.featureParts = [...this.featureParts, this.selectedPart];
  }

  selectPart(featurePart: FeaturePart): void {
    if (featurePart === this.selectedPart) {
      return;
    }
    this.updateFeaturePartsFromForm();
    this.selectedPart = featurePart;
    this.cdRef.detectChanges();
  }

  changeSelectedPart(partMainInfo: FeaturePartMainInfo): void {
    const selectedPartIndex = this.featureParts.findIndex(part => part === this.selectedPart);
    this.featureParts[selectedPartIndex].information = partMainInfo.information;
    this.featureParts[selectedPartIndex].typeDetails = partMainInfo.typeDetails;
    // Copy array to detect change
    this.featureParts = [...this.featureParts];
    this.viewTelex.needRefresh = true;
    this.checkIfPrerequisitesFormSavable();
  }

  updateFeaturePartsFromForm(): void {
    if (!this.geometriesForm || !this.selectedPart) {
      return;
    }

    const selectedPartIndex = this.featureParts.findIndex(part => part === this.selectedPart);
    this.selectedPart.geometries = this.geometriesForm.getGeometries();
    this.selectedPart.affectedAreas = this.geometriesForm.getAffectedAreas();
    this.featureParts[selectedPartIndex] = this.selectedPart;
    // Copy array to detect change
    this.featureParts = [...this.featureParts];
  }

  getSelectedPartIndex(featurePart: FeaturePart): number {
    return this.featureParts.findIndex(part => part === featurePart);
  }

  getGeometries(): any[] {
    if (!this.geometriesForm) {
      return [];
    }
    return this.geometriesForm.getGeometries();
  }

  getAffectedAreas(): any[] {
    if (!this.geometriesForm) {
      return [];
    }
    return this.geometriesForm.getAffectedAreas();
  }

  removePart(partToRemove: FeaturePart): void {
    const partToRemoveIndex = this.featureParts.findIndex(part => part === partToRemove);
    this.featureParts.splice(partToRemoveIndex, 1);
    if (partToRemove === this.selectedPart) {
      this.selectedPart = null;
    }
    this.featureParts = [...this.featureParts];
    this.viewTelex.needRefresh = true;
    this.checkIfPrerequisitesFormSavable();
  }

  hasValidInformationOrDetails(featurePart: FeaturePart): boolean {
    return super.hasValidInformationOrDetails(featurePart, this.anInformation);
  }

  areFeaturePartsValid(): Map<number, boolean> {
    return this.featureParts.reduce((map, featurePart, index) => {
      const valid = this.hasValidInformationOrDetails(featurePart) && this.hasValidDateRanges(featurePart);
      map.set(index, valid);
      return map;
    }, new Map<number, boolean>());
  }

  getNumberForSearchedPart(searchedPart: FeaturePart): number {
    return getNumberForPart(searchedPart, this.featureParts);
  }

  onGeometryFormFeatureChange(event: VectorSourceEvent<Geometry>): void {
    if (['addfeature', 'removefeature'].includes(event.type)) {
      this.updateFeaturePartsFromForm();
    }
  }
}
