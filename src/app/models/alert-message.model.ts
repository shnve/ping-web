import {Message} from 'primeng/api';

export type MessageSeverity =  'success' | 'info' | 'warn' | 'error';

export interface AlertMessage extends Message {
  severity?: MessageSeverity;
  scope?: string;
}
