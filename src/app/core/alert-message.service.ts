import { Injectable } from '@angular/core';
import { environment } from '@env/environment.default';
import { MessageService } from 'primeng/api';
import { AlertMessage } from '../models/alert-message.model';

@Injectable({
  providedIn: 'root'
})
export class AlertMessageService extends MessageService {
  public static readonly defaultLevel = 'info';
  constructor() {
    super();
  }

  add(message: AlertMessage): void {
    let formatedMessage: AlertMessage;
    if (!message.severity) {
      formatedMessage = {
        ...message,
        severity: AlertMessageService.defaultLevel
      };
    } else {
      formatedMessage = message;
    }

    if (!formatedMessage.life) {
      formatedMessage.life = environment.defaultToasterLifetimeInMilliseconds;
    }

    super.add(formatedMessage);
  }
}
