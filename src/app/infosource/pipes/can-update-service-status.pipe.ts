import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { ServiceRole } from '@app/models/pro-user.model';

@Pipe({
  name: 'canUpdateServiceStatus'
})
export class CanUpdateServiceStatusPipe implements PipeTransform {

  constructor(private readonly authService: AuthService) {
  }

  transform(serviceId: string): boolean {
    return this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN], serviceId);
  }

}
