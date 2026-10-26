import { ViewGeometryComponent } from '@app/admin/components/view-geometry/view-geometry.component';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SubAreasApi } from '@app/api/sub-areas.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { OnChangeLang } from '@app/core/localize';
import { SubArea } from '@app/models/sub-area.model';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { AreaSelectOption, AreasFacade } from '@app/facades/areas.facade';
import { formatSubAreasName } from '@shared/sub-area-utils';

@Component({
  selector: 'app-sub-area-form',
  templateUrl: './sub-area-form.component.html',
  styleUrls: ['./sub-area-form.component.scss']
})
export class SubAreaFormComponent implements OnInit, OnDestroy, OnChangeLang {
  @ViewChild('viewGeometry') viewGeometry: ViewGeometryComponent;
  @Input() subArea: SubArea = {
    id: null,
    name: null
  };
  @Input() disabled = false;

  subAreaForm: UntypedFormGroup;
  formSubscription: Subscription;
  subAreaSubscription: Subscription;
  subAreas$: Observable<SubArea[]>;
  displayedLabel: string;
  areas$: Observable<AreaSelectOption[]>;

  constructor(private readonly fb: UntypedFormBuilder,
    private readonly subAreasApi: SubAreasApi,
    private readonly router: Router,
    private readonly areasFacade: AreasFacade,
    private readonly alertMessageService: AlertMessageService,
    public readonly translate: TranslateService) {

  }

  ngOnInit(): void {
    this.subAreaForm = this.fb.group({
      urn: [{ value: this.subArea?.urn, disabled: this.disabled }],
      technicalIdentifier: [{ value: this.subArea?.technicalIdentifier, disabled: this.disabled }],
      name: [{ value: this.subArea?.name, disabled: this.disabled }, Validators.required],
      internationalName: [{ value: this.subArea?.internationalName, disabled: this.disabled }],
      geom: [{ value: this.subArea?.geom, disabled: this.disabled }],
      subAreas: [{ value: this.subArea?.subAreas, disabled: this.disabled }],
      areaId: [{ value: this.subArea?.areaId, disabled: this.disabled }]
    });

    this.formSubscription = this.subscribeToFormChanges();
    this.subAreas$ = this.subAreasApi.getSubAreas().pipe(
      map((subAreas: SubArea[]) =>
        subAreas.filter(sa => sa.id !== this.subArea.id)),
      map((subAreas: SubArea[]) => this.checkTwoLevelMaxHierarchy(subAreas)),
      map((subAreas: SubArea[]) => this.filterParentSubAreas(subAreas)),
      map((subAreas: SubArea[]) => formatSubAreasName(subAreas))
    );
    this.areas$ = this.areasFacade.getAreaSelectOptions$();
    this.displayedLabel = this.getDisplayedLabel(this.translate.currentLang);
  }

  onChangeLang(event): void {
    this.displayedLabel = this.getDisplayedLabel(event.lang);
  }

  private subscribeToFormChanges(): Subscription {
    return this.subAreaForm.valueChanges.subscribe((data: SubArea) => {
      if (this.subAreaForm.valid && this.subAreaForm.dirty) {
        this.subArea = { ...this.subArea, ...data };
      }
    });
  }

  private getDisplayedLabel(lang: string): string {
    return lang === 'es' ? 'name' : 'internationalName';
  }

  saveSubArea(): void {
    const geom = this.viewGeometry?.getGeometry();
    const hasError = geom?.type && geom?.coordinates && !this.viewGeometry?.canSaveGeometry();
    if (hasError) {
      this.alertMessageService.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'message.validation.area.geometry.only-one-required'
      });
      return;
    }

    // geometry in a sub-area is not required
    this.subArea.geom = this.viewGeometry?.getGeometry()?.type && this.viewGeometry?.getGeometry()?.coordinates ?
      this.viewGeometry.getGeometry() : null;

    this.subAreaSubscription = this.subAreasApi.saveSubArea(this.subArea)
      .subscribe(subArea => {
        let messageDetail = 'create';
        if (this.subArea.id) {
          messageDetail = 'edit';
          this.subArea = subArea;
        } else {
          this.router.navigate(['/administration/sous-zones']);
        }

        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.${messageDetail}-sub-area`
        });
      },
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-save-sub-area'
          });
          return throwError(err);
        });
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
    this.subAreaSubscription && this.subAreaSubscription.unsubscribe();
  }

  private filterParentSubAreas(subAreas: SubArea[]): SubArea[] {
    return subAreas.filter(sa => !sa.subAreas || !sa.subAreas.includes(this.subArea.id));
  }

  /**
   * s'assure que la sous-zone n'a pas déjà 2 niveaux de hiérarchie
   * @param subAreas les sous zones
   * @private
   */
  private checkTwoLevelMaxHierarchy(subAreas: SubArea[]): SubArea[] {
    const parents = subAreas.filter(sa => sa.subAreas && sa.subAreas.includes(this.subArea.id));
    // On vérifie si un des parents a déjà un parent et si c'est le cas on renvoie une liste vide
    if (parents.find(parent => subAreas.filter(sa => sa.subAreas && sa.subAreas.includes(parent.id)).length > 0)) {
      return [];
    }
    return subAreas;
  }
}
