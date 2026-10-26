import { Component, forwardRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InfosourceInformation } from '@app/infosource/models/infosource.model';
import { InfosourceInformationService } from '@app/infosource/services/infosource-information.service';
import { DateRange } from '@app/shared/models/date-range.model';
import { TranslateInPipe } from '@app/shared/pipes/translateIn.pipe';
import { DistanceUnit, DistanceUnitByLangs, PrecisiontByLang } from '@app/shared/services/information.service';
import { environment } from '@env/environment.default';
import { Scavenger } from '@wishtack/rx-scavenger';
import { pick } from 'lodash-es';
import Feature from 'ol/Feature';

export type ValidFeaturePartType = { [key: string]: boolean };

export const initValidFeaturePartTypeDefaultValue: ValidFeaturePartType = { 'es': false, 'en': false };

@Component({
  selector: 'infosource-input-information',
  templateUrl: './infosource-input-information.component.html',
  styleUrls: ['./infosource-input-information.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InfosourceInputInformationComponent),
    multi: true
  }]
})
export class InfosourceInputInformationComponent implements ControlValueAccessor, OnChanges, OnDestroy {

  private readonly scavenger = new Scavenger(this);

  @Input() timezone: string;
  @Input() geometries: Array<Feature> = [];
  @Input() dateRanges: Array<DateRange> = [];
  @Input() validFeaturePart: ValidFeaturePartType = initValidFeaturePartTypeDefaultValue;
  @Input() partIndex: number;

  langs: Array<string> = [];
  translatedTemplates = new Map();
  addInformationButtonStatuses = [];
  information: InfosourceInformation = {};
  onChange = (information: InfosourceInformation) => { };
  onTouched = () => { };

  availableDistanceUnits: DistanceUnit[] = [
    {
      name: 'circleDistanceUnit.meters',
      unit: environment.carto.circleDistanceUnit.meters
    },
    {
      name: 'circleDistanceUnit.nauticMiles',
      unit: environment.carto.circleDistanceUnit.nauticMiles
    }
  ];

  selectedDistanceUnitsByLang: DistanceUnitByLangs[] = [];

  availablePrecision: string[] = ['0', '1', '2', '3'];
  selectedPrecisionByLang: PrecisiontByLang[] = [];

  constructor(private readonly informationService: InfosourceInformationService,
    private readonly translateInPipe: TranslateInPipe) {
    this.langs = ['es', 'en'];
    this.buildLocalizedItems();
    this.langs.forEach(lang => {
      this.selectedDistanceUnitsByLang.push({ lang, selectedDistanceUnit: this.availableDistanceUnits[1] });
      this.selectedPrecisionByLang.push({ lang, selectedPrecision: '3' });
    });
  }

  ngOnDestroy(): void { }

  buildLocalizedItems(): void {
    this.informationService.buildTranslationsKey().forEach(e => {
      const objLangs = {};
      this.langs.forEach(l => objLangs[l] = '');
      this.translatedTemplates.set(e.key, objLangs);
      this.langs.forEach(language => {
        this.translateInPipe.transform(e.value, language)
          .pipe(this.scavenger.collect())
          .subscribe(translatedValue => this.translatedTemplates.get(e.key)[language] = translatedValue);
      });
    });
  }

  writeValue(information: InfosourceInformation): void {
    if (information && !information['es'] && information['fr']) {
      information['es'] = information['fr'];
    }
    this.information = pick(information, this.langs);
  }

  registerOnChange(fn: (information: InfosourceInformation) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  informationChanged(): void {
    this.onChange(this.information);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.langs) {
      this.writeValue(this.information);
    }
  }

  private updateInformation(lang: string, additionalInfo: string): void {
    this.information[lang] = (this.information[lang] ?? '') + (this.information[lang] ? '\n' : '') + additionalInfo;
    this.informationChanged();
  }

  addGeometry(lang: string): void {
    if (!this.geometries.length) { return; }
    this.addInformationButtonStatuses.push(`geometry-${lang}-${this.partIndex}`);
    this.updateInformation(lang, this.informationService.formatGeometries(
      this.geometries, this.translatedTemplates, lang, false,
      this.selectedDistanceUnitsByLang.find(distanceUnit => distanceUnit.lang === lang).selectedDistanceUnit.unit,
      Number(this.selectedPrecisionByLang.find(precision => precision.lang === lang).selectedPrecision)
    ));
  }

  addPeriods(lang: any): void {
    const dateRangesFiltered = this.dateRanges.filter(dr => dr.dateStart !== null || dr.dateEnd !== null);
    if (!dateRangesFiltered.length) { return; }
    this.addInformationButtonStatuses.push(`periods-${lang}-${this.partIndex}`);
    this.updateInformation(lang, this.informationService.formatDateRanges(dateRangesFiltered, this.translatedTemplates, lang, this.timezone));
  }

  wasClicked(informationToBeInserted: string, lang: string): string {
    return !this.addInformationButtonStatuses.includes(`${informationToBeInserted}-${lang}-${this.partIndex}`) ? '' : 'pi pi-check';
  }

  isMandatoryLanguage(lang: string): boolean {
    return 'es' === lang.toLowerCase();
  }
}
