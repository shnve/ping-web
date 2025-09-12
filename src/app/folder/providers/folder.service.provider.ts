import { AuthService } from '@app/auth/auth.service';
import { FolderAdminApi } from '@app/folder/api/folder-admin.api';
import { FolderService } from '@app/folder/services/folder.service';
import { FolderApi } from '../api/folder.api';

const folderServiceFactory = (
  authService: AuthService,
  folderApi: FolderApi,
  folderAdminApi: FolderAdminApi) => new FolderService(authService, folderApi, folderAdminApi);

export const folderServiceProvider = {
  provide: FolderService,
  useFactory: folderServiceFactory,
  deps: [
    AuthService,
    FolderApi,
    FolderAdminApi
  ]
};
