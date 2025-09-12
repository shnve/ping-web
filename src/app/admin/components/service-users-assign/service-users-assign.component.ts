import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { UsersApi } from '@app/api/users.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import MaritimeServiceUserRole from '@app/models/maritime-service-user-role';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';

interface MaritimeServiceRole {
  key: string;
  label: string;
}

@Component({
  selector: 'app-service-users-assign',
  templateUrl: './service-users-assign.component.html',
  styleUrls: ['./service-users-assign.component.scss']
})
export class ServiceUsersAssignComponent implements OnInit, OnDestroy {
  @Input() disabled = true;
  @Input() serviceId: string;
  existingUsers$: Observable<MaritimeServiceUserRole[]>;
  users$: Observable<any>;
  form: UntypedFormGroup;
  existingRoles = [
    { key: 'SERVICE_ADMIN', label: 'service-admin' },
    { key: 'SERVICE_OPERATOR', label: 'service-operator' },
    { key: 'SERVICE_VISITOR', label: 'service-visitor' }
  ];
  sub = new Subscription();


  constructor(private readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly userApi: UsersApi,
    private readonly confirmationService: ConfirmationService,
    private readonly translate: TranslateService,
    private readonly alertMessageService: AlertMessageService,
    private readonly fb: UntypedFormBuilder) {
    this.setForm();
  }

  ngOnInit(): void {
    this.existingUsers$ = this.maritimeServicesApi.findUsers(this.serviceId);
    this.updateUsersListAvailableForAssignment();
  }

  private setForm(): void {
    this.form = this.fb.group({
      userId: ['', Validators.required],
      userRole: ['', Validators.required]
    });
  }

  private updateUsersListAvailableForAssignment(): void {
    this.users$ = this.userApi.findAllServiceUser(this.serviceId);
  }

  addUser(): void {
    if (this.form.invalid) {
      return;
    }

    this.sub = this.maritimeServicesApi.addRole(this.serviceId, this.form.get('userId').value, this.form.get('userRole').value)
      .subscribe(() => {
        this.existingUsers$ = this.maritimeServicesApi.findUsers(this.serviceId);
        this.setForm();
        this.showMessage('success', 'success');
      }, () => this.showMessage('error', 'error'));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  findLabel(key: string): string {
    return this.existingRoles.filter(value => value.key === key)[0]?.label;
  }

  confirm(user: MaritimeServiceUserRole) {
    this.confirmationService.confirm({
      message: this.translate.instant('service-user-assign.delete-message'),
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUser(user.serviceUserId, user.serviceRole);
      }
    });
  }

  deleteUser(serviceUserId: string, serviceRole: string) {
    this.maritimeServicesApi.deleteRole(this.serviceId, serviceUserId, serviceRole).subscribe(() => {
      this.existingUsers$ = this.maritimeServicesApi.findUsers(this.serviceId);
      this.updateUsersListAvailableForAssignment();
      this.showMessage('success', 'delete');
    }, () => this.showMessage('error', 'error'));
  }

  showMessage(severity: MessageSeverity = 'error', detail: string) {
    this.alertMessageService.add({
      id: 'assign-user-maritime-service',
      severity,
      summary: `message.summary.${severity === 'error' ? 'error' : 'success'}`,
      detail: `service-user-assign.${detail === 'success' ? 'success' : 'delete'}`,
    });
  }

  get userId(): AbstractControl {
    return this.form.get('userId');
  }
}
