import { Component, forwardRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GeoregulationPartInformation } from '@app/georegulation/models/georegulation.model';
import { GeoregulationInformationService } from '@app/georegulation/services/georegulation-information.service';
import { TranslateInPipe } from '@app/shared/pipes/translateIn.pipe';
import { DistanceUnit, DistanceUnitByLangs, PrecisiontByLang } from '@app/shared/services/information.service';
import { environment } from '@env/environment.default';
import { Scavenger } from '@wishtack/rx-scavenger';
import pick from 'lodash-es/pick';
import { Feature } from 'ol';
import { copyToClipboard, showToast } from '@shared/ui-utils';
import { TranslateService } from '@ngx-translate/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { AutoTranslationService } from '@app/shared/services/auto-translation.service';

@Component({
  selector: 'georegulation-input-informations',
  templateUrl: './georegulation-input-information.component.html',
  styleUrls: ['./georegulation-input-information.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GeoregulationInputInformationComponent),
    multi: true
  }]
})
export class GeoregulationInputInformationComponent implements ControlValueAccessor, OnChanges, OnDestroy {

  private readonly scavenger = new Scavenger(this);

  @Input() geometries: Feature[] = [];
  @Input() validFeaturePart = false;
  @Input() partIndex: number;

  langs: Array<string>;

  translatedTemplates = new Map();

  addInformationButtonStatuses = [];

  protected informationsClipBoard: GeoregulationPartInformation = {};

  informations: GeoregulationPartInformation = {};

  onChange = (information: GeoregulationPartInformation) => { };
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

  private selectedDistanceUnitsByLang: DistanceUnitByLangs[] = [];

  protected availablePrecision: string[] = ['0', '1', '2'];
  private selectedPrecisionByLang: PrecisiontByLang[] = [];

  constructor(private readonly informationService: GeoregulationInformationService,
    private readonly translate: TranslateService,
    private readonly alertMessageService: AlertMessageService,
    private readonly translateInPipe: TranslateInPipe,
    private readonly autoTranslation: AutoTranslationService) {
    this.langs = ['es', 'en'];
    this.buildLocalizedItems();
    this.langs.forEach(lang => {
      this.selectedDistanceUnitsByLang.push({ lang, selectedDistanceUnit: this.availableDistanceUnits[1] });
      this.selectedPrecisionByLang.push({ lang, selectedPrecision: '2' });
    });
  }

  ngOnDestroy(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.langs) {
      this.writeValue(this.informations);
    }
  }

  writeValue(informations: GeoregulationPartInformation): void {
    this.informations = pick(informations, this.langs);
  }

  registerOnChange(fn: (informations: GeoregulationPartInformation) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private buildLocalizedItems(): void {
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

  private informationsChanged(): void {
    this.onChange(this.informations);
  }

  // ---- PISAC (18-nov-2026): propuesta de traducción desde el español ----
  readonly translationSource = 'es';
  translatingLang: string = null;
  autoTranslatedLangs = new Set<string>();

  canProposeTranslation(lang: string): boolean {
    return this.langs?.includes(this.translationSource) && AutoTranslationService.canTranslate(this.translationSource, lang);
  }

  proposeTranslation(lang: string): void {
    const sourceText = this.informations[this.translationSource]?.trim();
    if (!sourceText || this.translatingLang) {
      return;
    }
    if (this.informations[lang]?.trim() && !window.confirm(this.translate.instant('auto-translation.confirm-overwrite'))) {
      return;
    }
    this.translatingLang = lang;
    this.autoTranslation.translate$(sourceText, this.translationSource, lang).subscribe({
      next: text => {
        this.informations[lang] = text;
        this.autoTranslatedLangs.add(lang);
        this.translatingLang = null;
        this.informationsChanged();
      },
      error: () => {
        this.translatingLang = null;
        this.alertMessageService.add({
          severity: 'warn',
          summary: this.translate.instant('auto-translation.error-title'),
          detail: this.translate.instant('auto-translation.error-detail')
        });
      }
    });
  }

  onInformationEdited(lang: string): void {
    this.autoTranslatedLangs.delete(lang);
    this.informationsChanged();
  }

  private updateInformationsClipBoard(lang: string, additionalInfo: string): void {
    this.informationsClipBoard[lang] = additionalInfo;
  }

  addGeometryToTextContent(lang: string): void {
    if (!this.geometries.length) { return; }

    this.addInformationButtonStatuses.push(`geometry-${lang}-${this.partIndex}`);

    let generatedText = this.informationService.formatGeometries(
      this.geometries, this.translatedTemplates, lang, false,
      this.selectedDistanceUnitsByLang.find(distanceUnit => distanceUnit.lang === lang).selectedDistanceUnit.unit,
      Number(this.selectedPrecisionByLang.find(precision => precision.lang === lang).selectedPrecision)
    );

    // EL PARCHE DEFINITIVO: 
    // 1. Usamos toLowerCase() por si 'lang' viene como 'EN'
    if (lang.toLowerCase() === 'en') {
      // 2. Usamos Regex (/.../gi) para buscar ignorando may�sculas y acentos extra�os.
      // Primero atacamos la frase completa
      generatedText = generatedText.replace(/�rea delimitada por:/gi, 'area bounded by:');

      // 3. Plan B: Si la frase completa falla por culpa del acento, 
      // buscamos y destruimos las palabras clave individuales
      if (generatedText.includes('delimitada')) {
        generatedText = generatedText.replace(/delimitada por:/gi, 'bounded by:');
        generatedText = generatedText.replace(/�rea/gi, 'area');
        generatedText = generatedText.replace(/�rea/gi, 'Area');
        generatedText = generatedText.replace(/afectada/gi, 'affected');
      }
    }

    this.updateInformationsClipBoard(lang, generatedText);
  }

  protected copyGeometriesLangToClipBoard($event: any, lang: string): void {
    if (!this.informationsClipBoard[lang]?.length) {
      return;
    }

    copyToClipboard(this.informationsClipBoard[lang], true);
    showToast(this.alertMessageService, this.translate.instant('georegulation.information.copy-content-success').replace('{{lang}}', lang), 'success');
    $event.preventDefault();
  }
}
