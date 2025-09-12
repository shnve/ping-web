import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { LangService } from '@app/core/lang.service';
import { GeoregulationDetailComponent } from '@app/georegulation/components/georegulation-detail/georegulation-detail.component';
import { GeoregulationModalDetails, GeoregulationPartModalDetails } from '@app/georegulation/models/georegulation.model';
import { InfosourceModalBodyComponent } from '@app/infosource/components/infosource-modal/infosource-modal-body/infosource-modal-body.component';
import { InfosourcePart, InfosourceWithParts } from '@app/infosource/models/infosource.model';
import { MessageSeverity } from '@app/models/alert-message.model';
import { NotionType } from '@app/models/notion.model';
import { Warning, WarningFeaturePart } from '@app/models/warning.model';
import { GetNumberForSearchedPartPipe } from '@app/shared/pipes/get-number-for-searched-part.pipe';
import { featurePartType } from '@app/shared/pipes/has-geometries.pipe';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { copyToClipboard, showToast as showToastUtil } from '@shared/ui-utils';
import { Scavenger } from '@wishtack/rx-scavenger';
import { cloneDeep } from 'lodash-es';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import { DetailsMapComponent, HilightFeatures } from '../details-map/details-map.component';
import { WarningModalDetailComponent } from '../warning-modal/warning-modal-detail/warning-modal-detail.component';
import { Localize, OnChangeLang } from '@app/core/localize';

export const MAP_HEIGHT_PROPORTION_TO_SCREEN = 1.9;

export interface Language {
  code: string;
  imageSrc: string;
}

@Component({
  selector: 'shared-details-modal',
  template: '',
  styleUrls: ['./details-modal.component.scss']
})
@Localize()
export class DetailsModalComponent implements OnInit, OnDestroy, OnChangeLang {

  protected scavenger = new Scavenger(this);

  display = false;
  mapHeight = 0;
  availableLanguages: Language[];
  languageSelected: Language;
  initialLanguageCode: string;
  currentSharedLinkUrl: string;
  canDisplayMap = false;
  currentPosition = 0;
  protected proUser: boolean;

  @Output() onClose = new EventEmitter<void>();
  @Output() onStatusChangeAction = new EventEmitter<void>();

  protected previousHighlightedFeatures: HilightFeatures = {};
  protected highlightedFeatures: HilightFeatures = {};
  protected notionType: NotionType;

  @ViewChild('map') mapComponent: DetailsMapComponent;
  @ViewChild('infosourceDetail') infosourceDetailComponent: InfosourceModalBodyComponent;
  @ViewChild('georegulationDetail') georegulationDetailComponent: GeoregulationDetailComponent;
  @ViewChild('warningDetail') warningDetailComponent: WarningModalDetailComponent;

  protected georegulation: GeoregulationModalDetails;
  protected selectedParts: GeoregulationPartModalDetails[] = [];
  protected infosource: InfosourceWithParts;
  protected warning: Warning;

  constructor(protected readonly translate: TranslateService,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly langService: LangService,
    protected readonly elRef: ElementRef,
    protected readonly authService: AuthService,
    protected readonly getNumberForSearchedPart: GetNumberForSearchedPartPipe) {
    this.availableLanguages = [
      { code: 'fr', imageSrc: 'assets/images/flag-france.png' },
      { code: 'en', imageSrc: 'assets/images/flag-uk.png' }
    ];
  }


  ngOnInit(): void {
    this.mapHeight = window.innerHeight / MAP_HEIGHT_PROPORTION_TO_SCREEN;
    this.initialLanguageCode = this.translate.currentLang;
    this.updateSelectedLanguage(this.initialLanguageCode);
  }

  onChangeLang(langChangeEvent: LangChangeEvent): void {}

  ngOnDestroy(): void { }

  show(): void {
    this.display = true;
  }

  hide(): void {
    this.display = false;
    if (this.hasLanguageChanged()) {
      this.changeLanguage(this.initialLanguageCode);
    }
    this.onClose.emit();
  }

  hasLanguageChanged(): boolean {
    return this.initialLanguageCode !== this.translate.currentLang;
  }

  showToast(detail: string, severity: MessageSeverity = 'error'): void {
    showToastUtil(this.alertMessageService, detail, severity);
  }

  switchLanguage($event: any, languageCode: string): void {
    this.changeLanguage(languageCode);
    this.updateSelectedLanguage(languageCode);
    $event.preventDefault();
  }

  changeLanguage(languageCode: string): void {
    this.translate.use(languageCode);
    this.langService.setUserPreferredLang(languageCode);
  }

  updateSelectedLanguage(currentLanguage: string) {
    this.languageSelected = this.availableLanguages.find(language => language.code !== currentLanguage);
  }

