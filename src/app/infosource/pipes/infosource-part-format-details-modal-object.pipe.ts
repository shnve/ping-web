import { Pipe, PipeTransform } from '@angular/core';
import { CalendarPeriod, SeasonalPeriod, activities, restrictionCategories } from '@app/georegulation/models/georegulation.model';
import { GlobalConstants } from '@app/global-constants';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { FormatDatetimePipe } from '@app/shared/pipes/format-datetime.pipe';
import { FormatMonthPipe } from '@app/shared/pipes/format-month.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import {
  InfosourceDateRange,
  InfosourceObjectMapKeys,
  InfosourceSurveyTransmissionObjectKeys,
  TRANSLATIONS_LIST_INFOSOURCE_OBJECT
} from '../models/infosource.model';
import { InfosourceFormatDateRangePipe } from './infosource-format-date-range.pipe';
import { InfosourceFormatInformationPipe } from './infosource-format-information.pipe';

@Pipe({
  name: 'infosourcePartFormatDetailsModalObject',
  pure: false
})
export class InfosourcePartFormatDetailsModalObjectPipe implements PipeTransform {

  constructor(private readonly translate: TranslateService,
    private readonly infosourceFormatDateRangePipe: InfosourceFormatDateRangePipe,
    private readonly capitalizeFirstPipe: CapitalizeFirstPipe,
    private readonly infosourceFormatInfomationPipe: InfosourceFormatInformationPipe,
    private readonly formatDatetimePipe: FormatDatetimePipe,
    private readonly localizedDatePipe: LocalizedDatePipe,
    private readonly formatMonthPipe: FormatMonthPipe) {
  }

  transform(objectKeyValue: { key: string, value: any }, objectMap: Map<{ key: string }, { value: any }>, isObject: boolean,
    timezone = GlobalConstants.USER_TIMEZONE, isForExportPdf = false): string {
    return isObject ?
      this.switchOnObjects(objectKeyValue, objectMap, isForExportPdf) :
      this.switchOnDetails(objectKeyValue, objectMap, timezone);
  }

  private switchOnDetails(objectKeyValue: { key: string, value: any }, objectMap: Map<{ key: string }, { value: any }>, timezone: string): string {
    const label = this.translate.instant(`infosource.details.object-map.label.${objectKeyValue.key}`);
    let labelSuffix = '';
    let displayedValue = objectKeyValue.value;
    switch (objectKeyValue.key) {
      case InfosourceObjectMapKeys.OBJECT_NAME:
        labelSuffix = this.translate.instant(
          `infosource.details.object-map.label-suffix.${objectMap[InfosourceObjectMapKeys.MARKUP_TYPE]}`);
        break;
      case InfosourceObjectMapKeys.MARKUP_TYPE:
        displayedValue = this.translate.instant(`enum.infosource-markup-type.${displayedValue.toLowerCase()}`);
        break;
      case InfosourceObjectMapKeys.INFORMATION:
        displayedValue = this.infosourceFormatInfomationPipe.transform(displayedValue);
        break;
      case InfosourceObjectMapKeys.DATE_RANGES:
        const dateRanges = objectKeyValue.value as Array<InfosourceDateRange>;
        displayedValue = dateRanges.reduce((acc, curr) => {
          acc += this.capitalizeFirstPipe.transform(this.infosourceFormatDateRangePipe.transform(curr, timezone)) +
            GlobalConstants.LINE_SEPARATOR;
          return acc;
        }, GlobalConstants.LINE_SEPARATOR);
        break;
      case InfosourceObjectMapKeys.OBSERVATION_DATE:
        displayedValue = this.formatDatetimePipe.transform(objectKeyValue.value, timezone);
        break;
      default:
        break;
    }
    return `<span class="infosource-detail-label">${label}${labelSuffix} :</span> ${displayedValue}`;
  }

