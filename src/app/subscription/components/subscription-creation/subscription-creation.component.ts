import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AreasApi } from '@app/api/areas.api';
import { MaritimeEntitiesApi } from '@app/api/maritime-entities.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { SubAreasApi } from '@app/api/sub-areas.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { AreaSelectOption } from '@app/facades/areas.facade';
import { SeriesFacade } from '@app/facades/series.facade';
import { MessageSeverity } from '@app/models/alert-message.model';
import MaritimeEntity from '@app/models/maritime-entity.model';
import MaritimeService from '@app/models/maritime-service.model';
import { Serie } from '@app/models/serie.model';
import { SubArea } from '@app/models/sub-area.model';
import { listWarningHazardTypeGeneral } from '@app/models/warning.model';
import { CreationSubscriptionDto } from '@app/subscription/models/subscription-creation.model';
import { subscriptionServiceProvider } from '@app/subscription/providers/subscription.service.provider';
import { AbstractSubscriptionService } from '@app/subscription/services/subscription.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { addLabelToFeature, DEFAULT_LABEL_SCALE, DEFAULT_TOOL_STYLE, STYLE_TEXT_LABEL } from '@sig/utils/feature';
import { createOlGeometryFrom } from '@sig/utils/geometry';
import { Scavenger } from '@wishtack/rx-scavenger';
import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Observable, Subscription as rxjsSubscription, throwError } from 'rxjs';

export const SUBSCRIPTION_WARNING_PATH = 'subscription/warning';
export const SUBSCRIPTION_GEOREGULATION_PATH = 'subscription/georegulation';

@Component({
  selector: 'subscription-creation',
  templateUrl: './subscription-creation.component.html',
  styleUrls: ['./subscription-creation.component.scss'],
  providers: [
    subscriptionServiceProvider
  ]
})
@Localize()
export class SubscriptionCreationComponent implements OnInit, OnDestroy, OnChangeLang {

  maritimeServicesWithRoles: MaritimeService[];
  areas$: Observable<AreaSelectOption[]>;
  displayedLabel: string;
  seriesByArea: Serie[];
  subAreasBySerie: SubArea[];
  geometriesLayer = new VectorLayer({ source: new VectorSource() });
  availableCategories: Array<{ key: string, value: string }>;
  allSubAreas: SubArea[];
  allMaritimeEntities: MaritimeEntity[];
  maritimeEntitiesByService: MaritimeEntity[];
  groupedMaritimeEntitiesByArea: Array<{ label: string, items: MaritimeEntity[] }>;
  availableGeoregulationTypes: Array<{ key: string, value: string }>;

  subscriptionForm: UntypedFormGroup;
  protected scavenger = new Scavenger(this);
  private createRxjsSubscription: rxjsSubscription;
  creationSubscriptionDto: CreationSubscriptionDto;
  submitted = false;
  serviceSelected = false;
  areaSelected = false;
  serieSelected = false;
  bilingualSerieSelected = false;
  warningCreation: boolean;
  serviceUser: boolean;

  constructor(private readonly fb: UntypedFormBuilder,
    public readonly translate: TranslateService,
    private readonly authService: AuthService,
    private readonly subscriptionService: AbstractSubscriptionService,
    private readonly alertMessageService: AlertMessageService,
    private readonly areasApi: AreasApi,
    private readonly seriesFacade: SeriesFacade,
    private readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly maritimeEntitiesApi: MaritimeEntitiesApi,
    private readonly subAreasApi: SubAreasApi,
    private readonly router: Router) {
    this.warningCreation = this.router.url.includes('warning');
    this.serviceUser = this.authService.isProUser();
    this.buildLocalizedItems();
    this.initForm();
  }

