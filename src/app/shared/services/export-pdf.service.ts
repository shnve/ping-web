import { Injectable } from '@angular/core';
import { WarningTableFacade } from '@app/facades/warnings-table.facade';
import { InfosourceNature, InfosourcePart, InfosourceWithParts, TRANSLATIONS_LIST_INFOSOURCE_NATURE, TRANSLATIONS_LIST_INFOSOURCE_STATUS } from '@app/infosource/models/infosource.model';
import { InfosourcePartFormatDetailsModalObjectPipe } from '@app/infosource/pipes/infosource-part-format-details-modal-object.pipe';
import { Serie } from '@app/models/serie.model';
import { SubArea } from '@app/models/sub-area.model';
import { TableFilterValues } from '@app/models/warning-filters.model';
import { TableWarning, Warning, WarningFeaturePart } from '@app/models/warning.model';
import { ModelItemTablePage } from '@app/shared/models/paginated-table-view.model';
import { SurveyDetails } from '@app/survey/models/survey.model';
import { TranslateService } from '@ngx-translate/core';
import { Column } from '@shared/components/paginated-table/paginated-table.component';
import { FormatWarningNumberPipe } from '@shared/pipes/format-warning-number.pipe';
import { FormatWarningTitlePipe } from '@shared/pipes/format-warning-title.pipe';
import { format, utcToZonedTime } from 'date-fns-tz';
import htmlToPdfmake from 'html-to-pdfmake';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { isEmpty } from 'lodash-es';
import { Map } from 'ol';
import { Observable } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';
import { DateRange } from '../models/date-range.model';
import { FormatDateRangePipe } from '../pipes/format-date-range.pipe';
import { FormatFeaturePartDetailsPipe } from '../pipes/format-feature-part-details.pipe';
import { FormatLocalizedTextPipe } from '../pipes/format-localized-text.pipe';
import { LocalizedDatePipe } from '../pipes/localized-date.pipe';
import { getI18nValue, translatedTypeDetails } from '../ui-utils';
import { QrCodeService } from '@shared/services/qrcode/qr-code.service';
import { getSharedLinkUrl } from '@shared/warning-utils';

const DISPLAYED_DATE_FORMAT = 'dd/MM/yyyy';
const mime = 'image/png';
const HR_HTML = '<hr/>';

@Injectable({
  providedIn: 'root'
})
export class ExportPdfService {

  pdfMake: any;
  private logoBase64Promise: Promise<string> | null = null;

  async loadPdfMaker() {
    if (!this.pdfMake) {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      this.pdfMake = pdfMakeModule.default;
      this.pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
    }
  }

