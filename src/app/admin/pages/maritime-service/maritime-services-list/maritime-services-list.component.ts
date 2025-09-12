import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractSearchComponent } from '@app/admin/components/abstract-search/abstract-search.component';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AuthService } from '@app/auth/auth.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { AreaSelectOption, AreasFacade } from '@app/facades/areas.facade';
import Area from '@app/models/area.model';
import MaritimeService, { MaritimeServiceType } from '@app/models/maritime-service.model';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { MaritimeServiceFilterValues } from '../maritime-service-filter/model/maritime-service-filter-values';

@Localize()
@Component({
  selector: 'app-maritime-services-list',
  templateUrl: './maritime-services-list.component.html',
  styleUrls: ['./maritime-services-list.component.scss']
})
export class MaritimeServicesListComponent extends AbstractSearchComponent<MaritimeService> implements OnChangeLang {

  maritimeServiceTypeEnum: Array<{ id: string, value: string }> = [];
  areas$: Observable<AreaSelectOption[]>;
  displayedLabel: string;
  filteredName: string;
  selectedAreas: AreaSelectOption[] = [];
  selectedServiceTypes: string[] = [];

  constructor(private readonly maritimeServicesApi: MaritimeServicesApi,
              private readonly http: HttpClient,
              public readonly translate: TranslateService,
              private readonly authService: AuthService,
              private readonly areasFacade: AreasFacade) {
    super(http, authService);
    this.areas$ = this.areasFacade.getAreaSelectOptions$();
    this.displayedLabel = this.getDisplayedAreaLabel(this.translate.currentLang);
    this.loadMaritimeServiceTranslatedLabels();
  }

  loadMaritimeServiceTranslatedLabels(): void {
    Object.keys(MaritimeServiceType).forEach(key => {
      const maritimeServiceItem = MaritimeServiceType[key];
      const maritimeServiceLabel = this.translate.instant(`enum.maritime-service-type.${(maritimeServiceItem as string).toLowerCase()}`);
      this.maritimeServiceTypeEnum.push({
        id: maritimeServiceItem,
        value: maritimeServiceLabel
      });
    });
  }

  onChangeLang(event: LangChangeEvent): void {
    this.displayedLabel = this.getDisplayedAreaLabel(event.lang);
    this.loadMaritimeServiceTranslatedLabels();
  }

  getDisplayedAreaLabel(lang: string): string {
    return lang === 'fr' ? 'name' : 'internationalName';
  }

  getDisplayedLabel(area: Area): string {
    const labelAttribute = this.getDisplayedAreaLabel(this.translate.currentLang);
    return area[labelAttribute];
  }

  get canPreviewModel(): boolean {
    return this.authService.hasRoleFunctionalAdmin();
  }

  canPreview(id: string): boolean {
    return this.canPreviewModel || this.authService.hasSomeRoleOnService(id);
  }

  getUriForSearch(): string {
    return this.maritimeServicesApi.adminApi;
  }

  displayArea(ms: MaritimeService): string {
    // @ts-ignore
    return ms.areas.map(a => (a as Area).name).join(',');
  }

  fetchFilterValues(values: MaritimeServiceFilterValues): void {
    if (values.isTypeFiltered) {
      this.selectedServiceTypes = values.selectedTypeValues;
    } else {
      this.selectedAreas = values.selectedAreasValues;
    }
    this.reloadData();
  }

  onFilteredNameChange(): void {
    this.reloadData();
  }

  get pageableInfos(): HttpParams {
    let params = super.pageableInfos;

    if (!!this.filteredName) {
      params = params.append('name', this.filteredName);
    }

    if (this.selectedAreas.length !== 0) {
      params = params.append('areas', this.selectedAreas.join(','));
    }

    if (this.selectedServiceTypes.length !== 0) {
      params = params.append('type', this.selectedServiceTypes.join(','));
    }

    return params;
  }
}
