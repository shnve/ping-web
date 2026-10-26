import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SeriesAdminApi } from '@app/api/admin/series-admin.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { SubAreasApi } from '@app/api/sub-areas.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import Area from '@app/models/area.model';
import MaritimeService from '@app/models/maritime-service.model';
import { DiffusionNavtexSource, Serie, SerieType } from '@app/models/serie.model';
import { SubArea } from '@app/models/sub-area.model';
import { TranslateService } from '@ngx-translate/core';
import { formatSubAreasName } from '@shared/sub-area-utils';
import _ from 'lodash';
import { Observable, Subscription, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

@Localize()
@Component({
  selector: 'app-serie-form',
  templateUrl: './serie-form.component.html',
  styleUrls: ['./serie-form.component.scss']
})
export class SerieFormComponent implements OnInit, OnDestroy, OnChangeLang {
  @Input() disabled = false;
  @Input() serie: Serie = {
    id: null,
    name: null,
    maritimeService: null,
    type: null,
    ranges: [[1, 999]],
    navtexSource: null
  };

  serieForm: UntypedFormGroup;

  formSubscription: Subscription;
  typeChangeSubscription: Subscription;
  serieSubscription: Subscription;
  maritimeServices$: Observable<MaritimeService[]>;
  subAreas$: Observable<SubArea[]>;
  displayedLabel: string;
  languages = ['es', 'en'];

  serieTypes: string[];

  navtexAdded = false;
  navtexSources = Object.keys(DiffusionNavtexSource).map(k => DiffusionNavtexSource[k as any]);

  constructor(private readonly router: Router,
    private readonly fb: UntypedFormBuilder,
    public readonly translate: TranslateService,
    private readonly subAreasApi: SubAreasApi,
    private readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly seriesAdminApi: SeriesAdminApi,
    private readonly alertMessageService: AlertMessageService) {
    this.updateLists();
  }

  ngOnInit(): void {
    this.maritimeServices$ = this.maritimeServicesApi.getMaritimeServices();
    this.subAreas$ = this.subAreasApi.getSubAreas().pipe(
      map((subAreas: SubArea[]) => formatSubAreasName(subAreas))
    );
    this.serieForm = this.buildForm();
    this.formSubscription = this.subscribeToFormChanges();
    this.displayedLabel = this.getDisplayedLabel(this.translate.currentLang);
  }

  private getDisplayedLabel(lang: string): string {
    return lang === 'es' ? 'name' : 'internationalName';
  }

  private subscribeToFormChanges(): Subscription {
    return this.serieForm.valueChanges.subscribe((data: Area) => {
      if (this.serieForm.valid && this.serieForm.dirty) {
        this.serie = { ...this.serie, ...data };
      }
    });
  }

  saveSerie(): void {
    this.serieSubscription = this.seriesAdminApi.saveSerie(this.serie)
      .subscribe(serie => {
        let messageDetail = 'create';
        if (this.serie.id) {
          messageDetail = 'edit';
          this.serie = serie;
        } else {
          this.router.navigate(['/administration/series']);
        }

        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.${messageDetail}-serie`
        });
      },
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-save-serie'
          });
          return throwError(err);
        });
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
    this.serieSubscription && this.serieSubscription.unsubscribe();
    if (this.typeChangeSubscription) { this.typeChangeSubscription.unsubscribe(); }
  }

  private buildForm(): UntypedFormGroup {
    return this.fb.group({
      urn: [{ value: this.serie?.urn, disabled: this.disabled }, [Validators.pattern(/^urn:[a-z0-9-]+:[a-zA-Z0-9()+,-.:=@$_!*%?#]+$/)]],
      name: [{ value: this.serie?.name, disabled: this.disabled }, Validators.required],
      internationalName: [{ value: this.serie?.internationalName, disabled: this.disabled }],
      information: [{ value: this.serie?.information, disabled: this.disabled }],
      localizedInformation: [{ value: this.serie?.localizedInformation, disabled: this.disabled }],
      type: [{ value: this.serie?.type, disabled: this.disabled }, Validators.required],
      subAreas: [{ value: this.serie?.subAreas, disabled: this.disabled }],
      maritimeService: [{ value: this.serie?.maritimeService, disabled: this.disabled }, Validators.required],
      mandatoryLanguages: [{ value: this.serie?.mandatoryLanguages, disabled: this.disabled }, Validators.required],
      optionalLanguages: [{ value: this.serie?.optionalLanguages, disabled: this.disabled }],
      navtexSource: [{ value: this.serie?.navtexSource, disabled: this.disabled }],
      s124Identifier: [{ value: this.serie?.s124Identifier, disabled: this.disabled }]
    });
  }

  onChangeLang(event): void {
    this.displayedLabel = this.getDisplayedLabel(event.lang);
    this.updateLists();
  }

  protected updateLists(): void {
    this.serieTypes = _.sortBy(Object.keys(SerieType).map(k => SerieType[k as any]), [(o) => this.translate.instant('serie-type.' + o)]);
  }

  addRange(): void {
    const maxRange = Math.max(...this.serie.ranges.flat());
    this.serie.ranges.push([maxRange + 1, maxRange + 100]);
  }

  removeRange(index): void {
    this.serie.ranges.splice(index, 1);
  }

  get hasInvalidLanguageSize(): boolean {
    const mandatory = this.serieForm.get('mandatoryLanguages').value?.length || 0;
    const optional = this.serieForm.get('optionalLanguages').value?.length || 0;
    return (mandatory + optional) > 2;
  }

  isWrongValue(i: number, j: number): boolean {
    if (i === 0) {
      if (j === 0) {
        return this.serie.ranges[i][0] >= this.serie.ranges[i][1];
      }
      return this.serie.ranges[i][1] <= this.serie.ranges[i][0];
    }
    if (j === 0) {
      return this.serie.ranges[i][0] >= this.serie.ranges[i][1] || this.serie.ranges[i][0] <= this.serie.ranges[i - 1][1];
    }
    if (i < this.serie.ranges.length - 1) {
      return this.serie.ranges[i][1] <= this.serie.ranges[i][0] || this.serie.ranges[i][1] >= this.serie.ranges[i + 1][0];
    }
    return this.serie.ranges[i][1] <= this.serie.ranges[i][0];
  }

  trackByFn = (index: number, item: any) => index;

  get navtexSource(): AbstractControl {
    return this.serieForm.get('navtexSource');
  }
}
