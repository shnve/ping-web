import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Localize, OnChangeLang } from '@app/core/localize';
import { EpsgService } from '@app/services/epsg.service';
import { TranslatedOptionList, translateI18nKeyValueArray } from '@app/shared/ui-utils';
import { SurveyCoordinatesOrder, SurveyVerticalRef, SurveyZDirection, TRANSLATIONS_LIST_COORDINATES_ORDER, TRANSLATIONS_LIST_FILE_SEPARATOR, TRANSLATIONS_LIST_VERTICAL_REF, TRANSLATIONS_LIST_Z_DIRECTION } from '@app/survey/models/survey.model';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { SelectItem } from 'primeng/api';
import { tap } from 'rxjs/operators';

const EPSG_4326 = 'EPSG:4326 ';

export interface SharedSurveyBathyMetadataDescriptionFormData {
  geographicFormat: boolean;
  epsg: string;
  coordinatesOrder: SurveyCoordinatesOrder;
  directionZ: SurveyZDirection;
  verticalRef: SurveyVerticalRef;
  fileSeparator: string;
}

@Component({
  selector: 'shared-survey-bathy-metadata-description',
  templateUrl: './shared-survey-bathy-metadata-description.component.html',
  styleUrls: ['../../abstract-survey.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SharedSurveyBathyMetadataDescriptionComponent),
      multi: true
    }
  ]
})
@Localize()
export class SharedSurveyBathyMetadataDescriptionComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChangeLang {

  @Input() submitted: boolean;
  @Input() isDeposit = false;
  @Input() allFieldsRequired = true;

  private readonly scavenger = new Scavenger(this);

  survey: SharedSurveyBathyMetadataDescriptionFormData;
  protected form: UntypedFormGroup;
  protected epsgItems: SelectItem[] = [];
  protected availableCoordinatesOrder: TranslatedOptionList;
  protected availableZDirection: TranslatedOptionList;
  protected availableVerticalRef: TranslatedOptionList;
  protected availableSeparator: TranslatedOptionList;
  protected isGeometricFormatSelected = true;

  ZERO_HYDRO = TRANSLATIONS_LIST_VERTICAL_REF[0].key;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private readonly epsgService: EpsgService,
    private readonly translate: TranslateService) {
    this.refreshEpsgCodes();
    this.buildLocalizedItems();
  }

  onChange = (survey: SharedSurveyBathyMetadataDescriptionFormData) => { };
  onTouched = () => { };

  writeValue(survey: SharedSurveyBathyMetadataDescriptionFormData): void {
    if (!survey) { return; }
    this.survey = survey;
    this.isGeometricFormatSelected = this.survey.geographicFormat;
    if (!this.survey?.epsg) { return; }
    this.refreshEpsgCodes();
    this.refreshCoordinatesOrder();
  }

  registerOnChange(fn: (survey: SharedSurveyBathyMetadataDescriptionFormData) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void { }

  onChangeLang(event: LangChangeEvent): void {
    this.buildLocalizedItems();
  }

  protected initForm(): void {
    this.form = this.formBuilder.group({
      geographicFormat: [this.survey?.geographicFormat, this.allFieldsRequired ? Validators.required : null],
      epsg: [this.survey?.epsg, this.allFieldsRequired ? Validators.required : null],
      coordinatesOrder: [this.survey?.coordinatesOrder, this.allFieldsRequired ? Validators.required : null],
      directionZ: [this.survey?.directionZ, this.allFieldsRequired ? Validators.required : null],
      verticalRef: [this.survey?.verticalRef, this.allFieldsRequired ? Validators.required : null],
      fileSeparator: [this.survey?.fileSeparator, this.allFieldsRequired ? Validators.required : null]
    });
  }

  get isFormValid(): boolean {
    return this.form.valid;
  }

  protected refreshEpsgCodes(): void {
    this.epsgService.getEpsgCodes$(this.isGeometricFormatSelected)
      .pipe(
        this.scavenger.collect(),
        tap(codes => {
          this.epsgItems = codes.map<SelectItem<string>>(code => {
            return { label: `${SharedSurveyBathyMetadataDescriptionComponent.getLabelFromCode(code)}`, value: code };
          });
        }),
        tap(() => this.refreshCoordinatesOrder())
      )
      .subscribe(() => {
        this.epsg.setValue(this.survey?.epsg);
        if (this.isGeometricFormatSelected) {
          this.epsg.setValue(EPSG_4326);
        }
        this.coordinatesOrder.setValue(this.isGeometricFormatSelected ? this.survey?.coordinatesOrder : SurveyCoordinatesOrder.XYZ);
      });
  }

  private static getLabelFromCode(code: string): string {
    return code === EPSG_4326 ? `${code}"WGS84"` : code;
  }

  protected refreshCoordinatesOrder(): void {
    const filteredList = TRANSLATIONS_LIST_COORDINATES_ORDER.filter(item => !this.isGeometricFormatSelected && item.key === SurveyCoordinatesOrder.XYZ
      || this.isGeometricFormatSelected && [SurveyCoordinatesOrder.LAT_LONG_Z, SurveyCoordinatesOrder.LONG_LAT_Z].includes(item.key)
    );
    this.availableCoordinatesOrder = translateI18nKeyValueArray(this.translate, filteredList);
  }

  protected changeGraphicFormat(event: any): void {
    this.isGeometricFormatSelected = !!event.value;
    this.refreshEpsgCodes();
    this.refreshCoordinatesOrder();
  }

  protected buildLocalizedItems(): void {
    this.refreshCoordinatesOrder();
    this.availableZDirection = translateI18nKeyValueArray(this.translate, TRANSLATIONS_LIST_Z_DIRECTION);
    this.availableVerticalRef = translateI18nKeyValueArray(this.translate, TRANSLATIONS_LIST_VERTICAL_REF);
    this.availableSeparator = translateI18nKeyValueArray(this.translate, TRANSLATIONS_LIST_FILE_SEPARATOR);
  }

  get epsg(): AbstractControl {
    return this.form?.get('epsg');
  }

  get geographicFormat(): AbstractControl {
    return this.form?.get('geographicFormat');
  }

  get coordinatesOrder(): AbstractControl {
    return this.form?.get('coordinatesOrder');
  }

  get directionZ(): AbstractControl {
    return this.form?.get('directionZ');
  }

  get verticalRef(): AbstractControl {
    return this.form?.get('verticalRef');
  }

  get fileSeparator(): AbstractControl {
    return this.form?.get('fileSeparator');
  }
}
