import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { Localize, OnChangeLang } from '../../../core/localize';
import { AreaSelectOption, AreasFacade } from '../../../facades/areas.facade';


@Component({
  selector: 'app-area-dropdown',
  templateUrl: './area-dropdown.component.html',
  styleUrls: ['./area-dropdown.component.scss']
})
@Localize()
export class AreaDropdownComponent implements OnInit, OnChangeLang, OnDestroy {
  selectedArea: string;
  areas$: Observable<AreaSelectOption[]>;
  displayedOptionLabel: string;
  protected getSelectedAreaIdSubscription: Subscription;
  constructor(private readonly translate: TranslateService,
    private readonly authService: AuthService,
    private readonly areasFacade: AreasFacade
  ) {
    this.areas$ = areasFacade.getAreaSelectOptions$();
  }


  ngOnInit() {
    this.getSelectedAreaIdSubscription = this.areasFacade.selected$.subscribe(data => this.selectedArea = data.id);
    // set prefered area when refrech page
    const currentUser = this.authService.getAuthenticatedUser();
    if (!this.selectedArea && currentUser) {
      this.selectedArea = currentUser.preferredAreaId;
    }
    this.displayedOptionLabel = this.translate.currentLang === 'fr' ? 'name' : 'internationalName';
  }

  onChangeLang(event: LangChangeEvent) {
    this.displayedOptionLabel = event.lang === 'fr' ? 'name' : 'internationalName';
  }

  onSelectArea(id: string) {
    this.areasFacade.selectAreaById(id);
  }

  ngOnDestroy(): void {
    if (this.getSelectedAreaIdSubscription) { this.getSelectedAreaIdSubscription.unsubscribe(); }
  }
}
