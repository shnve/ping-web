import { isBefore } from 'date-fns';
import { parseFromString, parseFromTimeZone } from 'date-fns-timezone';
import { format, getTimezoneOffset, utcToZonedTime } from 'date-fns-tz';
import { enGB, es } from 'date-fns/locale';
import { deburr } from 'lodash';
import { cloneDeep } from 'lodash-es';
import { listTimeZones } from 'timezone-support';
import { uniq } from './generic-utils';
import { DateRange } from './models/date-range.model';

export const ENGLISH_DATE_FORMAT = 'YYYY/MM/DD';
export const FRENCH_DATE_FORMAT = 'DD/MM/YYYY';
export const TIME_FORMAT = 'HH:mm';
export const FRENCH_DATE_TIME_FORMAT = `${FRENCH_DATE_FORMAT} ${TIME_FORMAT}`;
export const UTC_TIMEZONE = 'UTC';
export const UTC_TIMEZONE_ZERO = 'UTC+0';
export const ENGLISH_DATE_REGEX_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const FRENCH_DATE_REGEX_PATTERN = /^(([0-2]\d|[3][0-1])\/([0]\d|[1][0-2])\/[2][0]\d{2})$/;
export const DATE_REGEX_PATTERN = /\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}Z)?/;
export const UTC_REGEX_PATTERN = /UTC[+-]\d{1,2}([.]\d{1,2})?/;

export function parseDateTimeToTimezone(datetime: string, timeZone: string): Date {
  return parseFromTimeZone(`${datetime}`, FRENCH_DATE_TIME_FORMAT, { timeZone });
}

export function formatFrenchDateToIsoDate(date: string): string {
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
}

export function formatModelItemDatetime(datetime: string, isFrLanguage: boolean, isFullFormat: boolean, timezone: string): string {
  const timezoneName = findTimeZone(timezone);
  const parsedDatetime = parseDateTimeToTimezone(datetime, timezoneName);
  const locale = isFrLanguage ? es : enGB;
  const datetimeAtUtc = utcToZonedTime(parsedDatetime, timezoneName);

  const currentMonth = datetimeAtUtc.getMonth() + 1;
  const formattedMonth = (deburr(format(datetimeAtUtc, 'MMM', { locale })).substring(0, 3).toUpperCase())
    .replace('JUI', currentMonth === 6 ? 'JUN' : 'JUL');

  const offset = getCurrentTimeZoneOffset(timezoneName);
  const fullDate = offset !== 0 ? format(datetimeAtUtc, `ddHHmm 'UTC' XXX '${formattedMonth}' yy'`, { locale, timeZone: timezoneName })
    : format(datetimeAtUtc, `ddHHmm 'UTC' '${formattedMonth}' yy'`, { locale, timeZone: timezoneName });
  const partialDate = fullDate.substring(0, 2) + ' ' + fullDate.substring(fullDate.indexOf(formattedMonth), fullDate.length);
  return isFullFormat ? fullDate : partialDate;
}

export function getCurrentTimeZoneOffset(timezone: string): number {
  return getTimezoneOffset(timezone) / 3600000;
}

export function listTheTimeZones(): Array<{ label: string; value: string; }> {
  return uniq(listTimeZones().map(timezone => formatTimeZoneAndLabel(timezone)), 'label')
    .sort((first, second) => {
      const firstLabel = first.label;
      const secondLabel = second.label;
      if (firstLabel.includes('+') && secondLabel.includes('-')) {
        return -1;
      } else if (firstLabel.includes('-') && secondLabel.includes('+')) {
        return 1;
      } else {
        return parseFloat(firstLabel.substring(4)) - parseFloat(secondLabel.substring(4));
      }
    });
}

export function formatTimeZoneAndLabel(timezone: string): { label: string; value: string; } {
  const offset = getCurrentTimeZoneOffset(timezone);
  const timezoneLabel = `UTC${offset >= 0 ? '+' : ''}${offset}`;
  return { label: timezoneLabel, value: timezone };
}

export function findTimeZone(utcTimeZoneCode = UTC_TIMEZONE_ZERO): string {
  return listTheTimeZones().find(timezone => timezone.label === utcTimeZoneCode)?.value;
}

