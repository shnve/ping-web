import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { Localize, OnChangeLang } from '../../../core/localize';
import { AreaDropdownGroup, AreasFacade } from '../../../facades/areas.facade';


@Component({
  selector: 'app-area-dropdown',
  templateUrl: './area-dropdown.component.html',
  styleUrls: ['./area-dropdown.component.scss']
})
@Localize()
export class AreaDropdownComponent implements OnInit, OnChangeLang, OnDestroy {
  selectedArea: string;
  groupedAreas$: Observable<AreaDropdownGroup[]>;
  areas$: Observable<AreaDropdownGroup[]>;
  displayedOptionLabel: string;
  protected getSelectedAreaIdSubscription: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly authService: AuthService,
    private readonly areasFacade: AreasFacade
  ) {
    if (this.areasFacade && typeof this.areasFacade.getGroupedAreaSelectOptions$ === 'function') {
      this.groupedAreas$ = this.areasFacade.getGroupedAreaSelectOptions$();
      this.areas$ = this.groupedAreas$;
    } else if (this.areasFacade && typeof this.areasFacade.getAreaSelectOptions$ === 'function') {
      this.areas$ = this.areasFacade.getAreaSelectOptions$() as any;
      this.groupedAreas$ = this.areas$;
    }
  }

  ngOnInit() {
    this.getSelectedAreaIdSubscription = this.areasFacade.selected$.subscribe(data => this.selectedArea = data?.id);
    // set prefered area when refresh page
    const currentUser = this.authService.getAuthenticatedUser();
    if (!this.selectedArea && currentUser) {
      this.selectedArea = currentUser.preferredAreaId;
    }
    this.displayedOptionLabel = this.translate.currentLang === 'es' ? 'name' : 'internationalName';
  }

  onChangeLang(event: LangChangeEvent) {
    this.displayedOptionLabel = event.lang === 'es' ? 'name' : 'internationalName';
  }

  onSelectArea(id: string) {
    this.areasFacade.selectAreaById(id);
  }

  ngOnDestroy(): void {
    if (this.getSelectedAreaIdSubscription) { this.getSelectedAreaIdSubscription.unsubscribe(); }
  }
}