  private switchOnObjects(objectKeyValue: { key: string, value: any }, objectMap: Map<{ key: string }, { value: any }>, isForExportPdf = false,
    timezone = GlobalConstants.USER_TIMEZONE): string {
    let translateKey = objectKeyValue.key.includes('_') ? objectKeyValue.key.toLowerCase().replaceAll('_', '-') : objectKeyValue.key;
    if (translateKey.toUpperCase() === translateKey) {
      translateKey = translateKey.toLowerCase();
    }
    let label = this.translate.instant(`infosource.objects.object-map.label.${translateKey}`);
    let startSeparator = '';
    let endSeparator = '';
    let displayedValue = objectKeyValue.value;
    switch (objectKeyValue.key) {
      case InfosourceObjectMapKeys.INDICATION_INCIDENT_CODE:
      case InfosourceObjectMapKeys.RECOVERY_TIME_CODE:
      case InfosourceObjectMapKeys.NATURAL_NOTICE_CODE:
      case InfosourceObjectMapKeys.TITLE_INCIDENT_CODE:
      case InfosourceObjectMapKeys.TITLE_CMS_CODE:
        const enumName = TRANSLATIONS_LIST_INFOSOURCE_OBJECT.find(tlio => tlio.key === objectKeyValue.key).value;
        displayedValue = this.translate.instant(`${enumName}.${displayedValue}`);
        break;
      case InfosourceObjectMapKeys.GEOREGULATION_NUMBER:
        const additionalNumbers = objectMap[InfosourceObjectMapKeys.GEOREGULATION_ADDITIONAL_NUMBERS]?.join(', ');
        if (additionalNumbers) {
          displayedValue += ', ' + additionalNumbers;
        }
        break;
      case InfosourceObjectMapKeys.GEOREGULATION_ADDITIONAL_NUMBERS:
        return '';
      case InfosourceObjectMapKeys.GEOREGULATION_TYPE:
        displayedValue = this.translate.instant(`georegulation.type.${displayedValue}`);
        break;
      case InfosourceObjectMapKeys.GEOREGULATION_ACTIVITIES:
        displayedValue = displayedValue.map(activityValue => this.translate.instant(activities.find(activityEnum => activityEnum.key === activityValue).value)).join(', ');
        break;
      case InfosourceObjectMapKeys.GEOREGULATION_MARITIME_ENTITY:
        displayedValue = displayedValue.join(', ');
        break;
      case InfosourceObjectMapKeys.GEOREGULATION_SEASONAL_PERIODS:
        displayedValue = this.formatGeoregulationSeasonalPeriods(displayedValue);
        break;
      case InfosourceObjectMapKeys.GEOREGULATION_CALENDAR_PERIODS:
        label = this.translate.instant('infosource.objects.object-map.label.georegulationTemporary') + ' - ' + label;
        displayedValue = this.formatGeoregulationCalendarPeriods(displayedValue);
        break;
      case InfosourceObjectMapKeys.GEOREGULATION_PART_DETAILS:
        label = '';
        endSeparator = '<hr/><br/>';
        if (isForExportPdf) {
          startSeparator = '<br/><hr/>';
          label = this.translate.instant('admin-warning.creation.parts.part-number', { number: displayedValue[InfosourceObjectMapKeys.GEOREGULATION_PART_NUMBER] });
        }
        displayedValue = this.formatGeoregulationPartDetails(Object.entries(displayedValue).map(([key, value]) => ({ key, value })));
        break;
      case InfosourceSurveyTransmissionObjectKeys.TRANSMISSION_DATE:
        displayedValue = this.formatDatetimePipe.transform(displayedValue, timezone);
        break;
      case InfosourceSurveyTransmissionObjectKeys.PERIOD:
        displayedValue = this.capitalizeFirstPipe.transform(this.infosourceFormatDateRangePipe.transform(displayedValue, timezone));
        break;
      case InfosourceSurveyTransmissionObjectKeys.SURVEY_ID:
        label = '';
        displayedValue = `<a href="/${environment.surveySharedUrlContext}/${displayedValue}" rel="noopener noreferrer" target="_blank">${this.translate.instant(`infosource.objects.object-map.label.${objectKeyValue.key.toLowerCase().replaceAll('_', '-')}`)}</a>`;
        break;
      case InfosourceObjectMapKeys.GEOREGULATION_SUMMARY:
      case InfosourceObjectMapKeys.GEOREGULATION_TITLE:
      default:
        break;
    }
    return label.length ? `${startSeparator}<span class="infosource-detail-label">${label} :</span> ${displayedValue}${endSeparator}` : '' + `${displayedValue}${endSeparator}`;
  }

