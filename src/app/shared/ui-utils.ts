import { FormControl } from '@angular/forms';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { listWarningHazardTypeDetails, listWarningHazardTypeGeneral } from '@app/models/warning.model';
import { TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';

export type TranslatedOption = { key: string, value: string };

export type TranslatedOptionList = Array<TranslatedOption>;

export type TranslatedOptionGroup = { value?: string, items?: string[] };

export type TranslatedOptionListWithGroups = Array<TranslatedOptionGroup>;

export function getCssProperty(classOrId: string, property: string): string {
  const firstChar = classOrId.charAt(0);
  const remaining = classOrId.substring(1);
  const elem = (firstChar === '#') ? document.getElementById(remaining) : document.getElementsByClassName(remaining)[0];
  if (elem instanceof Element) {
    return window.getComputedStyle(elem, null).getPropertyValue(property);
  }
  return null;
}

export function isFilterBarShown(): boolean {
  return getCssProperty('.filter-bar', 'display') === 'flex';
}

export function copyToClipboard(value: string, multiline = false): void {
  const tempDomElement = document.createElement(multiline ? 'textarea' : 'input');
  document.body.appendChild(tempDomElement);
  tempDomElement.value = value;
  tempDomElement.select();
  document.execCommand('copy');
  document.body.removeChild(tempDomElement);
}

export function showToast(alertMessageService: AlertMessageService, detail: string, severity: MessageSeverity = 'error'): void {
  alertMessageService.add({
    summary: `message.summary.${severity === 'error' ? 'error' : 'success'}`,
    severity,
    detail
  });
}

export function translatedTypeDetails(translate: TranslateService, typeDetails: string): string {
  // typeDetails could be a value from WarningHazardTypeGeneral or WarningHazardTypeDetails, so we merge both arrays
  const typeGeneralAndDetails = [...listWarningHazardTypeGeneral, ...listWarningHazardTypeDetails];
  return translate.instant(typeGeneralAndDetails.find(type => type.key === typeDetails).value);
}

export function isLocalLangSelected(translate: TranslateService): boolean {
  return translate.currentLang === 'fr';
}

export function formatSize(bytes, suffixByte): string {
  const suffix = suffixByte;
  if (bytes === 0) {
    return `0 ${suffix}`;
  }
  const k = 1000;
  const dm = 3;
  const sizes = [suffix, `K${suffix}`, `M${suffix}`, `G${suffix}`, `T${suffix}`, `P${suffix}`, `E${suffix}`, `Z${suffix}`, `Y${suffix}`];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getI18nValue(list: TranslatedOptionList, translationKey: string): string {
  const foundKeyValue = list.find(({ key }) => key === translationKey);
  if (foundKeyValue) {
    return foundKeyValue.value;
  }
  return translationKey;
}

export function translateI18nKeyValueArray(translate: TranslateService, list: TranslatedOptionList): TranslatedOptionList {
  return list.map(({ key, value }) => ({ key, value: translate.instant(value) })
  );
}

export function generateYearsBetween(startYear: number, endYear: number): number[] {
  const endDate = endYear || new Date().getFullYear();
  const years = [];

  for (let i = startYear; i <= endDate; i++) {
    years.push(startYear);
    startYear++;
  }
  return years;
}

export function checkIfDeviceIsMobile(deviceDetectorService: DeviceDetectorService): boolean {
  const userAgent = navigator.userAgent;
  return (deviceDetectorService.isMobile() || deviceDetectorService.isTablet())
    && (window.matchMedia('(orientation: portrait)').matches && /Android|webOS|iPhone|iPad|iPod|Opera Mini|BlackBerry|Mobile|mobile|Windows Phone/i.test(userAgent));
}

/**
 * Disable enter key except in text area to avoid submit form in GR and IS creation because of carto button
 * @param event
 */
export function handleEnterKeyPress(event: any): boolean {
  return event.target.tagName.toLowerCase() === 'textarea';
}

export function noWhitespaceValidator(control: FormControl) {
  const isSpace = checkIfSpacesOnly(control.value || '');
  return isSpace ? { 'whitespace': true } : null;
}

export function checkIfSpacesOnly(value: string): boolean {
  const isSpace = value?.match(/^\s+$/g);
  return !!isSpace;
}
