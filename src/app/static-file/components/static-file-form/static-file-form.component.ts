import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertMessageService } from '@app/core/alert-message.service';
import { StaticFile, defaultStaticFile } from '@app/static-file/models/static-file.model';
import { StaticFileAdminService } from '@app/static-file/services/static-file-admin.service';
import { environment } from '@env/environment';
import { Scavenger } from '@wishtack/rx-scavenger';
import { Subscription, throwError } from 'rxjs';

@Component({
  selector: 'static-file-form',
  templateUrl: './static-file-form.component.html',
  styleUrls: ['./static-file-form.component.scss']
})
export class StaticFileFormComponent implements OnInit, OnDestroy {

  @Input() staticFile: StaticFile = defaultStaticFile;
  @Input() disabled = false;

  protected staticFileForm: UntypedFormGroup;
  protected readonly staticFileListPath = ['/administration/static-file'];
  private formSubscription: Subscription;
  private readonly scavenger = new Scavenger(this);

  constructor(private readonly fb: UntypedFormBuilder,
    private readonly staticFileAdminService: StaticFileAdminService,
    private readonly router: Router,
    private readonly alertMessageService: AlertMessageService
  ) { }

  ngOnInit(): void {
    this.staticFileForm = this.buildForm();
    this.formSubscription = this.subscribeToFormChanges();
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  private buildForm(): UntypedFormGroup {
    return this.fb.group({
      description: [{value: this.staticFile?.description, disabled: this.disabled}, Validators.required],
      path: [{value: this.staticFile?.path, disabled: this.disabled || this.staticFile?.locked}, [Validators.required, Validators.pattern(environment.staticFilePathRegexPattern)]]
    });
  }

  get description(): AbstractControl {
    return this.staticFileForm.get('description');
  }

  get path(): AbstractControl {
    return this.staticFileForm.get('path');
  }

  private subscribeToFormChanges(): Subscription {
    return this.staticFileForm.valueChanges.subscribe((data: StaticFile) => {
      if (this.staticFileForm.valid && this.staticFileForm.dirty) {
        this.staticFile = { ...this.staticFile, ...data };
      }
    });
  }

  saveStaticFile(): void {
    if (!this.staticFile.attachmentId) { return; }
    this.staticFileAdminService.saveStaticFile$(this.staticFile)
      .pipe(this.scavenger.collect())
      .subscribe(staticFile => {
          let messageDetail = 'create';
          if (this.staticFile.id) {
            messageDetail = 'edit';
            this.staticFile = staticFile;
          } else {
            this.router.navigate(this.staticFileListPath);
          }

          this.alertMessageService.add({
            severity: 'success',
            summary: 'message.summary.success',
            detail: `message.success.api.${messageDetail}-static-file`
          });
        },
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-save-static-file'
          });
          return throwError(err);
        }
      );
  }

  setAttachmentId(attachmentId: string): void {
    this.staticFile.attachmentId = attachmentId;
  }
}
