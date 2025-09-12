import { FormatMonthPipe } from '@app/shared/pipes/format-month.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { TranslateNamePipe } from '@app/shared/pipes/translate-name.pipe';
import { featureToGeojson } from '@app/sig/utils/feature';
import { TranslateService } from '@ngx-translate/core';
import { isEmpty } from 'lodash-es';
import { GeoregulationModalDetails, GeoregulationNumber, GeoregulationPart, GeoregulationPartForm, GeoregulationStatusEnum, JsonGeoregulationPart } from './models/georegulation.model';
import { GeoregulationFormatNumberPipe } from './pipes/georegulation-format-number.pipe';

export function getNumberForPart(searchedPart: GeoregulationPartForm, featureParts: GeoregulationPartForm[]): number {
  return featureParts.findIndex(part => part === searchedPart) + 1;
}

export function convertFeaturePartsToJsonFeatureParts(parts: GeoregulationPart[]): JsonGeoregulationPart[] {
  return parts.map((part: GeoregulationPart) => {
    return {
      ...part,
      features: part.features.map(feature => featureToGeojson(feature))
    };
  });
}

export function checkNumber(grNumber: GeoregulationNumber): boolean {
  return grNumber && !isEmpty('' + grNumber.year) && !isEmpty(grNumber.text) && grNumber.date && grNumber.authorityIds.length > 0;
}

export function checkNumbers(additionalNumbers: GeoregulationNumber[]): boolean {
  return additionalNumbers && additionalNumbers.every(grNumber => checkNumber(grNumber)) || !additionalNumbers;
}