  copySharedLinkUrl($event: any): void {
    const url = this.currentSharedLinkUrl;
    copyToClipboard(url);
    this.showToast(this.translate.instant('detail.copySharedLinkUrl-success'), 'success');
    $event.preventDefault();
  }

  getNumberForSearchedFeaturePart(searchedPart: featurePartType): number {
    switch (this.notionType) {
      case NotionType.WARNING:
        return this.getNumberForSearchedPart.transform(searchedPart, this.warning.featureParts, NotionType.WARNING);
      case NotionType.GEOREGULATION:
        return this.getNumberForSearchedPart.transform(searchedPart, this.georegulation.parts, NotionType.GEOREGULATION);
      case NotionType.INFOSOURCE:
        return this.getNumberForSearchedPart.transform(searchedPart, this.infosource.featureParts, NotionType.INFOSOURCE);
      default:
        return -1;
    }
  }

  protected highlightFeaturePartOnClickOnGeometry(geometries: Set<SimpleGeometry>): void {
    if (!geometries.size) {
      return;
    }

    const [first] = geometries;

    let featurePartToHighlight: featurePartType;
    let featurePartBeingVisualized: number;

    switch (this.notionType) {
      case NotionType.WARNING:
        featurePartToHighlight = this.warning.featureParts.find(featurePart =>
          [...featurePart.geometries, ...featurePart.affectedAreas].find(feature => (feature.getGeometry() as SimpleGeometry)['ol_uid'] === first['ol_uid'])
        );
        featurePartBeingVisualized = this.warningDetailComponent.featurePartBeingVisualized;
        break;
      case NotionType.GEOREGULATION:
        featurePartToHighlight = this.georegulation.parts.find(featurePart =>
          [...featurePart.features].find(feature => (feature.getGeometry() as SimpleGeometry)['ol_uid'] === first['ol_uid'])
        );
        featurePartBeingVisualized = this.georegulationDetailComponent.featurePartBeingVisualized;
        break;
      case NotionType.INFOSOURCE:
        featurePartToHighlight = this.infosource.featureParts.find(featurePart =>
          [...featurePart.localisation].find(feature => (feature.getGeometry() as SimpleGeometry)['ol_uid'] === first['ol_uid'])
        );
        featurePartBeingVisualized = this.infosourceDetailComponent.featurePartBeingVisualized;
        break;
      default:
        return;
    }

    if (!featurePartToHighlight) { return; }

    const partNumber = this.getNumberForSearchedFeaturePart(featurePartToHighlight);
    let detailFeaturePartItemEl: HTMLDivElement;

    if (featurePartBeingVisualized && featurePartBeingVisualized !== partNumber) {
      detailFeaturePartItemEl = this.elRef.nativeElement.querySelector(`#featurePart_${featurePartBeingVisualized}`);
      if (detailFeaturePartItemEl && detailFeaturePartItemEl.classList) {
        detailFeaturePartItemEl.classList.remove('visualisable');
      }
    }

    detailFeaturePartItemEl = this.elRef.nativeElement.querySelector(`#featurePart_${partNumber}`);
    if (!featurePartBeingVisualized || featurePartBeingVisualized !== partNumber) {
      switch (this.notionType) {
        case NotionType.WARNING:
          this.highlightedFeatures = {
            geometries: (featurePartToHighlight as WarningFeaturePart).geometries,
            affectedAreas: (featurePartToHighlight as WarningFeaturePart).affectedAreas
          };
          this.warningDetailComponent.featurePartBeingVisualized = partNumber;
          break;
        case NotionType.GEOREGULATION:
          this.highlightedFeatures = {
            features: [].concat.apply(
              (featurePartToHighlight as GeoregulationPartModalDetails)?.features ?? [], this.selectedParts.map(selectedPart => selectedPart.features)
            )
          };
          this.georegulationDetailComponent.featurePartBeingVisualized = partNumber;
          break;
        case NotionType.INFOSOURCE:
          this.highlightedFeatures = { localisation: (featurePartToHighlight as InfosourcePart).localisation };
          this.infosourceDetailComponent.featurePartBeingVisualized = partNumber;
          break;
        default:
          return;
      }

      detailFeaturePartItemEl.classList?.add('visualisable');

      if ((this.warning?.featureParts.length > 1 || this.georegulation?.parts.length > 1 || this.infosource?.featureParts.length > 1) && detailFeaturePartItemEl) {
        detailFeaturePartItemEl.scrollIntoView();
      }
    }
  }

