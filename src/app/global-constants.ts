import { getCurrentTimeZoneOffset } from './shared/date-utils';

export class GlobalConstants {
  private static readonly offset = getCurrentTimeZoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone);
  public static USER_TIMEZONE = `UTC${GlobalConstants.offset >= 0 ? '+' : ''}${GlobalConstants.offset}`;

  public static LINE_SEPARATOR = '\n';

  public static DEFAULT_TIME = '00:00';
}