  ngOnInit(): void {
    this.displayedLabel = this.getDisplayedLabel(this.translate.currentLang);
    this.maritimeServicesApi.getMaritimeServices()
      .pipe(this.scavenger.collect())
      .subscribe(maritimeServices => {
        this.maritimeServicesWithRoles = maritimeServices
          .filter(maritimeService => this.authService.getAuthenticatedUserServiceRoles()
            .map(serviceRole => serviceRole.serviceId).includes(maritimeService.id));
      });
    this.maritimeEntitiesApi.findAll()
      .pipe(this.scavenger.collect())
      .subscribe(maritimeEntities => this.allMaritimeEntities = maritimeEntities
        .map(maritimeEntity => {
          maritimeEntity.internationalName = maritimeEntity.internationalName ?? maritimeEntity.name;
          return maritimeEntity;
        }));
    this.areas$ = this.areasApi.getAreas().pipe(this.scavenger.collect());
    this.subAreasApi.getSubAreas()
      .pipe(this.scavenger.collect())
      .subscribe(subAreas => this.allSubAreas = subAreas.map(subArea => {
        subArea.internationalName = subArea.internationalName ?? subArea.name;
        return subArea;
      }));
  }

  initForm(): void {
    this.subscriptionForm = this.fb.group({
      service: ['', this.serviceUser ? Validators.required : null],
      title: ['', Validators.required],
      area: ['', Validators.required],
      serie: ['', this.warningCreation ? Validators.required : null],
      lang: [''],
      subAreas: [[]],
      warningHazardTypeGenerals: [this.availableCategories.map(category => category.key)],
      maritimeEntitiesGeographicExtent: [[]],
      georegulationTypes: [['NAVIGATION'], !this.warningCreation ? Validators.required : null],
      maritimeEntities: [[]],
      sendingMail: [true, Validators.required]
    });
  }

  onChangeLang(event: LangChangeEvent): void {
    this.displayedLabel = this.getDisplayedLabel(event.lang);
    this.buildLocalizedItems();
    this.onChangeSubAreas(this.subAreas.value);
  }

  buildLocalizedItems(): void {
    this.availableCategories = listWarningHazardTypeGeneral.map(({ key, value }) => ({
      key,
      value: this.translate.instant(value)
    })
    );
    this.availableGeoregulationTypes = [{
        key: 'NAVIGATION',
        value: this.translate.instant('georegulation.type.NAVIGATION')
      }];
    /* Temporally removed: DO NOT REMOVE LINES BELOW
    this.availableGeoregulationTypes = Object.keys(GeoregulationType).map(key => {
      const georegulationType = GeoregulationType[key];
      return {
        key: georegulationType,
        value: this.translate.instant('georegulation.type.' + georegulationType)
      };
    });*/
  }

  private getDisplayedLabel(lang: string): string {
    return lang === 'es' ? 'name' : 'internationalName';
  }

  saveForm(): void {
    this.creationSubscriptionDto = {
      serviceId: this.service.value,
      title: this.title.value,
      areaId: this.area?.value,
      serieId: this.serie.value,
      lang: this.lang.value,
      subAreaIds: this.subAreas.value,
      warningHazardTypeGenerals: this.warningHazardTypeGenerals.value,
      sendingMail: this.sendingMail.value,
      maritimeEntityIdsGeographicExtent: this.maritimeEntitiesGeographicExtent.value,
      georegulationTypes: this.georegulationTypes.value,
      maritimeEntityIds: this.maritimeEntities.value
    };
  }

  validate(): void {
    this.submitted = true;
    if (this.subscriptionForm.invalid) {
      return;
    }
    this.saveForm();
    this.createSubscription();
  }

  private createSubscription(): void {
    const createSubscription = this.warningCreation ?
      this.subscriptionService.createWarningSubscription$(this.creationSubscriptionDto) :
      this.subscriptionService.createGeoregulationSubscription$(this.creationSubscriptionDto);

    this.createRxjsSubscription = createSubscription
      .subscribe(() => {
        const backToTablePath = this.warningCreation ? SUBSCRIPTION_WARNING_PATH : SUBSCRIPTION_GEOREGULATION_PATH;
        this.router.navigate([backToTablePath]);
        this.showToast('message.success.api.create-subscription.created', 'success');
      }, err => {
        this.showToast('message.error.api.cannot-create-subscription', 'error');
        return throwError(err);
      });
  }

  protected showToast(detail: string, severity: MessageSeverity = 'error'): void {
    this.alertMessageService.add({
      summary: `message.summary.${severity === 'error' ? 'error' : 'success'}`,
      severity,
      detail
    });
  }

  ngOnDestroy(): void {
    if (this.createRxjsSubscription) { this.createRxjsSubscription.unsubscribe(); }
  }

  get service(): AbstractControl {
    return this.subscriptionForm.get('service');
  }

