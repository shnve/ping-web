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

import { AlertMessageService } from '@app/core/alert-message.service';
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
  @Input() selectedAreas: Array<any> = [];
  @Input() selectedLocalities: Map<string, Array<any>>;
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

  affectedChartsText: string = '';

  constructor(private readonly informationService: WarningInformationService,
    private readonly translateInPipe: TranslateInPipe,
    private readonly translate: TranslateService,
    private readonly creationService: CreationService,
    private readonly alertMessages: AlertMessageService) { }

  ngOnInit(): void {
    this.availableTypeExpression = Object.entries(listTypeExpression)
      .map(([key, val]) => ({
        type: key,
        pathTypeExpression: TRANSLATE_LIST_TYPE_EXPRESSION[val]
      }));
    if (this.anInformation) {
      this.langs = [...this.anInformation.warningParts.mandatoryLanguages, ...this.anInformation.warningParts.optionalLanguages];
      this.langs.sort((a, b) => a === 'es' ? -1 : (b === 'es' ? 1 : 0));
    }
    const typeWarningTypeGeneral = this.creationService.getWarningData().prerequisites?.typeGeneral;
    const groups: WarningTypeGeneral[] = listWarningHazardTypeGeneral.find(({ key }) => key === typeWarningTypeGeneral)?.groups;
    this.listWarningTypesDetails = groups?.map(group => group.items).reduce((acc, items) => acc.concat(items), []) || [];
    this.buildLocalizedItems();
  }

  ngOnDestroy(): void { }

  ngOnChanges(changes): void {
    if (changes.anInformation && this.anInformation?.warningParts) {
      this.langs = [...(this.anInformation.warningParts.mandatoryLanguages || []), ...(this.anInformation.warningParts.optionalLanguages || [])];
      this.langs.sort((a, b) => a === 'es' ? -1 : (b === 'es' ? 1 : 0));
      this.information = pick(this.information, this.langs);
      this.buildLocalizedItems();
    }
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

  // 1. NUESTRA FUNCIÓN MATEMÁTICA NATIVA CON SOPORTE DE PRECISIÓN Y CONTROL DE DESBORDE
  private formatGps(deg: number, isLat: boolean, precision = 2): string {
    const dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
    let absDeg = Math.abs(deg);
    const prec = Number(precision ?? 2);
    let d = Math.floor(absDeg);
    let mNum = (absDeg - d) * 60;

    // Evitamos desborde a 60.00 minutos al redondear
    if (Number(mNum.toFixed(prec)) >= 60) {
      d += 1;
      mNum = 0;
    }

    const padLen = prec > 0 ? 3 + prec : 2;
    const m = mNum.toFixed(prec).padStart(padLen, '0');
    const dStr = d.toString().padStart(isLat ? 2 : 3, '0');
    return `${dStr}-${m}${dir}`;
  }

  private formatFeaturesList(features: Feature[], lang: string, isAffectedArea = false): string {
    const isEn = lang?.toLowerCase() === 'en';
    const precision = Number(this.selectedPrecision ?? 2);
    const lines: string[] = [];

    features.forEach(f => {
      const clone = f.clone();
      const geom = clone.getGeometry();

      if (geom) {
        if (Math.abs(geom.getExtent()[0]) > 180) {
          geom.transform('EPSG:3857', 'EPSG:4326');
        }

        const type = geom.getType();

        if (type === 'Point') {
          const coords = (geom as any).getCoordinates();
          const lat = this.formatGps(coords[1], true, precision);
          const lon = this.formatGps(coords[0], false, precision);
          const prefix = isAffectedArea
            ? (isEn ? 'Affected area in position ' : 'Área afectada en posición ')
            : (isEn ? 'in position ' : 'en posición ');
          lines.push(`${prefix}${lat} ${lon}`);
        } else if (type === 'Polygon') {
          const preamble = isAffectedArea
            ? (isEn ? 'Affected area bounded by:' : 'Área afectada delimitada por:')
            : (isEn ? 'area bounded by:' : 'área delimitada por:');
          lines.push(preamble);
          const coords = (geom as any).getCoordinates()[0];
          const len = coords.length > 3 ? coords.length - 1 : coords.length;
          for (let i = 0; i < len; i++) {
            lines.push(this.formatGps(coords[i][1], true, precision) + ' ' + this.formatGps(coords[i][0], false, precision));
          }
        } else if (type === 'LineString') {
          const preamble = isAffectedArea
            ? (isEn ? 'Affected line joining:' : 'Línea afectada que une:')
            : (isEn ? 'line joining:' : 'línea que une:');
          lines.push(preamble);
          const coords = (geom as any).getCoordinates();
          for (let i = 0; i < coords.length; i++) {
            lines.push(this.formatGps(coords[i][1], true, precision) + ' ' + this.formatGps(coords[i][0], false, precision));
          }
        } else if (type === 'Circle') {
          const center = (geom as any).getCenter();
          const radiusMeters = (geom as any).getRadius();
          const isNm = this.selectedDistanceUnit?.name?.includes('nauticMiles');
          const radiusVal = isNm ? (radiusMeters / 1852).toFixed(1) : Math.round(radiusMeters).toString();
          const unitStr = isNm ? (isEn ? 'NM' : 'MN') : (isEn ? 'meters' : 'metros');
          const lat = this.formatGps(center[1], true, precision);
          const lon = this.formatGps(center[0], false, precision);
          const preamble = isAffectedArea
            ? (isEn
              ? `Affected area within a radius of ${radiusVal} ${unitStr} of ${lat} ${lon}`
              : `Área afectada dentro de un radio de ${radiusVal} ${unitStr} de ${lat} ${lon}`)
            : (isEn
              ? `area within a radius of ${radiusVal} ${unitStr} of ${lat} ${lon}`
              : `área dentro de un radio de ${radiusVal} ${unitStr} de ${lat} ${lon}`);
          lines.push(preamble);
        }
      }
    });

    return lines.join('\n');
  }

  // 2. BOTÓN DE GEOMETRÍAS CON SOPORTE PARA PUNTO, LÍNEA, POLÍGONO Y CÍRCULO
  addGeometry(lang: string): void {
    if (!this.geometries || !this.geometries.length) { return; }
    this.addInformationButtonStatuses.push(`geometry-${lang}-${this.partIndex}`);
    const formatted = this.formatFeaturesList(this.geometries, lang, false);
    if (formatted) {
      this.updateInformation(lang, formatted);
    }
  }

  // 3. BOTÓN DE ZONAS AFECTADAS (SOPORTA GEOMETRÍAS DE ÁREA AFECTADA Y ZONAS/LOCALIDADES SELECCIONADAS EN ES/EN, SIN HARDCODE)
  addZone(lang: any): void {
    const isEn = lang?.toLowerCase() === 'en';
    const zoneLines: string[] = [];

    // A. Geometrías dibujadas en la pestaña "Áreas afectadas" del mapa
    if (this.affectedAreas && this.affectedAreas.length > 0) {
      const formattedGeom = this.formatFeaturesList(this.affectedAreas, lang, true);
      if (formattedGeom) {
        zoneLines.push(formattedGeom);
      }
    }

    // B. Zonas generales y localidades seleccionadas en el formulario de Prerrequisitos
    const generalAreaNames: string[] = [];
    if (this.selectedAreas && this.selectedAreas.length > 0) {
      const sortedAreas = [...this.selectedAreas].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      sortedAreas.forEach(area => {
        const label = isEn && area.internationalName ? area.internationalName : area.name;
        if (label) {
          generalAreaNames.push(label);
        }
      });
    }

    const localityNamesList: string[] = [];
    if (this.selectedLocalities && this.selectedLocalities instanceof Map && this.selectedLocalities.size > 0) {
      this.selectedLocalities.forEach((locs: any[]) => {
        if (Array.isArray(locs)) {
          const sortedLocs = [...locs].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
          sortedLocs.forEach(loc => {
            const label = isEn && loc.internationalName ? loc.internationalName : loc.name;
            if (label) {
              localityNamesList.push(label);
            }
          });
        }
      });
    } else {
      const savedLocalities = this.creationService.getWarningData()?.prerequisites?.localityNames;
      if (savedLocalities && savedLocalities.length > 0) {
        savedLocalities.forEach((loc: any) => {
          const label = isEn && loc.internationalName ? loc.internationalName : loc.name;
          if (label) {
            localityNamesList.push(label);
          }
        });
      }
    }

    const combinedAreaNames = [...generalAreaNames, ...localityNamesList];
    if (combinedAreaNames.length > 0 && zoneLines.length === 0) {
      const prefix = combinedAreaNames.length > 1
        ? (isEn ? 'Affected areas: ' : 'Zonas afectadas: ')
        : (isEn ? 'Affected area: ' : 'Zona afectada: ');
      zoneLines.push(`${prefix}${combinedAreaNames.join(' - ')}.`);
    }

    if (zoneLines.length === 0) {
      this.alertMessages.add({
        severity: 'warn',
        summary: isEn ? 'Affected zones' : 'Zonas afectadas',
        detail: isEn
          ? 'Please draw an affected area on the map ("Affected areas" tab) or select a general area/locality first.'
          : 'Por favor dibuje un área afectada en el mapa (pestaña "Áreas afectadas") o seleccione una zona general/localidad primero.'
      });
      return;
    }

    this.addInformationButtonStatuses.push(`zone-${lang}-${this.partIndex}`);
    this.updateInformation(lang, zoneLines.join('\n'));
  }

  // 4. BOTÓN DE INSERTAR CARTAS AFECTADAS (SOPORTA UNA O MÚLTIPLES CARTAS EN ESPAÑOL E INGLÉS)
  addAffectedCharts(lang: any): void {
    const isEn = lang?.toLowerCase() === 'en';
    const charts = (this.affectedChartsText || '')
      .split(/[,;]+/)
      .map(c => c.trim())
      .filter(Boolean);

    if (charts.length === 0) {
      this.alertMessages.add({
        severity: 'warn',
        summary: isEn ? 'Affected charts' : 'Cartas afectadas',
        detail: isEn
          ? 'Please enter at least one chart number in the "Affected charts" field.'
          : 'Por favor ingrese al menos un número de carta en el campo "Cartas afectadas".'
      });
      return;
    }

    this.addInformationButtonStatuses.push(`affectedCharts-${lang}-${this.partIndex}`);
    const formattedText = charts.length === 1
      ? (isEn ? `Affected chart: ${charts[0]}.` : `Carta afectada: ${charts[0]}.`)
      : (isEn ? `Affected charts: ${charts.join(', ')}.` : `Cartas afectadas: ${charts.join(', ')}.`);
    this.updateInformation(lang, formattedText);
  }

  addInEffectWarnings(lang: any): void {
    const normalizedLang = lang?.toLowerCase() || 'es';
    const subscription = this.informationService.getPublishedWarnings$(this.anInformation.prerequisites.serieId)
      .subscribe(res => {
        const cancellableWarnings = this.creationService.getWarningData().links.cancelledWarningIds;
        const itemsWithoutCancellableWarnings = res._embedded?.items?.slice().filter(item =>
          cancellableWarnings.every(warningId => warningId && item.id !== warningId));
        if (itemsWithoutCancellableWarnings?.length) {
          this.updateInformation(lang, this.informationService.formatPublishedWarnings(itemsWithoutCancellableWarnings, this.translatedTemplates, normalizedLang));
          this.addInformationButtonStatuses.push(`published-${lang}-${this.partIndex}`);
        } else {
          this.updateInformation(lang, this.informationService.formatCurrentWarning(this.creationService.getWarningData(), this.translatedTemplates, normalizedLang) + '\n' + this.informationService.noOtherWarning(this.translatedTemplates, normalizedLang));
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