  private getLogoBase64(): Promise<string> {
    if (!this.logoBase64Promise) {
      this.logoBase64Promise = fetch('assets/images/logo_pdf.png')
        .then(response => {
          if (!response.ok) {
            return fetch('assets/images/logos_pdf.png');
          }
          return response;
        })
        .then(response => response.blob())
        .then(blob => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(blob);
        }))
        .catch(() => '');
    }
    return this.logoBase64Promise;
  }

  constructor(private readonly formatWarningNumberPipe: FormatWarningNumberPipe,
    private readonly formatWarningTitlePipe: FormatWarningTitlePipe,
    private readonly formatFeaturePartDetailsPipe: FormatFeaturePartDetailsPipe,
    private readonly formatLocalizedTextPipe: FormatLocalizedTextPipe,
    private readonly formatDateRangePipe: FormatDateRangePipe,
    private readonly localizedDatePipe: LocalizedDatePipe,
    private readonly warningTableFacade: WarningTableFacade,
    private readonly infosourcePartFormatDetailsModalObjectPipe: InfosourcePartFormatDetailsModalObjectPipe,
    private readonly translate: TranslateService) { }

  private buildGeneratedDateTime(): string {
    const formatInTimeZone = (date, fmt, tz) => format(utcToZonedTime(date, tz), fmt, { timeZone: tz });
    return formatInTimeZone(new Date().toISOString(), 'dd/MM/yyyy HH:mm:ss \'UTC\'', 'UTC');
  }

  private formatWarningNumberForPrinting(warning: Warning): string {
    const nameOfSeries = warning.nameOfSeries ?? '';
    if (!warning.warningNumber) {
      return nameOfSeries;
    }
    const year = (warning.year ?? '').toString();
    return `${nameOfSeries} ${warning.warningNumber}_${year.substring(2)}`;
  }

  async exportWarningModal(warning: Warning, olMap: Map): Promise<void> {
    const cartoMapCanvasCssSelectors = 'sig-warning-detail-map .map-container .ol-viewport .ol-layers .ol-layer canvas';
    const pdfName = `${this.formatWarningNumberForPrinting(warning)}.pdf`;
    const title = `${this.formatWarningNumberPipe.transform(warning)} ${this.translate.instant('detail.title')}`;
    const sharedLinkUrl = getSharedLinkUrl(warning.id, window.location.href);
    this.exportModal(cartoMapCanvasCssSelectors, pdfName, title, olMap, this.buildWarningHtml(this.convertWarningToTableWarning(warning)), sharedLinkUrl);
  }

  exportSurveyModal(survey: SurveyDetails, olMap: Map): void {
    const cartoMapCanvasCssSelectors = 'sig-warning-detail-map .map-container .ol-viewport .ol-layers .ol-layer canvas';
    const pdfName = `${survey.nameAndLocation ?? 'document'}.pdf`;
    const title = `${survey.nameAndLocation ?? ''} ${this.translate.instant('detail.title')}`;

    this.exportModal(cartoMapCanvasCssSelectors, pdfName, [title], olMap, this.buildSurveyHtml(survey));
  }

  exportInfosourceModal(infosource: InfosourceWithParts, olMap: Map): void {
    const cartoMapCanvasCssSelectors = 'infosource-details-map .map-container .ol-viewport .ol-layers .ol-layer canvas';
    const pdfName = `${infosource.number ?? 'document'}.pdf`;
    const title = `${infosource.number ?? ''} ${this.translate.instant('detail.title')}`;
    const Infosourcenumber = infosource.number ? `<li>${this.translate.instant('detail.number')} : ${infosource.number}</li>` : ``;

    this.exportModal(cartoMapCanvasCssSelectors, pdfName, [title], olMap, this.buildInfosourceHtml(infosource, Infosourcenumber));
  }

  async exportModal(cartoMapCanvasCssSelectors: string, pdfName: string, title: string | Object[], olMap: Map, builtHtmlItem: string, linkUrl?: string): Promise<void> {
    await this.loadPdfMaker();
    const logoDataUrl = await this.getLogoBase64();

    let mapImage = '';
    if (olMap) {
      const imageOptions = { backgroundColor: 'white', quality: 1.0 };

      olMap.updateSize();
      const modelExtent = olMap.get('modelExtent');
      if (modelExtent && Array.isArray(modelExtent) && modelExtent.every(v => Number.isFinite(v))) {
        olMap.getView().fit(modelExtent, {
          size: olMap.getSize(),
          padding: [50, 50, 50, 50],
          maxZoom: 13
        });
      }
      olMap.renderSync();

      const size = olMap.getSize();
      const mapWidthPx = size && size[0] > 0 ? size[0] : 600;
      const width = Math.min(460, Math.round(mapWidthPx * 0.65));

      const imageData = this.getMapAsImage(cartoMapCanvasCssSelectors, olMap, mime, imageOptions);
      mapImage = imageData ? `<img src="${imageData}" width="${width}" style="text-align: center;">` : '';
    }

    const logoHtml = logoDataUrl ? `<p data-pdfmake='{"margin": [0, 0, 0, 6]}'><img src="${logoDataUrl}" width="160"></p>` : '';
    const titleContent = title instanceof Array
      ? title.map(item => `<p>${item}</p>`).join('\n')
      : `<p data-pdfmake='{"margin": [0, 6, 0, 0]}'>${title}</p>`;

    let htmlTitle = '';
    if (linkUrl) {
      const imageQrcode = QrCodeService.getImageQrcode(linkUrl, 90);
      htmlTitle = `<table data-pdfmake='{"widths": ["*", 65]}'>
                  <tr>
                    <td style="border: none;">
                      ${logoHtml}
                      ${titleContent}
                    </td>
                    <td style="border: none;" class="qrCode">
                      ${imageQrcode}
                    </td>
                  </tr>
                </table>`;
    } else {
      htmlTitle = `${logoHtml}${titleContent}`;
    }

    const htmlContent = `${htmlTitle}<hr data-pdfmake='{"margin": [0, 0, 0, 0]}'>
                        <div class="map-carto">${mapImage}</div>
                        <div>${builtHtmlItem}</div>`;
    this.createPdf(htmlContent, pdfName, linkUrl);
  }

  private createPdf(htmlContent: string, pdfName: string, linkUrl?: string): void {
    const defaultStyles = {
      h1: {
        fontSize: 12,
        bold: false
      },
      h2: {
        fontSize: 11,
        bold: false
      },
      li: {
        marginBottom: 2.5
      }
    };
    const pdfmakeOptions = {
      tableAutoSize: false,
      defaultStyles,
      removeExtraBlanks: true
    };
    const pdfMakeContent = htmlToPdfmake(htmlContent, pdfmakeOptions);
    const docDefinition = {
      defaultFileName: pdfName,
      pageOrientation: 'portrait',
      content: pdfMakeContent,
      footer: (currentPage, pageCount): Object[] => {

        const pingText = `${this.translate.instant('title.description')}`;
        const generatedDateTime = this.buildGeneratedDateTime();
        // pages number
        const pagesNumbering = `${currentPage}/${pageCount}`;
        const footerContent: Object[] = [];
        if (linkUrl && currentPage === 1) {
          footerContent.push({ text: `${linkUrl}`, style: 'footer', margin: [0, 0, 0, 2] },);
        }

        footerContent.push({
          text: `${pingText}\n${generatedDateTime}`,
          style: 'footer'
        },);
        if (pageCount > 1) {
          footerContent.push({
            text: `${pagesNumbering}`,
            style: 'footer'
          },);
        }
        return footerContent;
      },
      pageMargins: [40, 20, 40, 65],
      styles: {
        footer: {
          alignment: 'center',
          fontSize: 10
        },
        'map-carto': {
          marginBottom: 10,
        },
        'qrCode': {
          alignment: 'center'
        }
      },
      pageBreakBefore: (currentNode, followingNodesOnPage) => {
        // We break page if the current node is taking more than 1 page and dont start at the beginning of the page
        return currentNode.pageNumbers.length > 1 && currentNode.startPosition && currentNode.startPosition.verticalRatio > 0.4;
      }
    };
    this.pdfMake.createPdf(docDefinition).open();
  }

  private convertWarningToTableWarning(warning: Warning): TableWarning {
    return {
      id: warning.id,
      nameOfSeries: warning.nameOfSeries,
      warningNumber: warning.warningNumber,
      year: warning.year,
      generalAreas: warning.generalAreas,
      localities: warning.localities,
      warningTypeDetails: warning.globalWarningType,
      warningHazardTypeGeneral: warning.warningHazardTypeGeneral,
      publicationTime: warning.publicationTime,
      featureParts: warning.featureParts,
      cancellationDate: warning.cancellationDate,
      cancelledWarnings: warning.cancelledWarnings,
      status: warning.status
    };
  }

  private buildWarningHtml(warning: TableWarning, isDetailsWarningTable = false): string {
    const addPublished = publicationTime =>
      publicationTime ? `${this.translate.instant('detail.published')} : ${this.localizedDatePipe.transform(publicationTime)}` : '';
    const addCancelledWarnings = cancelledWarnings => {
      if (cancelledWarnings.length) {
        let text = `<li>${this.translate.instant('detail.warnings-to-cancel')} : ${this.formatWarningNumberPipe.transform(cancelledWarnings.shift())}`;
        cancelledWarnings.forEach(cancelWarning => {
          text += `, ${this.formatWarningNumberPipe.transform(cancelWarning)}`;
        });
        return `${text}</li>`;
      }

      return '';
    };
    const addCancellationDate = cancellationDate =>
      cancellationDate ? `<li>${this.translate.instant('detail.to-be-cancelled')} : ${this.localizedDatePipe.transform(cancellationDate)}</li>` : '';
    const currentSharedLinkUrl = getSharedLinkUrl(warning.id, window.location.href);
    const detailNumber = `${this.translate.instant('detail.number')} : ${this.formatWarningNumberPipe.transform(warning)}`;
    const detailGeneralArea = `${this.translate.instant('detail.general-area')} : ${this.formatWarningTitlePipe.transform(warning)}`;
    const detailGeneralCategory = `${this.translate.instant('detail.general-category')} : ${translatedTypeDetails(this.translate, warning.warningHazardTypeGeneral)}`;
    const imageQrcode = QrCodeService.getImageQrcode(currentSharedLinkUrl, isDetailsWarningTable ? 90 : 120);
    const cancelledWarnings = addCancelledWarnings(warning.cancelledWarnings);
    const cancellationDate = addCancellationDate(warning.cancellationDate);

    const tableWithoutTemplate = `<li style="font-weight: bold">${detailNumber}</li>
                                  <li>${detailGeneralArea}</li>
                                  <li>${detailGeneralCategory}</li>
                                  ${cancelledWarnings}
                                  ${cancellationDate}`;

    const tableWithTemplate = `<table data-pdfmake='{"widths": ["*", 60]}'>
                                <tr>
                                  <td style="border: none;">
                                    <p style="font-weight: bold">${detailNumber}</p>
                                    <p>${detailGeneralArea}</p>
                                    <p>${detailGeneralCategory}</p>
                                    ${cancelledWarnings}
                                    ${cancellationDate}
                                  </td>
                                  <td style="border: none;" class="qrCode">
                                    ${imageQrcode}
                                  </td>
                                </tr>
                              </table>`;

    return `<div>
              <ul style="list-style-type: none;">
                ${isDetailsWarningTable ? tableWithTemplate : tableWithoutTemplate}
                <li><span style="font-weight: bold;">${this.translate.instant('detail.title')} : </span>${this.buildWarningDetailsFeaturePartHtml(warning.featureParts)}</li>
                <li><span style="font-weight: bold;">${this.translate.instant('detail.state')} : </span>
                  <ul>
                    <li>${this.translate.instant('detail.status')} : ${this.translate.instant('enum.warning-status.' + warning.status.toLowerCase())}</li>
                    <li>${addPublished(warning.publicationTime)}</li>
                  </ul>
                </li>
              </ul>
            </div>`;
  }

  private buildSurveyHtml(survey: SurveyDetails): string {
    return `<div>
              <ul style="list-style-type: none;">
                <li>${this.translate.instant('detail.number')} : ${survey}</li>
                </li>
                <br/>
                <li>${this.translate.instant('detail.status')} :
                </li>
              </ul>
            </div>`;
  }

  private buildInfosourceHtml(infosource: InfosourceWithParts, infosourceNumber: string): string {
    const featureDetails = !infosource.featureParts[0]?.object ? '' : `<li>
    ${this.translate.instant('detail.title')} : ${this.buildInfosourceDetailsFeaturePartHtml(infosource.featureParts,
      infosource.timezone, infosource.nature === InfosourceNature.GEOREGULATION)}
    </li>`;
    const infosourceObject = !infosource.object || isEmpty(infosource.object) ? '' : `<li>
    ${this.translate.instant('object.title')} : ${this.buildInfosourceObjectHtml(infosource, infosource.timezone)}
    </li>`;
    const creationDate = !infosource.creationDate ? '' : `<li> ${this.translate.instant('infosource.details.creationDate')} :
    ${this.localizedDatePipe.transform(infosource?.creationDate)}
    </li>`;
    const validationTime = !infosource.validationTime ? '' : `<li> ${this.translate.instant('infosource.details.status-sent')} :
    ${this.localizedDatePipe.transform(infosource?.validationTime)}
    </li>`;
    return `<div>
              <ul>
                <li>${this.translate.instant('infosource.details.nature')} :
                ${this.translate.instant(this.getInfosourceNature(infosource))}
                </li>
              </ul>
              <ul style="list-style-type: none;">
                ${infosourceNumber}
                <br/>
                ${infosourceObject}
                <br/>
                ${featureDetails}
                <li> ${this.translate.instant('detail.state')} : ${this.translate.instant(this.getStatus(infosource.status))} </li>
                ${creationDate}
                <li> ${this.translate.instant('infosource.details.lastUpdate')} :
                ${this.localizedDatePipe.transform(infosource?.lastUpdate)}
                </li>
                </li>
                ${validationTime}
              </li>
              </li>
              </ul>
            </div>`;
  }

  getInfosourceNature(infosource: InfosourceWithParts): string {
    return TRANSLATIONS_LIST_INFOSOURCE_NATURE.find(type => type.key === infosource.nature).value;
  }

  getStatus(infosourceStatusKey: string): string {
    return getI18nValue(TRANSLATIONS_LIST_INFOSOURCE_STATUS, infosourceStatusKey);
  }

  getInfosourceUserName(infosource: InfosourceWithParts): string {
    return `(${infosource.issuingUserFirstname} ${infosource.issuingUserLastname})`;
  }

  private getWarningListPdfHeader(title: string[] | Object[]): string {
    let header = '';
    title.forEach((item: string, index: number) => {
      header += `<p>${item}</p>`;
    });
    return header;
  }

  private buildWarningDetailsFeaturePartHtml(featureParts: WarningFeaturePart[]): string {
    return featureParts.reduce((acc, featurePart) => {
      acc += `${this.buildFeaturePartHtml(featurePart)}</br>`;
      return acc;
    }, '');
  }

  private buildInfosourceDetailsFeaturePartHtml(featureParts: InfosourcePart[], timezone: string, isNatureGeoregulation: boolean): string {
    return featureParts.reduce((acc, featurePart) => {
      acc += `${this.buildInfosourceFeaturePartHtml(featurePart, timezone, isNatureGeoregulation)}<br/>`;
      return acc;
    }, '');
  }

  private addDateRanges(dateRanges: Array<DateRange>): string {
    if (!dateRanges?.length) { return ''; }
    if (dateRanges.length === 1) {
      return `<div>${this.translate.instant('detail.range')} : ${this.formatDateRangePipe.transform(dateRanges[0])}</div>`;
    }
    const dateRangesHtml = dateRanges.reduce((acc, dateRange) => {
      acc += `<li>${this.formatDateRangePipe.transform(dateRange)}</li>`;
      return acc;
    }, '<ul style="list-style-type: none;">') + '</ul>';
    return `<div>${this.translate.instant('detail.ranges')} : ${dateRangesHtml}</div>`;
  }

  private buildFeaturePartHtml(featurePart: WarningFeaturePart): string {
    const addFeatureTypeDetails = typeDetails =>
      typeDetails ? `<div>${this.translate.instant('detail.category')} : ${this.formatFeaturePartDetailsPipe.transform(typeDetails)}</div>` : '';
    const addFeatureInformation = information =>
      !isEmpty(information) ? `<div style="white-space: pre-line;">${this.formatLocalizedTextPipe.transform(information)}</div>` : '';
    return `<table class="html-feature" data-pdfmake='{"widths": ["*"]}'><tr><td>
              ${addFeatureTypeDetails(featurePart.typeDetails)}
              ${this.addDateRanges(featurePart.dateRanges)}
              ${addFeatureInformation(featurePart.information)}
              </td></tr></table>`;
  }

  private buildInfosourceFeaturePartHtml(featurePart: InfosourcePart, timezone: string, isNatureGeoregulation: boolean): string {
    if (!featurePart?.object) { return ''; }
    let features = '';
    for (const [key, value] of Object.entries(featurePart.object)) {
      const details = this.infosourcePartFormatDetailsModalObjectPipe.transform({ key, value }, featurePart.object, isNatureGeoregulation, timezone, true);
      features += details ? details + '<br/>' : '';
    }
    features += !isNatureGeoregulation && featurePart?.description ? featurePart?.description : '';
    return `<table><tr><td>${features}</td></tr></table>`;
  }

  private buildInfosourceObjectHtml(infosource: InfosourceWithParts, timezone: string): string {
    if (!infosource?.object) { return; }
    let features = '';
    for (const [key, value] of Object.entries(infosource.object)) {
      features += `
      ${this.infosourcePartFormatDetailsModalObjectPipe.transform({ key, value }, infosource.object, true, timezone)}
      <br/>`;
    }
    return `<table><tr><td>${features}</td></tr></table>`;
  }

  async exportWarningTableDetailsFromWarningList(warnings: TableWarning[], pdfName: string, headerTitle: string[]): Promise<void> {
    await this.loadPdfMaker();
    const logoDataUrl = await this.getLogoBase64();
    const logoHtml = logoDataUrl ? `<p data-pdfmake='{"margin": [0, 0, 0, 6]}'><img src="${logoDataUrl}" width="160"></p>` : '';

    // warnings content
    const warningsHtml = warnings.reduce((acc, warning, index) => {
      acc += `${this.buildWarningHtml(warning, true)}`;
      if (index < warnings.length - 1) {
        acc += HR_HTML;
      }
      return acc;
    }, '');

    const htmlContent = `${logoHtml}${this.getWarningListPdfHeader(headerTitle)}<hr/>
                      <div>${warningsHtml}</div>`;
    this.createPdf(htmlContent, pdfName);
  }

  async exportWarningTableFromJsData(jsData: Array<Array<string>>, headers: Array<Array<string>>, pdfName: string, title: string, appliedFilters: string): Promise<void> {
    const logoDataUrl = await this.getLogoBase64();
    const pdf = new jsPDF('portrait', 'px', 'a4');
    const totalPagesExp = '{total_pages_count_string}';
    const pageSize = pdf.internal.pageSize;
    const pageHeight = pageSize.getHeight();
    const pageWidth = pageSize.getWidth();
    const middleWidth = pageWidth / 2;
    const marginHorizontal = 10;

    // set font color to black
    pdf.setTextColor('#000000');

    // header
    let yPos = 12;
    if (logoDataUrl) {
      pdf.addImage(logoDataUrl, 'PNG', marginHorizontal, 8, 110, 38);
      yPos = 56;
    }

    // title
    pdf.setFontSize(12);
    pdf.text(title, marginHorizontal, yPos);

    // applied filters
    pdf.setFontSize(11);
    const lineHeight = pdf.getLineHeight() / pdf.internal.scaleFactor;
    const appliedFiltersSplittedText = pdf.splitTextToSize(appliedFilters, pageWidth - 35, {});
    yPos += 12;
    pdf.text(appliedFiltersSplittedText, marginHorizontal, yPos);

    const blockHeight = appliedFiltersSplittedText.length * lineHeight;
    yPos += blockHeight;

    autoTable(pdf, {
      startY: yPos,
      head: headers,
      body: jsData,
      useCss: false,
      pageBreak: 'auto',
      showHead: 'everyPage',
      didDrawPage: data => {

        // footer
        // PING
        const pingText = `${this.translate.instant('title.description')}`;
        pdf.setFontSize(10);
        pdf.text(pingText, middleWidth, pageHeight - 30, { align: 'center' });

        const generatedDateTime = this.buildGeneratedDateTime();
        pdf.text(generatedDateTime, middleWidth, pageHeight - 20, { align: 'center' });

        // pages number
        const pagesNumbering = `${data.pageNumber}/${data.pageCount}`;
        pdf.setFontSize(10);
        pdf.text(pagesNumbering, middleWidth, pageHeight - 10, { align: 'center' });
      },
      margin: {
        top: 25,
        left: marginHorizontal,
        right: marginHorizontal
      }
    });

    // Total page number
    pdf.putTotalPages(totalPagesExp);

    pdf.output('dataurlnewwindow', { filename: pdfName });
  }

  private buildWarningTablePdfTitle(serie: Serie, isDetails = false): string {
    const inForce = this.isFrLang() ? 'en vigor' : 'in force';
    const tableContext = isDetails ? (this.isFrLang() ? 'Detalles' : 'Details') : (this.isFrLang() ? 'Lista' : 'List');
    return `${this.getSerieNameForCurrentLang(serie)} ${inForce} (${tableContext})`;
  }

  private isFrLang(): boolean {
    return this.translate.currentLang === 'es';
  }

  private buildWarningTablePdfNameFromSerie(serie: Serie): string {
    return `${this.getSerieNameForCurrentLang(serie)}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  }

  private getSerieNameForCurrentLang(serie: Serie): string {
    return this.isFrLang() ? serie.name : (serie.internationalName ?? serie.name);
  }

  private buildWarningTableFiltersDescription(appliedFilterValues: TableFilterValues): string {
    const serieFilter = `${this.translate.instant('filter.filter-form.serie')} ${this.getSerieNameForCurrentLang(appliedFilterValues.serie)}`;
    let filtersDescription = serieFilter;
    if (appliedFilterValues.categories?.length) {
      filtersDescription += this.buildCategoriesFilterDescription(appliedFilterValues.categories);
    }
    if (appliedFilterValues.subAreaIds?.length) {
      const filteredSubAreas = (appliedFilterValues.serie.subAreas as SubArea[]).filter(subArea => appliedFilterValues.subAreaIds.includes(subArea.id));
      filtersDescription += this.buildAreasFilterDescription(filteredSubAreas);
    }
    if (appliedFilterValues.publishDate) { filtersDescription += this.buildPublishDateFilter(appliedFilterValues.publishDate); }
    if (appliedFilterValues.period?.startDate || appliedFilterValues.period?.endDate) {
      filtersDescription += this.buildPeriodFilter(appliedFilterValues.period.startDate, appliedFilterValues.period.endDate);
    }

    return filtersDescription;
  }

  private buildCategoriesFilterDescription(categories: string[]): string {
    const categoriesFilter = categories.reduce((acc, val) => {
      acc.push(translatedTypeDetails(this.translate, val));
      return acc;
    }, []).join(', ');
    return ` - ${this.translate.instant('filter.filter-form.categories')}${categoriesFilter}`;
  }

  private buildAreasFilterDescription(areas: SubArea[]): string {
    const areasFilter = areas.reduce((acc, val) => {
      acc.push(this.isFrLang() ? val.name : val.internationalName);
      return acc;
    }, []).join(', ');
    return ` - ${this.translate.instant('filter.filter-form.sub-areas')}${areasFilter}`;
  }

  private buildPublishDateFilter(publishDate: Date): string {
    return ` - ${this.translate.instant('filter.filter-form.published-since')} ${format(publishDate, DISPLAYED_DATE_FORMAT)}`;
  }

  private buildPeriodFilter(startDate?: Date, endDate?: Date): string {
    if (!startDate && !endDate) { return ''; }
    let periodDescription = ` - ${this.translate.instant('filter.filter-form.event-period')}:`;
    if (startDate) {
      periodDescription += ` ${this.translate.instant('filter.filter-form.start')} ${format(startDate, DISPLAYED_DATE_FORMAT)}`;
    }

    if (endDate) {
      periodDescription += ` ${this.translate.instant('filter.filter-form.end')} ${format(endDate, DISPLAYED_DATE_FORMAT)}`;
    }

    return periodDescription;
  }

  private getWarningTableList(appliedFilterValues: TableFilterValues, totalRecords: number, isDetailedTable = false): Observable<ModelItemTablePage<TableWarning>> {
    return this.warningTableFacade.loadFilteredPage$({ page: 0, rows: totalRecords }, appliedFilterValues, isDetailedTable);
  }

  private buildWarningTableList(appliedFilterValues: TableFilterValues, totalRecords: number): Observable<Array<Array<string>>> {
    return this.getWarningTableList(appliedFilterValues, totalRecords, false).pipe(
      mergeMap(warningTablePage => warningTablePage.modelItems),
      reduce((acc, val) => {
        acc.push([this.formatWarningNumberPipe.transform(val), `${this.formatWarningTitlePipe.transform(val)} - ${translatedTypeDetails(this.translate, val.warningTypeDetails)}`]);
        return acc;
      }, [])
    );
  }

  private buildWarningTableDetailsList(appliedFilterValues: TableFilterValues, totalRecords: number): Observable<TableWarning[]> {
    return this.getWarningTableList(appliedFilterValues, totalRecords, true).pipe(
      map(warningTablePage => warningTablePage.modelItems)
    );
  }

  exportWarningTableDetails(appliedFilterValues: TableFilterValues, totalRecords: number): void {
    const serie = appliedFilterValues.serie;
    if (!serie) { return; }
    const formattedTitle = this.buildWarningTablePdfTitle(serie, true);
    const formattedFilterValues = this.buildWarningTableFiltersDescription(appliedFilterValues);
    const pdfName = this.buildWarningTablePdfNameFromSerie(serie);
    this.buildWarningTableDetailsList(appliedFilterValues, totalRecords).subscribe(
      tableWarnings => this.exportWarningTableDetailsFromWarningList(tableWarnings, pdfName, [formattedTitle, formattedFilterValues])
    );
  }

  exportWarningTable(appliedFilterValues: TableFilterValues, totalRecords: number, columns: Column[]): void {
    const serie = appliedFilterValues.serie;
    if (!serie) { return; }
    const formattedTitle = this.buildWarningTablePdfTitle(serie);
    const formattedFilterValues = this.buildWarningTableFiltersDescription(appliedFilterValues);
    const pdfName = this.buildWarningTablePdfNameFromSerie(serie);
    const headers = columns.reduce((acc, val) => {
      acc.push(this.translate.instant(val.translateKey));
      return acc;
    }, []);
    this.buildWarningTableList(appliedFilterValues, totalRecords).subscribe(
      jsData => this.exportWarningTableFromJsData(jsData, [headers], pdfName, formattedTitle, formattedFilterValues)
    );
  }

  getMapAsImage(cssSelectors: string, olMap: Map, mimeType = 'image/jpeg', options = { backgroundColor: 'white', quality: 0.9 }): string {
    const backgroundColor = options.backgroundColor;
    const mapCanvas = document.createElement('canvas');

    const size = olMap.getSize();
    mapCanvas.width = size && size[0] > 0 ? size[0] : 600;
    mapCanvas.height = size && size[1] > 0 ? size[1] : 400;
    const context = mapCanvas.getContext('2d');

    const viewport = olMap.getViewport ? olMap.getViewport() : null;
    let canvases: NodeListOf<HTMLCanvasElement> = viewport
      ? viewport.querySelectorAll('.ol-layer canvas, canvas.ol-layer')
      : document.querySelectorAll(cssSelectors);
    if (!canvases || canvases.length === 0) {
      canvases = viewport ? viewport.querySelectorAll('canvas') : document.querySelectorAll(cssSelectors);
    }

    // Select all map canvas from the target olMap viewport and exclude overview map
    Array.prototype.forEach.call(
      canvases,
      (canvas: HTMLCanvasElement) => {
        if (canvas.width > 0) {
          const opacity = (canvas.parentNode as HTMLElement)?.style?.opacity || canvas.style.opacity;
          context.globalAlpha = opacity === '' ? 1 : Number(opacity);
          const transform = canvas.style.transform;
          const matrixMatch = transform ? transform.match(/^matrix\(([^\(]*)\)$/) : null;
          if (matrixMatch) {
            const matrix = matrixMatch[1].split(',').map(Number);
            CanvasRenderingContext2D.prototype.setTransform.apply(context, matrix);
          } else {
            context.setTransform(1, 0, 0, 1, 0, 0);
          }
          context.drawImage(canvas, 0, 0);
        }
      }
    );
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalAlpha = 1;

    const w = mapCanvas.width;
    const h = mapCanvas.height;
    let data;
    const compositeOperation = context.globalCompositeOperation;
    if (backgroundColor) {
      //get the current ImageData for the canvas.
      data = context.getImageData(0, 0, w, h);
      //store the current globalCompositeOperation
      //set to draw behind current content
      context.globalCompositeOperation = 'destination-over';
      //set background color
      context.fillStyle = backgroundColor;
      //draw background / rect on entire canvas
      context.fillRect(0, 0, w, h);
    }

    //get the image data from the canvas
    const imageData = mapCanvas.toDataURL(mimeType, options.quality);
    if (backgroundColor) {
      //clear the canvas
      context.clearRect(0, 0, w, h);
      //restore it with original / cached ImageData
      context.putImageData(data, 0, 0);
      //reset the globalCompositeOperation to what it was
      context.globalCompositeOperation = compositeOperation;
    }

    //return the Base64 encoded data url string
    return imageData;
  }
}
