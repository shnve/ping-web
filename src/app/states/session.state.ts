import { Injectable } from '@angular/core';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionState {
  public readonly userInfo$ = new BehaviorSubject<AuthenticatedUser>(null);

  setUserInfo(userInfo: AuthenticatedUser) {
    this.userInfo$.next(userInfo);
  }

  getUserInfo$(): Observable<AuthenticatedUser> {
    return this.userInfo$.asObservable();
  }

  getUserInfo(): AuthenticatedUser {
    return this.userInfo$.getValue();
  }
}