export function isIsoDate(date: string): boolean {
  return DATE_REGEX_PATTERN.test(date);
}

/**
 * Converti une date au format Date ou string en un string au format ISO (YYYY-MM-DDTHH:MM:SSZ)
 * @param date
 */
export function convertDateToISOString(date: string | Date): string | null {
  if (!date) {
    return null;
  } else if (date instanceof Date) {
    return date.toISOString();
  } else if (isIsoDate(date)) {
    return date;
  } else {
    return new Date(parseDateTimeToTimezone(date, UTC_TIMEZONE)).toISOString();
  }
}

export function isDateRangeValid(dateStart: string, timeOfDayStart: string, dateEnd: string, timeOfDayEnd: string): boolean {
  const start = dateStart ?
    parseFromString(`${formatDate(dateStart)} ${timeOfDayStart ?? '00:00'}`, FRENCH_DATE_TIME_FORMAT)
    : null;
  const end = dateEnd ?
    parseFromString(`${formatDate(dateEnd)} ${timeOfDayEnd ?? '23:59'}`, FRENCH_DATE_TIME_FORMAT)
    : null;
  return checkDates(start, end);
}

export function formatDate(date: string): string {
  if (!date || !ENGLISH_DATE_REGEX_PATTERN.test(date)) { return date; }
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

export function formatTimezone(timezone: string): string {
  if (!timezone || !UTC_REGEX_PATTERN.test(timezone)) { return timezone; }
  // slice(4) to remove the label 'UTC+' from string and extract the value ('UTC+10' -> '10')
  const time = timezone.slice(4);
  const splitTime = time.split('.');

  let hours = splitTime[0];
  if (hours.length === 1) {
    hours = '0' + hours;
  }

  const minutes = splitTime.length > 1 ? `${60 * Number(splitTime[1]) / 100}` : '00';

  // timezone.slice(0, 3) -> 'UTC'
  // timezone.slice(3, 4) -> '+' ou '-'
  // If time is '0', we don't display value +0 of UTC
  const timeZoneValue = time !== '0' ? ` ${timezone.slice(3, 4)}${hours}:${minutes.length === 1 ? minutes + '0' : minutes}` : '';
  return `${timezone.slice(0, 3)}` + timeZoneValue;
}

export function checkDates(dateStart: Date, dateEnd: Date): boolean {
  return dateStart === null && dateEnd !== null || dateStart !== null && dateEnd === null || isBefore(dateStart, dateEnd);
}

export function dateValidated(validDate: boolean, period: DateRange, required = false): boolean {
  if (!required && (!period || !period.dateStart && !period.dateEnd)) {
    return false;
  }

  if (required && (!period || !period.dateStart || !period.dateEnd) || !required && period && (!period.dateStart || !period.dateEnd)) {
    return true;
  }

  return !validDate;
}

export function formatPeriodForCreation(period: DateRange): DateRange {
  if (!period) { return period; }

  if (period.dateStart && FRENCH_DATE_REGEX_PATTERN.test(period.dateStart)) {
    period.dateStart = formatFrenchDateToIsoDate(period.dateStart);
  }

  if (period.dateEnd && FRENCH_DATE_REGEX_PATTERN.test(period.dateEnd)) {
    period.dateEnd = formatFrenchDateToIsoDate(period.dateEnd);
  }

  return period;
}

export function formatPeriodForEdition(period: DateRange): DateRange {
  if (!period) { return period; }

  const newPeriod: DateRange = {
    dateStart: null,
    dateEnd: null,
    timeOfDayStart: null,
    timeOfDayEnd: null
  }

  if (period.dateStart) {
    newPeriod.dateStart = formatDate(period.dateStart);
  }

  if (period.dateEnd) {
    newPeriod.dateEnd = formatDate(period.dateEnd);
  }

  return cloneDeep(newPeriod);
}

export function parseDate(date: string): { year: number, month: number, day: number } {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month: month - 1, day };
};

export function formatDateToPattern(date: string, pattern: string): string {
  const { year, month, day } = parseDate(date);
  return format(new Date(year, month, day), pattern);
}

