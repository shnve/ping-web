import {Injectable} from '@angular/core';
import {Permissions} from '@app/models/permissions.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';

@Injectable()
export class PermissionsProvider {
  readonly permissionsUrl = 'assets/permissions.json';

  private permissions: Permissions = null;

  constructor(private readonly http: HttpClient) {}

  public getPermissions(): Permissions {
    return this.permissions;
  }

  load(): Promise<any> {
    return this.http
      .get<Permissions>(this.permissionsUrl)
      .pipe(
        tap((data: Permissions) => this.permissions = { ...data }),
        catchError(this.handleError)
      ).toPromise();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }
}
