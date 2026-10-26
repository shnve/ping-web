import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { LangService } from '@app/core/lang.service';
import { SubArea } from '@app/models/sub-area.model';
import { listWarningHazardTypeGeneral } from '@app/models/warning.model';
import { GetNumberForSearchedPartPipe } from '@app/shared/pipes/get-number-for-searched-part.pipe';
import { JsonGeometry } from '@app/sig/models/geometry';
import { NotificationState } from '@app/states/notification.state';
import { Subscription, SubscriptionTypeEnum } from '@app/subscription/models/subscription.model';
import { subscriptionServiceProvider } from '@app/subscription/providers/subscription.service.provider';
import { AbstractSubscriptionService } from '@app/subscription/services/subscription.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DetailsModalComponent } from '@shared/components/details-modal/details-modal.component';
import { addLabelToFeature, DEFAULT_LABEL_SCALE, DEFAULT_TOOL_STYLE, STYLE_TEXT_LABEL } from '@sig/utils/feature';

import { createOlGeometryFrom } from '@sig/utils/geometry';
import { pick } from 'lodash-es';
import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'subscription-modal',
  templateUrl: './subscription-modal.component.html',
  styleUrls: [
    '../../../shared/components/details-modal/details-modal.component.scss',
    './subscription-modal.component.scss'
  ],
  providers: [
    subscriptionServiceProvider
  ]
})
export class SubscriptionModalComponent extends DetailsModalComponent implements OnInit, OnChanges {

  subscription: Subscription;
  subscriptionPartial: Partial<Subscription>;
  @Input() mainSubscriptions: Partial<Subscription>[] = [];
  availableCategories: Array<{ key: string, value: string }>;
  isWarningSubscription: boolean;
  geometriesLayer = new VectorLayer({ source: new VectorSource() });

  constructor(protected readonly alertMessageService: AlertMessageService,
    protected readonly translate: TranslateService,
    protected readonly langService: LangService,
    protected readonly elRef: ElementRef,
    protected readonly authService: AuthService,
    private readonly subscriptionService: AbstractSubscriptionService,
    private readonly confirmationService: ConfirmationService,
    private readonly notificationState: NotificationState,
    protected readonly getNumberForSearchedPart: GetNumberForSearchedPartPipe) {
    super(translate, alertMessageService, langService, elRef, authService, getNumberForSearchedPart);
  }

  ngOnInit() {
    super.ngOnInit();
    this.buildLocalizedItems();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.mainSubscriptions && this.mainSubscriptions) {
      this.subscriptionPartial = this.mainSubscriptions[this.currentPosition];
      this.loadSubscription();
      this.show();
    }
  }

  onChangeLang(event: LangChangeEvent): void {
    if (this.isWarningSubscription) {
      this.buildLocalizedItems();
      this.displaySubAreasFromWarningSubscriptionOnMap(this.subscription);
    }
  }

  protected loadSubscription(): void {
    this.subscriptionService.getSubscriptionById$(this.subscriptionPartial.id)
      .pipe(this.scavenger.collect())
      .subscribe(subscription => {
        this.subscriptionPartial = pick(subscription, ['id', 'title']);
        this.isWarningSubscription = subscription.type === SubscriptionTypeEnum.WARNING;
        if (this.isWarningSubscription) {
          this.displaySubAreasFromWarningSubscriptionOnMap(subscription);
        }
        this.subscription = subscription;
      });
  }

  private displaySubAreasFromWarningSubscriptionOnMap(subscription: Subscription): void {
    this.geometriesLayer.getSource().clear();
    subscription.subAreas?.filter(subArea => subArea.geom !== null).forEach((subArea: SubArea) => {
      this.addSubAreaFeatureOnGeomLayer(subArea.geom, subArea[this.translate.currentLang === 'es' ? 'name' : 'internationalName']);
    });
  }

  private addSubAreaFeatureOnGeomLayer(subAreaGeom: JsonGeometry, subAreaLabel: string): void {
    const feature = new Feature({ geometry: createOlGeometryFrom(subAreaGeom) });
    addLabelToFeature(
      feature,
      subAreaLabel,
      DEFAULT_LABEL_SCALE,
      DEFAULT_TOOL_STYLE,
      STYLE_TEXT_LABEL);
    this.geometriesLayer.getSource().addFeature(feature);
  }

  switchLanguage($event: any, languageCode: string) {
    super.switchLanguage($event, languageCode);
    this.buildLocalizedItems();
  }

  buildLocalizedItems(): void {
    this.availableCategories = listWarningHazardTypeGeneral.map(({ key, value }) => ({
      key,
      value: this.translate.instant(value)
    })
    );
  }

  confirmDelete(event: Event) {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('subscription.details.delete.delete-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.delete();
      }
    });
  }

  delete(): void {
    this.subscriptionService.delete$(this.subscription.id).subscribe(
      () => {
        this.showToast(this.translate.instant('subscription.details.delete.delete-success'), 'success');
        this.onStatusChangeAction.emit();
        this.notificationState.setNotificationObjectDeleted$();
      },
      () => {
        this.showToast(this.translate.instant('subscription.details.delete.delete-error'), 'error');
      });
  }

  getCategory(warningHazardTypeGeneral: string) {
    return this.availableCategories.filter(category => category.key === warningHazardTypeGeneral)[0].value;
  }
}
