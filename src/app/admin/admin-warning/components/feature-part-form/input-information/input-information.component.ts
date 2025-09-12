import { CreationService } from '@admin-warning/services/creation.service';
import { Component, forwardRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FeaturePartInformation, WarningCreationData } from '@app/admin/admin-warning/models/creation-warning.model';
import { WarningInformationService } from '@app/admin/admin-warning/services/warning-information.service';
import { listTypeExpression, listWarningHazardTypeDetails, listWarningHazardTypeGeneral, TRANSLATE_LIST_TYPE_EXPRESSION } from '@app/models/warning.model';
import { DistanceUnit, TypeExpression } from '@app/shared/services/information.service';
import { environment } from '@env/environment.default';
import { TranslateInPipe } from '@shared/pipes/translateIn.pipe';
import { Scavenger } from '@wishtack/rx-scavenger';
import { pick } from 'lodash-es';
import Feature from 'ol/Feature';
interface WarningTypeGeneral {
  value?: string, items?: string[]
}

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'aw-input-information',
  templateUrl: './input-information.component.html',
  styleUrls: ['./input-information.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputInformationComponent),
    multi: true
  }]
})
export class InputInformationComponent implements ControlValueAccessor, OnChanges, OnInit, OnDestroy {
  @Input() anInformation: WarningCreationData;
  @Input() geometries: Array<Feature> = [];
  @Input() affectedAreas: Array<Feature> = [];
  @Input() typeDetails: Array<string> = [];
  @Input() validFeaturePart = false;
  @Input() partIndex: number;
  @Input() isBathy = false;

  private readonly scavenger = new Scavenger(this);
  langs: Array<string> = [];
  translatedOptions = new Map();
  translatedTemplates = new Map();
  listWarningTypesDetails: string[] = [];
  addInformationButtonStatuses = [];
  information: FeaturePartInformation = {};
  onChange = (information: FeaturePartInformation) => { };
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
  selectedDistanceUnit: DistanceUnit = this.availableDistanceUnits[1];

  availableTypeExpression: TypeExpression[];
  selectedTypeExpression: TypeExpression = null;

  availablePrecision: string[] = ['0', '1', '2'];
  selectedPrecision: string = '2';

  constructor(private readonly informationService: WarningInformationService,
    private readonly translateInPipe: TranslateInPipe,
    private readonly translate: TranslateService,
    private readonly creationService: CreationService) { }

  ngOnInit(): void {
    this.availableTypeExpression = Object.entries(listTypeExpression)
      .map(([key, val]) => ({
        type: key,
        pathTypeExpression: TRANSLATE_LIST_TYPE_EXPRESSION[val]
      }));
    if (this.anInformation) {
      this.langs = [...this.anInformation.warningParts.mandatoryLanguages, ...this.anInformation.warningParts.optionalLanguages];
    }
    const typeWarningTypeGeneral = this.creationService.getWarningData().prerequisites?.typeGeneral;
    const groups: WarningTypeGeneral[] = listWarningHazardTypeGeneral.find(({ key }) => key === typeWarningTypeGeneral)?.groups;
    this.listWarningTypesDetails = groups?.map(group => group.items).reduce((acc, items) => acc.concat(items), []) || [];
    this.buildLocalizedItems();
  }

  ngOnDestroy(): void { }

  ngOnChanges(changes): void {
    if (changes.langs) {
      this.information = pick(this.information, this.langs);
    }
  }

  buildLocalizedItems(): void {
    listWarningHazardTypeDetails
      .filter(({ key }) => this.listWarningTypesDetails.includes(key)).forEach(e => {
        this.langs.forEach(language => {
          if (!this.translatedOptions.get(language)) {
            this.translatedOptions.set(language, []);
          }
          this.translateInPipe.transform(e.value, language)
            .pipe(this.scavenger.collect())
            .subscribe(translatedValue => this.translatedOptions.get(language).push({ key: e.key, value: translatedValue }));
        });
      });

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

  writeValue(information): void {
    this.information = pick(information, this.langs);
  }

  registerOnChange(fn: (information: FeaturePartInformation) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected informationChanged(): void {
    this.langs.forEach(lang => {
      this.information[lang] = this.information[lang]?.trim();
    });

    this.onChange(this.information);
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
      this.selectedDistanceUnit.unit,
      Number(this.selectedPrecision), this.isBathy
    ));
  }

  addZone(lang: any): void {
    if (!this.affectedAreas.length) { return; }
    this.addInformationButtonStatuses.push(`zone-${lang}-${this.partIndex}`);
    this.updateInformation(lang, this.informationService.formatGeometries(
      this.affectedAreas, this.translatedTemplates, lang, true,
      this.selectedDistanceUnit.unit,
      Number(this.selectedPrecision)
    ));
  }

  addInEffectWarnings(lang: any): void {
    const subscription = this.informationService.getPublishedWarnings$(this.anInformation.prerequisites.serieId)
      .subscribe(res => {
        const cancellableWarnings = this.creationService.getWarningData().links.cancelledWarningIds;
        const itemsWithoutCancellableWarnings = res._embedded?.items?.slice().filter(item =>
          cancellableWarnings.every(warningId => warningId && item.id !== warningId));
        if (itemsWithoutCancellableWarnings?.length) {
          this.updateInformation(lang, this.informationService.formatPublishedWarnings(itemsWithoutCancellableWarnings, this.translatedTemplates, lang));
          this.addInformationButtonStatuses.push(`published-${lang}-${this.partIndex}`);
        } else {
          this.updateInformation(lang, this.informationService.formatCurrentWarning(this.creationService.getWarningData(), this.translatedTemplates, lang) + '\n' + this.informationService.noOtherWarning(this.translatedTemplates, lang));
        }
        subscription.unsubscribe();
      });
  }

  addTypeExpression(lang: any): void {
    if (!!this.selectedTypeExpression) {
      const pathTypeExpression = this.selectedTypeExpression.pathTypeExpression;
      this.addInformationButtonStatuses.push(`typeExpression-${lang}-${this.partIndex}`);
      this.translateInPipe.transform(pathTypeExpression, lang)
        .pipe(this.scavenger.collect())
        .subscribe(translatedValue => this.updateInformation(lang, translatedValue));
    }
  }

  wasClicked(informationToBeInserted: string, lang: string): string {
    return !this.addInformationButtonStatuses.includes(`${informationToBeInserted}-${lang}-${this.partIndex}`) ? '' : 'pi pi-check';
  }

  isMandatoryLanguage(lang: string): boolean {
    return this.anInformation.warningParts.mandatoryLanguages.includes(lang);
  }

  protected containsNonEmptyInformation(lang: string): boolean {
    return (!this.information[lang] || this.information[lang]?.trim().length === 0);
  }
}
