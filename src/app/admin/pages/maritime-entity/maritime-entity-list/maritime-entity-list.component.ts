import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractSearchComponent } from '@app/admin/components/abstract-search/abstract-search.component';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AuthService } from '@app/auth/auth.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { AreaSelectOption, AreasFacade } from '@app/facades/areas.facade';
import Area from '@app/models/area.model';
import MaritimeEntity, { MaritimeEntityType } from '@app/models/maritime-entity.model';
import MaritimeService, { MaritimeServiceConcerned } from '@app/models/maritime-service.model';
import { environment } from '@env/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { FilterSelectOptionType, MaritimeEntityFilterValues } from '../maritime-entity-filter/model/maritime-entity-filter-values';

@Localize()
@Component({
  selector: 'app-maritime-entity-list',
  templateUrl: './maritime-entity-list.component.html',
  styleUrls: ['./maritime-entity-list.component.scss']
})
export class MaritimeEntityListComponent extends AbstractSearchComponent<MaritimeEntity> implements OnChangeLang {
  areas$: Observable<AreaSelectOption[]>;
  maritimeServices$: Observable<MaritimeService[]>;
  displayedLabel: string;
  filteredName: string;
  maritimeEntityTypeEnum: Array<{ id: string, value: string }> = [];
  private selectedAreas: AreaSelectOption[] = [];
  private selectedEntityServiceTypes: string[] = [];
  private selectedMainService = '';
  private selectedAdditionalServices: string[] = [];

  FilterType = FilterSelectOptionType;

  constructor(private readonly http: HttpClient,
    private readonly translate: TranslateService,
    private readonly areasFacade: AreasFacade,
    private readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly authService: AuthService) {
    super(http, authService);
    this.areas$ = this.areasFacade.getAreaSelectOptions$();
    this.displayedLabel = this.getDisplayedAreaLabel(this.translate.currentLang);
    this.maritimeServices$ = this.maritimeServicesApi.getMaritimeServices();
    this.loadMaritimeEntityTranslatedLabels();
  }

  getUriForSearch(): string {
    return `${environment.baseApiUrl}${environment.adminApi.maritimeEntities}`;
  }

  getDisplayedAreaLabel(lang: string): string {
    return lang === 'es' ? 'name' : 'internationalName';
  }

  loadMaritimeEntityTranslatedLabels(): void {
    Object.keys(MaritimeEntityType).forEach(k => {
      const maritimeEntityItem = MaritimeEntityType[k];
      const maritimeEntityLabel = this.translate.instant(`maritime-entity-type.${maritimeEntityItem}`);
      this.maritimeEntityTypeEnum.push({
        id: maritimeEntityItem,
        value: maritimeEntityLabel
      });
    });
  }

  onChangeLang(event: LangChangeEvent): void {
    this.displayedLabel = this.getDisplayedAreaLabel(event.lang);
    this.loadMaritimeEntityTranslatedLabels();
  }

  onFilteredNameChange(): void {
    this.reloadData();
  }

  fetchFilterValues(values: MaritimeEntityFilterValues): void {
    switch (values.filterType) {
      case FilterSelectOptionType.TYPE:
        this.selectedEntityServiceTypes = values.selectedTypeValues;
        break;
      case FilterSelectOptionType.AREAS:
        this.selectedAreas = values.selectedAreasValues;
        break;
      case FilterSelectOptionType.MAIN_SERVICE:
        this.selectedMainService = values.selectedMainService;
        break;
      case FilterSelectOptionType.ADDITIONAL_SERVICES:
        this.selectedAdditionalServices = values.selectedAdditionalServices;
        break;
    }
    this.reloadData();
  }

  getDisplayedLabel(area: Area): string {
    const labelAttribute = this.getDisplayedAreaLabel(this.translate.currentLang);
    return area[labelAttribute];
  }

  getMaritimeServiceName(maritimeService: MaritimeServiceConcerned): string {
    return maritimeService['name'];
  }

  get pageableInfos(): HttpParams {
    let params = super.pageableInfos;

    if (this.filteredName && this.filteredName !== '') {
      params = params.append('name', this.filteredName);
    }

    if (this.selectedAreas.length !== 0) {
      params = params.append('areas', this.selectedAreas.join(','));
    }

    if (this.selectedEntityServiceTypes.length !== 0) {
      params = params.append('type', this.selectedEntityServiceTypes.join(','));
    }

    if (this.selectedMainService && this.selectedMainService !== '') {
      params = params.append('mainService', this.selectedMainService);
    }

    if (this.selectedAdditionalServices.length !== 0) {
      params = params.append('additionalServices', this.selectedAdditionalServices.join(','));
    }

    return params;
  }
}