  private formatGeoregulationPartDetails(objectKeyValueArray: { key: string, value: any }[]): string {
    return objectKeyValueArray.reduce((previousValue, currentValue) => previousValue + this.formatGeoregulationPartDetail(currentValue) + '<br/>', '');
  }

  private formatGeoregulationPartDetail(objectKeyValue: { key: string, value: any }): string {
    let label = '';
    let displayedValue = objectKeyValue.value;
    switch (objectKeyValue.key) {
      case InfosourceObjectMapKeys.GEOREGULATION_PART_TYPES:
        label = this.translate.instant('georegulation.modal.part-types');
        displayedValue = displayedValue.map(partType => this.translate.instant(restrictionCategories.find(restrictionCategoryEnum => restrictionCategoryEnum.key === partType).value)).join(', ');
        break;
      case InfosourceObjectMapKeys.GEOREGULATION_SEASONAL_PERIODS:
        label = this.translate.instant('infosource.objects.object-map.label.georegulationSeasonalPeriods');
        displayedValue = this.formatGeoregulationSeasonalPeriods(displayedValue);
        break;
      case InfosourceObjectMapKeys.GEOREGULATION_CALENDAR_PERIODS:
        label = this.translate.instant('infosource.objects.object-map.label.georegulationTemporary') + ' - ' + this.translate.instant('georegulation.modal.periods');
        displayedValue = this.formatGeoregulationCalendarPeriods(displayedValue);
        break;
      case InfosourceObjectMapKeys.GEOREGULATION_PART_INFORMATION:
        if (this.translate.currentLang !== 'es') {
          displayedValue = '';
        }
        break;
      case InfosourceObjectMapKeys.GEOREGULATION_PART_INTERNATIONAL_INFORMATION:
        if (this.translate.currentLang === 'es') {
          displayedValue = '';
        }
        break;
      default:
        displayedValue = '';
        break;
    }
    return label !== '' ? `<span class="infosource-detail-label">${label} :</span> ${displayedValue}` : displayedValue;
  }

  private formatGeoregulationCalendarPeriods(calendarPeriods: CalendarPeriod[]): string {
    return calendarPeriods.map(calendarPeriod => {
      let periods = '';
      if (calendarPeriod.dateStart) {
        if (calendarPeriod.dateEnd) {
          periods += `${this.translate.instant('georegulation.modal.period.start-label')} `;
        } else {
          periods += `${this.translate.instant('georegulation.modal.period.start-label-without-end')} `;
        }
        periods += this.localizedDatePipe.transform(calendarPeriod.dateStart);
      }
      if (calendarPeriod.dateEnd) {
        if (calendarPeriod.dateStart) {
          periods += ` ${this.translate.instant('georegulation.modal.period.end-label')} `;
        } else {
          periods += `${this.translate.instant('georegulation.modal.period.end-label-without-start')} `;
        }
        periods += this.localizedDatePipe.transform(calendarPeriod.dateEnd);
      }
      return periods;
    }).join(', ');
  }

  private formatGeoregulationSeasonalPeriods(seasonalPeriods: SeasonalPeriod[]): string {
    return '<br/>' + seasonalPeriods.map(seasonalPeriod => {
      let periods = '- ';
      if (seasonalPeriod.dayStart) {
        const monthKey = this.formatMonthPipe.transform(seasonalPeriod.monthStart);
        periods += `${this.translate.instant('georegulation.modal.seasonal-periods-start')} ${seasonalPeriod.dayStart} ${this.translate.instant(monthKey).toLowerCase()}`;
      }
      if (seasonalPeriod.dayEnd) {
        const monthKey = this.formatMonthPipe.transform(seasonalPeriod.monthEnd);
        periods += ` ${this.translate.instant('georegulation.modal.seasonal-periods-end')} ${seasonalPeriod.dayEnd} ${this.translate.instant(monthKey).toLowerCase()}`;
      }
      return periods;
    }).join('<br/>');
  }
}
