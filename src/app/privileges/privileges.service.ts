import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {PermissionAction, PermissionActionAccess, Permissions} from '../models/permissions.model';
import {PermissionsProvider} from '@app/privileges/permissions-provider';

@Injectable({
  providedIn: 'root'
})
export class PrivilegesService {

  permissions: Permissions | undefined;

  constructor(private readonly http: HttpClient,
              private readonly permissionsProvider: PermissionsProvider) {
    this.permissions = permissionsProvider.getPermissions();
  }

  hasAccess(scope: string, action: string, ...userProfiles: Array<string>): boolean {
    const perms = this.permissions.permissions.filter(p => p.scope === scope);
    if (!perms?.length) { return false; }

    const perm = perms[0];
    const pa: PermissionAction = perm.actions.find(a => a.label === action);
    const keys = Object.keys(pa.access).filter(k => userProfiles.includes(k));
    return keys.find(k => pa.access[k]) !== undefined;
  }

  hasAccessToScope(scope: string, ...userProfiles: Array<string>): boolean {
    const perms = this.permissions.permissions.filter(p => p.scope === scope);
    if (!perms?.length) { return false; }

    const perm = perms[0];
    const paa: PermissionActionAccess = perm.access;
    const keys = Object.keys(paa).filter(k => userProfiles.includes(k));
    return keys.find(k => paa[k]) !== undefined;
  }
}
