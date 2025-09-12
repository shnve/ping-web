import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AlertMessageService } from '@app/core/alert-message.service';
import { StaticLogoAdminApi } from '@app/static-logo/api/static-logo-admin.api';
import { StaticLogo, defaultStaticLogo } from '@app/static-logo/models/static-logo.model';
import { environment } from '@env/environment';
import { cloneDeep } from 'lodash-es';
import { Subscription, throwError } from 'rxjs';

@Component({
  selector: 'static-logo-form',
  templateUrl: './static-logo-form.component.html',
  styleUrls: ['./static-logo-form.component.scss']
})
export class StaticLogoFormComponent implements OnInit, OnDestroy {

  @Input() staticLogo: StaticLogo = cloneDeep(defaultStaticLogo);
  @Input() disabled = false;

  @ViewChild('fileUploader') fileUploader: ElementRef;

  protected submitted = false;
  protected imageLoaded = false;
  protected imageSrc = '';
  protected staticLogoForm: UntypedFormGroup;
  protected staticLogoListPath = ['/administration/static-logo'];
  protected staticLogoSaveSubscription: Subscription;
  protected formSubscription: Subscription;

  protected readonly heightMin = environment.staticLogoFormConfig.minHeight;
  protected readonly heightMax = environment.staticLogoFormConfig.maxHeight;

  constructor(private readonly fb: UntypedFormBuilder,
    private readonly staticLogoAdminApi: StaticLogoAdminApi,
    private readonly alertMessageService: AlertMessageService
  ) { }

  ngOnInit(): void {
    this.staticLogoForm = this.buildForm();
    this.formSubscription = this.subscribeToFormChanges();
    this.imageSrc = this.staticLogo?.content;
  }

  ngOnDestroy(): void {
    if (this.staticLogoSaveSubscription) { this.staticLogoSaveSubscription.unsubscribe(); }
  }

  private buildForm(): UntypedFormGroup {
    return this.fb.group({
      key: [{value: this.staticLogo?.key, disabled: this.disabled || this.staticLogo?.locked}, Validators.required],
      description: [{value: this.staticLogo?.description, disabled: this.disabled}, Validators.required],
      heightWithUnit: [{value: this.staticLogo?.heightWithUnit, disabled: this.disabled}, [Validators.required, Validators.pattern('^\\d+px$'), StaticLogoFormComponent.checkHeightWithUnit()]],
      altTxt: [{value: this.staticLogo?.altTxt, disabled: this.disabled}, Validators.required],
      altTxtInternational: [{value: this.staticLogo?.altTxtInternational, disabled: this.disabled}, Validators.required],
      title: [{value: this.staticLogo?.title, disabled: this.disabled}],
      titleInternational: [{value: this.staticLogo?.titleInternational, disabled: this.disabled}],
      href: [{value: this.staticLogo?.href, disabled: this.disabled}]
    });
  }

  private static checkHeightWithUnit(): ValidatorFn {
    return function validate(control: UntypedFormControl): ValidationErrors | null {
      return StaticLogoFormComponent.validateHeightWithUnit(control?.value);
    };
  }

  public static validateHeightWithUnit(fieldValue: string): ValidationErrors | null {
    if (fieldValue && fieldValue.trim() !== '') {
      const numericValue = Number(fieldValue.replace('px', ''));
      if (numericValue > environment.staticLogoFormConfig.maxHeight || numericValue < environment.staticLogoFormConfig.minHeight) {
        // out of range error
        return { outOfRange: true };
      }

      // no error
      return null;
    }
    return { required: true };
  }

  get key(): AbstractControl {
    return this.staticLogoForm.get('key');
  }

  get description(): AbstractControl {
    return this.staticLogoForm.get('description');
  }

  get heightWithUnit(): AbstractControl {
    return this.staticLogoForm.get('heightWithUnit');
  }

  get altTxt(): AbstractControl {
    return this.staticLogoForm.get('altTxt');
  }

  get altTxtInternational(): AbstractControl {
    return this.staticLogoForm.get('altTxtInternational');
  }

  get title(): AbstractControl {
    return this.staticLogoForm.get('title');
  }

  get titleInternational(): AbstractControl {
    return this.staticLogoForm.get('titleInternational');
  }

  get imgLink(): AbstractControl {
    return this.staticLogoForm.get('imgLink');
  }

  protected onFileChange(event: any): void {
    const file = event.dataTransfer ? event.dataTransfer.files[0] : event.target.files[0];

    const pattern = /image-*/;
    const reader = new FileReader();

    if (!file.type.match(pattern)) {
        alert('invalid format');
        return;
    }

    reader.onloadend = () => {
      const base64String = reader.result as string;
      this.imageSrc = base64String;
      this.staticLogo.content = this.imageSrc;
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  protected clear(): void {
    this.imageSrc = null;
    this.staticLogo.content = null;
    this.fileUploader.nativeElement.value = null;
  }

  private subscribeToFormChanges(): Subscription {
    return this.staticLogoForm.valueChanges.subscribe((data: StaticLogo) => {
      if (this.staticLogoForm.valid && this.staticLogoForm.dirty) {
        this.staticLogo = {...this.staticLogo, ...data};
        this.imageSrc = this.staticLogo.content;
      }
    });
  }

  private saveForm(): boolean {
    if (!this.imageSrc || !this.staticLogo.content) {
      return false;
    }
    return true;
  }

  protected validate(): void {
    if (this.saveForm()) {
      this.saveStaticLogo();
    }
    this.submitted = true;
  }

  protected saveStaticLogo(): void {
    this.staticLogoSaveSubscription = this.staticLogoAdminApi.saveStaticLogo(this.staticLogo.id, this.staticLogo)
      .subscribe(staticLogo => {
        this.staticLogo = staticLogo;
        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.${this.staticLogo.id ? 'save' : 'create'}-static-logo`
        });
      },
      err => {
        this.alertMessageService.add({
          severity: 'error',
          summary: 'message.summary.error',
          detail: 'message.error.api.cannot-save-static-logo'
        });
        return throwError(err);
      });
  }

}
