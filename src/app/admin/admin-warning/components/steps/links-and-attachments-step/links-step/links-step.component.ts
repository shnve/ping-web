import { WarningCreationData } from '@admin-warning/models/creation-warning.model';
import { CreationService } from '@admin-warning/services/creation.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaritimeEntitiesApi } from '@app/api/maritime-entities.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { WarningsFacade } from '@app/facades/admin/warnings.facade';
import { GeoregulationAdminApi } from '@app/georegulation/api/georegulation-admin.api';
import { InfosourceReference } from '@app/infosource/models/infosource.model';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { AbstractInfosourceService } from '@app/infosource/services/infosource.service';
import { GeoregulationSelectOption } from '@app/models/georegulation.model';
import MaritimeEntity from '@app/models/maritime-entity.model';
import { listWarningStatus, MainWarningPart } from '@app/models/warning.model';
import { FormatWarningNumberPipe } from '@app/shared/pipes/format-warning-number.pipe';
import { isNoticeOrNoticeTpFromSerieType } from '@shared/warning-utils';
import { Subscription } from 'rxjs';
import { StepComponent } from '../../step.component';
import { LoaderService } from '@sig/services/loader.service';

export interface WarningSelectOption {
  id: string;
  warningNumber: string;
}

export function mapWarnings(warnings: MainWarningPart[], formatWarningNumberPipe: FormatWarningNumberPipe): any {
  return warnings.map(warning => {
    return {
      id: warning.id,
      warningNumber: formatWarningNumberPipe.transform(warning)
    };
  });
}

@Component({
  selector: 'aw-links-step',
  templateUrl: './links-step.component.html',
  styleUrls: ['../../step.component.scss'],
  providers: [
    infosourceServiceProvider
  ]
})
export class LinksStepComponent extends StepComponent implements OnInit, OnDestroy {
  replaceableWarnings: WarningSelectOption[];
  referenceableWarnings: WarningSelectOption[];
  availableInfosources: InfosourceReference[] = [];
  availableEntities: MaritimeEntity[] = [];

  replaceableWarningsSubscription: Subscription;
  referenceableWarningsSubscription: Subscription;

  selectedReplaceableWarnings: string[];
  selectedReferenceableWarnings: string[];
  selectedInfosources: string[];
  selectedEntities: string[];
  availableGeoregulations: GeoregulationSelectOption[];
  selectedGeoregulations: string[];
  isNoticeOrNoticeTP = false;
  isPublishedWarning = false;
  isWarningModel = false;

  constructor(readonly router: Router,
    protected readonly creationService: CreationService,
    private readonly warningsFacade: WarningsFacade,
    private readonly formatWarningNumberPipe: FormatWarningNumberPipe,
    protected readonly alertMessageService: AlertMessageService,
    private readonly infosourceService: AbstractInfosourceService,
    private readonly maritimeEntitiesApi: MaritimeEntitiesApi,
    private readonly georegulationAdminApi: GeoregulationAdminApi,
    protected readonly loader: LoaderService) {
    super(router, creationService, alertMessageService, loader);
  }

  ngOnInit(): void {
    super.ngOnInit();
    const serieId = this.creationService.getWarningData()?.prerequisites?.serieId;
    this.isPublishedWarning = this.isPublished();
    this.isWarningModel = this.isModel();
    if (serieId && !this.isWarningModel) {
      this.loadLinkeableWarnings(serieId);
      this.loadLinkeableInfosources(serieId);
      this.loadLinkeableMaritimeEntities(serieId);
      this.loadLinkeableGeoregulations(serieId);
    }
  }

  isModel(): boolean {
    return this.creationService.getWarningData()?.status === listWarningStatus.MODEL;
  }

  ngOnDestroy(): void {
    if (this.replaceableWarningsSubscription) {
      this.replaceableWarningsSubscription.unsubscribe();
    }

    if (this.referenceableWarningsSubscription) {
      this.referenceableWarningsSubscription.unsubscribe();
    }
  }

  loadLinkeableWarnings(serieId: string): void {
    this.referenceableWarningsSubscription = this.warningsFacade.getReferenceable$()
      .subscribe(referenceableWarnings => this.referenceableWarnings = mapWarnings(referenceableWarnings, this.formatWarningNumberPipe));

    this.selectedReferenceableWarnings = this.creationService.getWarningData().links.parentWarningIds;

    this.isNoticeOrNoticeTP = isNoticeOrNoticeTpFromSerieType(this.creationService.getWarningData().prerequisites.serieType);

    if (this.isNoticeOrNoticeTP) {
      this.replaceableWarningsSubscription = this.warningsFacade.getReplaceable$(serieId)
        .subscribe(replaceableWarnings => this.replaceableWarnings = mapWarnings(replaceableWarnings, this.formatWarningNumberPipe));
      this.selectedReplaceableWarnings = this.creationService.getWarningData().links.replacedWarningIds;
    }
  }

  private loadLinkeableInfosources(serieId: string): void {
    this.infosourceService.getAvailableInfosourcesToLink$(serieId)
      .pipe(this.scavenger.collect())
      .subscribe(infosources => this.availableInfosources = infosources);
    this.selectedInfosources = this.getInfosourceIds(this.creationService.getWarningData());
  }

  private loadLinkeableMaritimeEntities(serieId: string): void {
    this.maritimeEntitiesApi.getAvailableEntitiesToLink$(serieId)
      .pipe(this.scavenger.collect())
      .subscribe(entities => this.availableEntities = entities);
    this.selectedEntities = this.getEntitiesIds(this.creationService.getWarningData());
  }

  private loadLinkeableGeoregulations(serieId: string): void {
    this.georegulationAdminApi.getAvailableGeoregulationsToLink$(serieId)
      .pipe(this.scavenger.collect())
      .subscribe(georegulations => this.availableGeoregulations = georegulations);
    this.selectedGeoregulations = this.getGeoregulationIds(this.creationService.getWarningData());
  }

  private getEntitiesIds(warningData: WarningCreationData): Array<string> {
    return warningData.links.maritimeEntitiesIds;
  }

  private getInfosourceIds(warningData: WarningCreationData): Array<string> {
    return warningData.links.infosourcesIds;
  }

  private getGeoregulationIds(warningData: WarningCreationData): Array<string> {
    return warningData.links.georegulationIds;
  }

  resetStep(warningData: WarningCreationData): void {
    this.selectedReferenceableWarnings = warningData.links.parentWarningIds;
    this.selectedReplaceableWarnings = warningData.links.replacedWarningIds;
    this.selectedInfosources = this.getInfosourceIds(warningData);
    this.selectedEntities = this.getEntitiesIds(warningData);
    this.selectedGeoregulations = this.getGeoregulationIds(warningData);
  }

  saveForm(force = false): boolean {
    if (!this.isWarningModel) {
      this.creationService.getWarningData().links.replacedWarningIds = this.selectedReplaceableWarnings;
      this.creationService.getWarningData().links.parentWarningIds = this.selectedReferenceableWarnings;
      this.creationService.getWarningData().links.infosourcesIds = this.selectedInfosources;
      this.creationService.getWarningData().links.infosources = this.availableInfosources.filter(infosource => this.selectedInfosources.includes(infosource.id));
      this.creationService.getWarningData().links.maritimeEntitiesIds = this.selectedEntities;
      this.creationService.getWarningData().links.georegulationIds = this.selectedGeoregulations;
    }
    return true;
  }
}
