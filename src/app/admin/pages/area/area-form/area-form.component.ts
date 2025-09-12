import { ViewGeometryComponent } from '@app/admin/components/view-geometry/view-geometry.component';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AreasApi } from '@app/api/areas.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { AreaSelectOption, AreasFacade } from '@app/facades/areas.facade';
import Area from '@app/models/area.model';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { getCodes } from 'country-list';
import { Observable, Subscription, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-area-form',
  templateUrl: './area-form.component.html',
  styleUrls: ['./area-form.component.scss']
})
@Localize()
export class AreaFormComponent implements OnInit, OnDestroy, OnChangeLang {
  @ViewChild('viewGeometry') viewGeometry: ViewGeometryComponent;
  @Input() area: Area = {
    id: null,
    name: null,
    geom: null,
  };
  @Input() disabled = false;

  countryCodes = getCodes().map(code => ({ value: code }));

  areaForm: UntypedFormGroup;

  formSubscription: Subscription;
  areaSubscription: Subscription;
  areas$: Observable<AreaSelectOption[]>;
  displayedAreaLabel: string;

  constructor(private readonly fb: UntypedFormBuilder,
    public readonly translate: TranslateService,
    private readonly areasFacade: AreasFacade,
    private readonly areasApi: AreasApi,
    private readonly router: Router,
    private readonly alertMessageService: AlertMessageService) {

  }

  ngOnInit(): void {
    this.areaForm = this.buildForm(); // Nécéssaire ici pour que le @Input soit setté
    this.formSubscription = this.subscribeToFormChanges();
    this.areas$ = this.areasFacade.getAreaSelectOptions$().pipe(
      map((options: AreaSelectOption[]) =>
        options.filter(option => option.id !== this.area.id)));
    this.displayedAreaLabel = this.getDisplayedAreaLabel(this.translate.currentLang);
  }

  private getDisplayedAreaLabel(lang: string): string {
    return lang === 'fr' ? 'name' : 'internationalName';
  }

  onChangeLang(event: LangChangeEvent): void {
    this.displayedAreaLabel = this.getDisplayedAreaLabel(event.lang);
  }

  private subscribeToFormChanges(): Subscription {
    return this.areaForm.valueChanges.subscribe((data: Area) => {
      if (this.areaForm.valid && this.areaForm.dirty) {
        this.area = { ...this.area, ...data };
      }
    });
  }

  saveArea(): void {
    if (this.viewGeometry.canSaveGeometry()) {
      this.area.geom = this.viewGeometry.getGeometry();
      this.areaSubscription = this.areasApi.saveArea(this.area)
        .subscribe(area => {
          let messageDetail = 'create';
          if (this.area.id) {
            messageDetail = 'edit';
            this.area = area;
          } else {
            this.router.navigate(['/administration/regions']);
          }

          this.alertMessageService.add({
            severity: 'success',
            summary: 'message.summary.success',
            detail: `message.success.api.${messageDetail}-area`
          });
        },
          err => {
            this.alertMessageService.add({
              severity: 'error',
              summary: 'message.summary.error',
              detail: 'message.error.api.cannot-save-area'
            });
            return throwError(err);
          });
    } else {
      this.alertMessageService.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'message.validation.area.geometry.only-one-required'
      });
    }
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
    this.areaSubscription && this.areaSubscription.unsubscribe();
  }

  private buildForm(): UntypedFormGroup {
    return this.fb.group({
      urn: [{ value: this.area?.urn, disabled: this.disabled }],
      name: [{ value: this.area?.name, disabled: this.disabled }, Validators.required],
      internationalName: [{ value: this.area?.internationalName, disabled: this.disabled }],
      information: [{ value: this.area?.information, disabled: this.disabled }],
      localizedInformation: [{ value: this.area?.localizedInformation, disabled: this.disabled }],
      disclaimer: [{ value: this.area?.disclaimer, disabled: this.disabled }],
      internationalDisclaimer: [{ value: this.area?.internationalDisclaimer, disabled: this.disabled }],
      country: [{ value: this.area?.country, disabled: this.disabled }],
      borderAreas: [{ value: this.area?.borderAreas, disabled: this.disabled }]
    });
  }
}