  get title(): AbstractControl {
    return this.subscriptionForm.get('title');
  }

  get area(): AbstractControl {
    return this.subscriptionForm.get('area');
  }

  get serie(): AbstractControl {
    return this.subscriptionForm.get('serie');
  }

  get lang(): AbstractControl {
    return this.subscriptionForm.get('lang');
  }

  get subAreas(): AbstractControl {
    return this.subscriptionForm.get('subAreas');
  }

  get warningHazardTypeGenerals(): AbstractControl {
    return this.subscriptionForm.get('warningHazardTypeGenerals');
  }

  get maritimeEntitiesGeographicExtent(): AbstractControl {
    return this.subscriptionForm.get('maritimeEntitiesGeographicExtent');
  }

  get georegulationTypes(): AbstractControl {
    return this.subscriptionForm.get('georegulationTypes');
  }

  get maritimeEntities(): AbstractControl {
    return this.subscriptionForm.get('maritimeEntities');
  }

  get sendingMail(): AbstractControl {
    return this.subscriptionForm.get('sendingMail');
  }

  onSelectService(serviceId: string) {
    this.maritimeEntitiesByService = this.allMaritimeEntities.filter(maritimeEntity => maritimeEntity.maritimeServiceId === serviceId);
    this.maritimeEntitiesGeographicExtent.setValue([]);
    this.serviceSelected = true;
    if (this.areaSelected) {
      this.setGroupedMaritimeEntitiesByArea();
    }
  }

  onSelectArea(areaId: string) {
    this.seriesFacade.getSeriesByAreaId$(areaId)
      .pipe(this.scavenger.collect())
      .subscribe(series => this.seriesByArea = series);
    this.serie.setValue('');
    this.areaSelected = true;
    if (this.serviceSelected) {
      this.setGroupedMaritimeEntitiesByArea();
    }
  }

  setGroupedMaritimeEntitiesByArea(): void {
    this.maritimeEntities.setValue([]);
    const maritimeEntitiesByAreaInService = { label: 'maritime-entities-in-service', items: [] };
    const maritimeEntitiesByAreaNotInService = { label: 'other-maritime-entities', items: [] };
    this.allMaritimeEntities.forEach(maritimeEntity => {
      if (maritimeEntity.areas.includes(this.area.value)) {
        const maritimeEntityInServiceIds = this.maritimeEntitiesByService.map(maritimeEntityInService => maritimeEntityInService.id);
        if (maritimeEntityInServiceIds.includes(maritimeEntity.id)) {
          maritimeEntitiesByAreaInService.items.push(maritimeEntity);
        } else {
          maritimeEntitiesByAreaNotInService.items.push(maritimeEntity);
        }
      }
    });
    this.groupedMaritimeEntitiesByArea = [maritimeEntitiesByAreaInService, maritimeEntitiesByAreaNotInService];
  }

  onSelectSerie(serieId: string) {
    if (serieId) {
      const serie = this.seriesByArea?.filter(serieInArea => serieInArea.id === serieId)[0];
      this.bilingualSerieSelected = serie?.mandatoryLanguages?.includes('fr') && serie?.mandatoryLanguages?.includes('en');
      this.lang.setValue(this.bilingualSerieSelected ? 'fr' : '');
      this.subAreasBySerie = this.allSubAreas.filter(subArea => serie?.subAreas
        .map((subAreaInSerie: SubArea) => subAreaInSerie.id).includes(subArea.id));
      this.subAreas.setValue(this.subAreasBySerie?.map(subArea => subArea.id));
      this.serieSelected = true;
    }
  }

  onChangeSubAreas(subAreaIds: Array<string>): void {
    this.geometriesLayer.getSource().clear();
    for (const subAreaId of subAreaIds) {
      const subAreaSelected = this.subAreasBySerie.filter(subArea => subArea.id === subAreaId)[0];
      const feature = new Feature({
        geometry: createOlGeometryFrom(subAreaSelected.geom)
      });
      addLabelToFeature(
        feature,
        subAreaSelected[this.getDisplayedLabel(this.translate.currentLang)],
        DEFAULT_LABEL_SCALE,
        DEFAULT_TOOL_STYLE,
        STYLE_TEXT_LABEL);
      this.geometriesLayer.getSource().addFeature(feature);
    }
  }
}