export function buildHtmlFromModalDetails(translate: TranslateService,
  formatGeoregulationNumberPipe: GeoregulationFormatNumberPipe,
  localizedDatePipe: LocalizedDatePipe,
  translateNamePipe: TranslateNamePipe,
  formatMonthPipe: FormatMonthPipe,
  georegulation: GeoregulationModalDetails): string {
  const html = [`<div>! ${translate.instant('georegulation.modal.warning')}</div>`];
  addHtmlBreakLine(html);

  html.push(`<strong>${translate.instant('georegulation.modal.details-fieldset')}</strong>`);
  addHtmlBreakLine(html);

  html.push(`<div><span><strong>${translate.instant('georegulation.modal.numbers')}</strong> : </span><span>${formatGeoregulationNumberPipe.transform(georegulation.mainNumber)}</span>`);
  if (georegulation.additionalNumbers?.length) {
    georegulation.additionalNumbers.forEach(additionalNumber => {
      html.push(`, ${formatGeoregulationNumberPipe.transform(additionalNumber)}`);
    });
  }
  html.push(`</div>`);

  if (georegulation.temporary) {
    html.push(`<div><span><strong>${translate.instant('georegulation.modal.temporary')}</strong></span>`);
    if (georegulation.calendarPeriods?.length) {
      addCalendarPeriods(html, georegulation.calendarPeriods, translate, localizedDatePipe);
    }
    html.push('</div>');
  }

  if (georegulation.seasonalPeriods?.length) {
    addSeasonalPeriods(html, georegulation.seasonalPeriods, translate, formatMonthPipe);
  }

  html.push('<div>');
  html.push(`<span><strong>${translate.instant('georegulation.modal.type')} : </strong></span>`);
  html.push(`<span>${translate.instant('georegulation.type.' + georegulation.type)}</span>`);
  if (georegulation.hasCoastlineLimit) {
    html.push(`<span> - ${translate.instant('georegulation.modal.coastline-limit')}</span>`);
  }
  html.push('</div>');

  if (georegulation.activities?.length) {
    html.push('<div>');
    html.push(`<span><strong>${translate.instant('georegulation.modal.activities')} : </strong></span>`);
    const activities: string[] = [];
    georegulation.activities.forEach(activity => {
      activities.push(`<span>${translate.instant('enum.georegulation-activities.' + activity.toLocaleLowerCase())}</span>`);
    });
    html.push(activities.join(', '));
    html.push('</div>');
  }

  if (georegulation.title) {
    html.push('<div>');
    html.push(`<span><strong>${translate.instant('georegulation.modal.title')} : </strong></span>`);
    html.push(`<span>${convertEOLToHtmlBreakLine(translateNamePipe.transform({ name: georegulation.title, internationalName: georegulation.internationalTitle }))}</span>`);
    html.push('</div>');
  }

  if (georegulation.entities?.length) {
    html.push('<div>');
    html.push(`<span><strong>${translate.instant('georegulation.modal.entities')} : </strong></span>`);
    const entities: string[] = [];
    georegulation.entities.forEach(entity => {
      entities.push(`<span>${translateNamePipe.transform(entity)}</span>`);
    });
    html.push(entities.join(', '));
    html.push('</div>');
  }

  if (georegulation.summary) {
    html.push('<div>');
    html.push(`<span><strong>${translate.instant('georegulation.modal.summary')} : </strong></span>`);
    html.push(`<span>${convertEOLToHtmlBreakLine(translateNamePipe.transform({ name: georegulation.summary, internationalName: georegulation.internationalSummary }))}</span>`);
    html.push('</div>');
  }
  html.push(`<span><strong>${translate.instant('georegulation.modal.areas')} : </strong></span>`);

  addHtmlBreakLine(html);

  let partIndex = 1;
  georegulation.parts.forEach(part => {
    html.push(`<strong>${translate.instant('georegulation.modal.part-fieldset')} ${partIndex}</strong>`);
    if (!part.types?.length && !part.calendarPeriods?.length && !part.seasonalPeriods?.length && !part.information) {
      html.push(`<em>${translate.instant('georegulation.modal.no-part-information')}</em>`);
    } else {
      if (part.types?.length) {
        html.push('<div>');
        html.push(`<span><strong>${translate.instant('georegulation.modal.part-types')} : </strong></span>`);
        const types: string[] = [];
        part.types.forEach(type => {
          types.push(`<span>${translate.instant('enum.georegulation-restrictions.' + type.toLowerCase())}</span>`);
        });
        html.push(types.join(', '));
        html.push('</div>');
      }

      if (georegulation.temporary) {
        html.push(`<div><span><strong>${translate.instant('georegulation.modal.temporary')}</strong></span>`);
        if (part.calendarPeriods?.length) {
          addCalendarPeriods(html, part.calendarPeriods, translate, localizedDatePipe);
        }
        html.push('</div>');
      }

      if (part.seasonalPeriods?.length) {
        addSeasonalPeriods(html, part.seasonalPeriods, translate, formatMonthPipe);
      }

      if (part.information) {
        html.push('<div>');
        html.push(`<span>${convertEOLToHtmlBreakLine(translateNamePipe.transform({ name: part.information, internationalName: part.internationalInformation }))}</span>`);
        html.push('</div>');
      }
    }

    partIndex++;
    addHtmlBreakLine(html);
  });

  if (georegulation.attachments?.length) {
    addHtmlHorizontalLine(html);

    html.push(`<strong>${translate.instant('georegulation.modal.attachments-fieldset')}</strong>`);
    addHtmlBreakLine(html);

    html.push(`<div><ul>`);
    georegulation.attachments.forEach(attachment => {
      html.push(`<li>${attachment.filename}</li>`);
    });
    html.push('</ul></div>');
  }

  if (georegulation.links?.length) {
    addHtmlHorizontalLine(html);

    html.push(`<strong>${translate.instant('georegulation.modal.links-fieldset')}</strong>`);
    addHtmlBreakLine(html);

    html.push(`<div><ul>`);
    georegulation.links.forEach(link => {
      html.push(`<li>${link}</li>`);
    });
    html.push('</ul></div>');
  }

  addHtmlHorizontalLine(html);

  html.push(`<strong>${translate.instant('georegulation.modal.status-fieldset')}</strong>`);
  addHtmlBreakLine(html);

  html.push('<div>');
  switch (georegulation.status) {
    case GeoregulationStatusEnum.DRAFT:
      html.push(` <span>${translate.instant('enum.georegulation-status.' + georegulation.status.toLocaleLowerCase())}</span>`);
      break;
    case GeoregulationStatusEnum.PUBLISHED:
      html.push(` <span>${translate.instant('georegulation.modal.status-published')} ${localizedDatePipe.transform(georegulation.publicationDate)}</span>`);
      break;
    case GeoregulationStatusEnum.REPEALED:
      html.push(` <span>${translate.instant('georegulation.modal.status-repealed')} ${localizedDatePipe.transform(georegulation.repealDate)}</span>`);
      break;
  }
  html.push('</div>');

  html.push('<div>');
  html.push(`<span><strong>${translate.instant('georegulation.modal.last-update')} : </strong></span>`);
  html.push(`<span>${localizedDatePipe.transform(georegulation.lastUpdate)}</span>`);
  if (georegulation.lastUpdateUser) {
    html.push(`<span> (${georegulation.lastUpdateUser})</span>`);
  }
  html.push('</div>');

  if (georegulation.issuingService) {
    html.push('<div>');
    html.push(`<span><strong>${translate.instant('georegulation.modal.issuing-service')} : </strong></span>`);
    html.push(`<span>${translateNamePipe.transform(georegulation.issuingService)}</span>`);
    html.push('</div>');
  }

  html.push(`<div><span><strong>`);
  if (georegulation.isPublic) {
    html.push(`${translate.instant('georegulation.modal.is-public')}`);
  } else {
    html.push(`${translate.instant('georegulation.modal.is-not-public')}`);
  }
  html.push(`</strong></span></div>`);

  if (georegulation.internalComment) {
    addHtmlHorizontalLine(html);

    html.push(`<strong>${translate.instant('georegulation.modal.internal-comment-fieldset')}</strong>`);
    addHtmlBreakLine(html);

    html.push(`<div>${convertEOLToHtmlBreakLine(georegulation.internalComment)}</div>`);
  }

  return html.join('');
}

