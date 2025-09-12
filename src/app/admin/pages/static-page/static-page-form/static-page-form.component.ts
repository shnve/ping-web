import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StaticPageAdminApi } from '@app/api/admin/static-page-admin.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { StaticPage } from '@app/models/static-page.model';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, throwError } from 'rxjs';

@Component({
  selector: 'app-static-page-form',
  templateUrl: './static-page-form.component.html',
  styleUrls: ['./static-page-form.component.scss']
})
export class StaticPageFormComponent implements OnInit, OnDestroy {

  @Input() staticPage: StaticPage = {
    id: null,
    title: null,
    internationalTitle: null,
    path: null,
    content: null,
    internationalContent: null,
    locked: false
  };
  @Input() disabled = false;

  staticPageForm: UntypedFormGroup;
  staticPageListPath = ['/administration/static-page'];
  staticPageSaveSubscription: Subscription;
  formSubscription: Subscription;

  protected readonly configEditor = environment.staticPageEditorConfig;

  constructor(private readonly fb: UntypedFormBuilder,
              private readonly translate: TranslateService,
              private readonly staticPageAdminApi: StaticPageAdminApi,
              private readonly router: Router,
              private readonly alertMessageService: AlertMessageService) {}

  ngOnInit(): void {
    this.staticPageForm = this.buildForm();
    this.formSubscription = this.subscribeToFormChanges();
  }

  ngOnDestroy(): void {
    if (this.staticPageSaveSubscription) { this.staticPageSaveSubscription.unsubscribe(); }
  }

  private buildForm(): UntypedFormGroup {
    return this.fb.group({
      title: [{value: this.staticPage?.title, disabled: this.disabled}, Validators.required],
      internationalTitle: [{value: this.staticPage?.internationalTitle, disabled: this.disabled}, Validators.required],
      path: [{value: this.staticPage?.path, disabled: this.disabled || this.staticPage?.locked}, [Validators.required, Validators.pattern(environment.staticPagePathRegexPattern)]],
      content: [{value: this.staticPage?.content, disabled: this.disabled}],
      internationalContent: [{value: this.staticPage?.internationalContent, disabled: this.disabled}]
    });
  }

  get title() {
    return this.staticPageForm.get('title');
  }

  get internationalTitle() {
    return this.staticPageForm.get('internationalTitle');
  }

  get path() {
    return this.staticPageForm.get('path');
  }

  get content() {
    return this.staticPageForm.get('content');
  }

  get internationalContent() {
    return this.staticPageForm.get('internationalContent');
  }

  private subscribeToFormChanges(): Subscription {
    return this.staticPageForm.valueChanges.subscribe((data: StaticPage) => {
      if (this.staticPageForm.valid && this.staticPageForm.dirty) {
        this.staticPage = {...this.staticPage, ...data};
      }
    });
  }

  saveStaticPage(): void {
    this.staticPageSaveSubscription = this.staticPageAdminApi.saveStaticPage(this.staticPage)
      .subscribe(staticPage => {
        let messageDetail = 'create';
        if (this.staticPage.id) {
          messageDetail = 'edit';
          this.staticPage = staticPage;
        } else {
          this.router.navigate(this.staticPageListPath);
        }

        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.${messageDetail}-staticPage`
        });
      },
      err => {
        this.alertMessageService.add({
          severity: 'error',
          summary: 'message.summary.error',
          detail: 'message.error.api.cannot-save-staticPage'
        });
        return throwError(err);
      });
  }
}
