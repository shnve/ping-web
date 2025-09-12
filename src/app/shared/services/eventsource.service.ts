import { Injectable, NgZone } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { environment } from '@env/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventSourceService {

  constructor(private readonly zone: NgZone,
    private readonly authService: AuthService) { }

  newEventSource(path: string): EventSource {
    return new EventSourcePolyfill(path, {
      headers: {
        'Authorization': `Bearer ${this.authService.getNonExpiredToken()}`
      },
      heartbeatTimeout: environment.sseHeartbeatTimeout,
      withCredentials: true
    });
  }

  newObservable<R>(path: string, converter: (data: string) => R = _.identity): Observable<R> {
    return new Observable(observer => {
      const eventSource = this.newEventSource(path);
      eventSource.onmessage = event => {
        if (event.data === 'heartbeat') {
          return;
        }
        this.zone.run(() => observer.next(converter(event.data)));
      };
      eventSource.onerror = () => {
        this.zone.run(() => {
          try {
            eventSource.close();
          } catch (e) {}
          if (observer) {
            observer.error();
          }
        });
      };
      return () => eventSource.close();
    });
  }
}
