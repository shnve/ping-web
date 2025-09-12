import {Component, Input, OnInit} from '@angular/core';
import {UsersApi} from '@app/api/users.api';
import {ProUserServices, ServiceRole} from '@app/models/pro-user.model';
import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-service-assign-for-user',
  templateUrl: './service-assign-for-user.component.html',
  styleUrls: ['./service-assign-for-user.component.scss']
})
export class ServiceAssignForUserComponent implements OnInit {
  @Input() userId: string;
  userRole$: Observable<ProUserServices[]>;
  existingRoles = [
    {key: ServiceRole.SERVICE_ADMIN, label: 'service-admin'},
    {key: ServiceRole.SERVICE_OPERATOR, label: 'service-operator'},
    {key: ServiceRole.SERVICE_VISITOR, label: 'service-visitor'}
  ];

  constructor(private readonly userApi: UsersApi, public readonly translate: TranslateService) {
  }

  ngOnInit(): void {
    this.userRole$ = this.userApi.findProServices(this.userId);
  }

  findLabel(serviceRole: ServiceRole): string {
    return this.existingRoles.filter(value => value.key === serviceRole)[0]?.label;
  }
}