const addHtmlBreakLine = html => {
  html.push('<br />');
};

const addHtmlHorizontalLine = html => {
  html.push('<hr />');
};

const convertEOLToHtmlBreakLine = html => html.replaceAll('\n', '<br />');

const addCalendarPeriods = (html, calendarPeriods, translate, localizedDatePipe) => {
  html.push(`<span><strong> - ${translate.instant('georegulation.modal.periods')} : </strong></span>`);
  calendarPeriods.forEach((calendarPeriod, index) => {
    if (index !== 0) {
      html.push(`, `);
    }
    html.push(`<span>`);
    if (calendarPeriod.dateStart) {
      if (calendarPeriod.dateEnd) {
        html.push(`${translate.instant('georegulation.modal.period.start-label')} `);
      } else {
        html.push(`${translate.instant('georegulation.modal.period.start-label-without-end')} `);
      }
      html.push(`${localizedDatePipe.transform(calendarPeriod.dateStart)}`);
    }
    if (calendarPeriod.dateEnd) {
      if (calendarPeriod.dateStart) {
        html.push(` ${translate.instant('georegulation.modal.period.end-label')} `);
      } else {
        html.push(`${translate.instant('georegulation.modal.period.end-label-without-start')} `);
      }
      html.push(`${localizedDatePipe.transform(calendarPeriod.dateEnd)}`);
    }
    html.push(`</span>`);
  });
};

const addSeasonalPeriods = (html, seasonalPeriods, translate, formatMonthPipe) => {
  html.push(`<div><span><strong>${translate.instant('georegulation.modal.seasonal-periods')} : </strong></span></div>`);
  seasonalPeriods.forEach(seasonalPeriod => {
    html.push('<div>-');
    if (seasonalPeriod.dayStart) {
      const monthKey = formatMonthPipe.transform(seasonalPeriod.monthStart);
      html.push(`<span> ${translate.instant('georegulation.modal.seasonal-periods-start')} ${seasonalPeriod.dayStart} ${translate.instant(monthKey).toLowerCase()}</span>`);
    }
    if (seasonalPeriod.dayEnd) {
      const monthKey = formatMonthPipe.transform(seasonalPeriod.monthEnd);
      html.push(`<span> ${translate.instant('georegulation.modal.seasonal-periods-end')} ${seasonalPeriod.dayEnd} ${translate.instant(monthKey).toLowerCase()}</span>`);
    }
    html.push('</div>');
  });
};

export function convertFromJsonGeoregulationNumberDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}${month}${year}`;
}

export function convertToJsonGeoregulationNumberDate(date: string): string {
  const [, day, month, year] = /^(\d{2})(\d{2})(\d{4})$/.exec(date);
  return `${year}-${month}-${day}`;
}