  protected selectFeaturePart(featurePart: featurePartType): void {
    let detailFeaturePartItemEl: HTMLDivElement;
    let featurePartBeingVisualized: number;
    this.previousHighlightedFeatures = cloneDeep(this.highlightedFeatures);

    switch (this.notionType) {
      case NotionType.WARNING:
        this.highlightedFeatures = { geometries: (featurePart as WarningFeaturePart).geometries, affectedAreas: (featurePart as WarningFeaturePart).affectedAreas };
        featurePartBeingVisualized = this.warningDetailComponent.featurePartBeingVisualized;
        break;
      case NotionType.GEOREGULATION:
        this.highlightedFeatures = { features: [].concat.apply((featurePart as GeoregulationPartModalDetails)?.features ?? [], this.selectedParts.map(selectedPart => selectedPart.features)) };
        featurePartBeingVisualized = this.georegulationDetailComponent.featurePartBeingVisualized;
        break;
      case NotionType.INFOSOURCE:
        this.highlightedFeatures = { localisation: (featurePart as InfosourcePart).localisation };
        featurePartBeingVisualized = this.infosourceDetailComponent.featurePartBeingVisualized;
        break;
      default:
        return;
    }

    if (featurePartBeingVisualized) {
      detailFeaturePartItemEl = this.elRef.nativeElement.querySelector(`#featurePart_${featurePartBeingVisualized}`);
      if (detailFeaturePartItemEl && detailFeaturePartItemEl.classList) {
        detailFeaturePartItemEl.classList.remove('visualisable');
      }
    }

    if (!this.mapComponent) { return; }

    const isSameHighlightedFeatures = JSON.stringify(this.previousHighlightedFeatures) === JSON.stringify(this.highlightedFeatures);
    if (isSameHighlightedFeatures) {
      switch (this.notionType) {
        case NotionType.WARNING:
          this.highlightedFeatures = { geometries: [], affectedAreas: [] };
          this.warningDetailComponent.featurePartBeingVisualized = null;
          break;
        case NotionType.GEOREGULATION:
          this.highlightedFeatures = { features: [] };
          this.georegulationDetailComponent.featurePartBeingVisualized = null;
          break;
        case NotionType.INFOSOURCE:
          this.highlightedFeatures = { localisation: [] };
          this.infosourceDetailComponent.featurePartBeingVisualized = null;
          break;
        default:
          return;
      }

      this.mapComponent.fitToModelItem();
    } else {
      const partNumber = this.getNumberForSearchedFeaturePart(featurePart);
      detailFeaturePartItemEl = this.elRef.nativeElement.querySelector(`#featurePart_${partNumber}`);
      detailFeaturePartItemEl && detailFeaturePartItemEl.classList?.add('visualisable');
      this.mapComponent.centerOnGeomOfFeaturePartSelected(featurePart);
      switch (this.notionType) {
        case NotionType.WARNING:
          this.warningDetailComponent.featurePartBeingVisualized = partNumber;
          break;
        case NotionType.GEOREGULATION:
          this.georegulationDetailComponent.featurePartBeingVisualized = partNumber;
          break;
        case NotionType.INFOSOURCE:
          this.infosourceDetailComponent.featurePartBeingVisualized = partNumber;
          break;
        default:
          return;
      }
    }
  }

  protected visualizeAllFeatures(): void {
    let featurePartBeingVisualized: number;
    switch (this.notionType) {
      case NotionType.WARNING:
        this.previousHighlightedFeatures = { geometries: [], affectedAreas: [] };
        this.highlightedFeatures = { geometries: [], affectedAreas: [] };
        featurePartBeingVisualized = this.warningDetailComponent.featurePartBeingVisualized;
        break;
      case NotionType.GEOREGULATION:
        this.previousHighlightedFeatures = { features: [] };
        this.highlightedFeatures = { features: [] };
        featurePartBeingVisualized = this.georegulationDetailComponent.featurePartBeingVisualized;
        break;
      case NotionType.INFOSOURCE:
        this.previousHighlightedFeatures = { localisation: [] };
        this.highlightedFeatures = { localisation: [] };
        featurePartBeingVisualized = this.infosourceDetailComponent.featurePartBeingVisualized;
        break;
      default:
        return;
    }


    if (featurePartBeingVisualized) {
      const detailFeaturePartItemEl: HTMLDivElement = this.elRef.nativeElement.querySelector(`#featurePart_${featurePartBeingVisualized}`);
      if (detailFeaturePartItemEl && detailFeaturePartItemEl.classList) {
        detailFeaturePartItemEl.classList.remove('visualisable');
      }

      switch (this.notionType) {
        case NotionType.WARNING:
          this.warningDetailComponent.featurePartBeingVisualized = null;
          break;
        case NotionType.GEOREGULATION:
          this.georegulationDetailComponent.featurePartBeingVisualized = null;
          break;
        case NotionType.INFOSOURCE:
          this.infosourceDetailComponent.featurePartBeingVisualized = null;
          break;
        default:
          return;
      }
    }

    this.mapComponent && this.mapComponent.fitToModelItem();
  }
}
