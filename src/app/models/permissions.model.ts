export interface Permissions {
  permissions: Array<Permission>;
}

export interface Permission {
  scope: string;
  access: PermissionActionAccess;
  actions: Array<PermissionAction>;
}

export interface PermissionAction {
  mgmtRule?: string;
  label: string;
  access: PermissionActionAccess;
}

export interface PermissionActionAccess {
  guest?: boolean;
  public_user?: boolean;
  guest_service?: boolean;
  operator_service?: boolean;
  admin_service?: boolean;
  FUNCTIONAL_ADMIN?: boolean;
  SERVICE_USER?: boolean;
}
