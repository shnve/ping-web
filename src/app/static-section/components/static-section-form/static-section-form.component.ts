import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AlertMessageService } from '@app/core/alert-message.service';
import { StaticSectionAdminApi } from '@app/static-section/api/static-section-admin.api';
import { StaticSection } from '@app/static-section/models/static-section.model';
import { Subscription, throwError } from 'rxjs';

@Component({
  selector: 'static-section-form',
  templateUrl: './static-section-form.component.html',
  styleUrls: ['./static-section-form.component.scss']
})
export class StaticSectionFormComponent implements OnInit, OnDestroy {
  @Input() staticSection: StaticSection = {
    id: null,
    key: null,
    location: null,
    path: null,
    name: null
  };
  @Input() disabled = false;

  staticSectionForm: UntypedFormGroup;
  staticSectionListPath = ['/administration/static-section'];
  staticSectionSaveSubscription: Subscription;
  formSubscription: Subscription;

  constructor(private readonly fb: UntypedFormBuilder,
              private readonly staticSectionAdminApi: StaticSectionAdminApi,
              private readonly alertMessageService: AlertMessageService) { }

  ngOnInit(): void {
    this.staticSectionForm = this.buildForm();
    this.staticSectionSaveSubscription = this.subscribeToFormChanges();
  }

  ngOnDestroy(): void {
    if (this.staticSectionSaveSubscription) { this.staticSectionSaveSubscription.unsubscribe(); }
  }

  private buildForm(): UntypedFormGroup {
    return this.fb.group({
      key: [{value: this.staticSection?.key, disabled: true}],
      location: [{value: this.staticSection?.location, disabled: true}],
      name: [{value: this.staticSection?.name, disabled: true}],
      path: [{value: this.staticSection?.path, disabled: true}],
      content: [{value: this.staticSection?.content, disabled: this.disabled}],
      internationalContent: [{value: this.staticSection?.internationalContent, disabled: this.disabled}]
    });
  }

  get key(): AbstractControl {
    return this.staticSectionForm.get('key');
  }

  get location(): AbstractControl {
    return this.staticSectionForm.get('location');
  }

  get name(): AbstractControl {
    return this.staticSectionForm.get('name');
  }

  get path(): AbstractControl {
    return this.staticSectionForm.get('path');
  }

  get content(): AbstractControl {
    return this.staticSectionForm.get('content');
  }

  get internationalContent(): AbstractControl {
    return this.staticSectionForm.get('internationalContent');
  }

  private subscribeToFormChanges(): Subscription {
    return this.staticSectionForm.valueChanges.subscribe((data: StaticSection) => {
      if (this.staticSectionForm.valid && this.staticSectionForm.dirty) {
        this.staticSection = {...this.staticSection, ...data};
      }
    });
  }

  saveStaticSection(): void {
    this.staticSectionSaveSubscription = this.staticSectionAdminApi.saveStaticSection(this.staticSection.id, this.staticSection)
      .subscribe(staticSection => {
        this.staticSection = staticSection;
        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.save-static-section`
        });
      },
      err => {
        this.alertMessageService.add({
          severity: 'error',
          summary: 'message.summary.error',
          detail: 'message.error.api.cannot-save-static-section'
        });
        return throwError(err);
      });
  }
}
