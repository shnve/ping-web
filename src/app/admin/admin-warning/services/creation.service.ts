import { Injectable } from '@angular/core';
import { WarningAdminApi } from '@app/api/admin/warning-admin.api';
import { AuthService } from '@app/auth/auth.service';
import { DiffusionNavtexSource } from '@app/models/serie.model';
import { AttachmentDownload, listWarningStatus, Warning, WarningMaritimeEntityReference, WarningReferenceAsPublicReference } from '@app/models/warning.model';
import {
  formatDate,
  formatFrenchDateToIsoDate,
  FRENCH_DATE_REGEX_PATTERN,
  FRENCH_DATE_TIME_FORMAT,
  parseDateTimeToTimezone,
  UTC_TIMEZONE
} from '@app/shared/date-utils';
import { DateRange } from '@app/shared/models/date-range.model';
import { initWarningCreationData } from '@app/shared/warning-utils';
import { affectedAreaToolsStyle, DEFAULT_TOOL_STYLE, featureToGeojson, geometryToolsStyle, setBathyProperties, setFeatureLabel, setVertexLabels } from '@app/sig/utils/feature';
import { GeometryType } from '@app/sig/utils/geometry';
import { environment } from '@env/environment';
import { formatToTimeZone } from 'date-fns-timezone';
import { pick } from 'lodash-es';
import { getCenter, getWidth } from 'ol/extent';
import Feature from 'ol/Feature';
import GeoJson from 'ol/format/GeoJSON';
import { Circle } from 'ol/geom';

import { default as Polygon } from 'ol/geom/Polygon';
import { Style } from 'ol/style';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import {
  FeaturePart,
  JsonFeaturePart,
  JsonWarningAdminDetails,
  JsonWarningCreationData,
  WarningCreationData
} from '../models/creation-warning.model';

@Injectable({
  providedIn: 'root'
})
export class CreationService {

  private warningData: WarningCreationData;
  private navtexSource: DiffusionNavtexSource;

  warningCreationDataSubject = new Subject<WarningCreationData>();

  activeIndexChange: Subject<number>;
  warningChange: Subject<WarningCreationData>;

  constructor(private readonly warningAdminApi: WarningAdminApi,
    private readonly authService: AuthService) {
    this.activeIndexChange = new Subject<number>();
    this.warningChange = new Subject<WarningCreationData>();
    this.initWarningData();
  }

  getWarningData(): WarningCreationData {
    return this.warningData;
  }

  setWarningData(warningCreationData: WarningCreationData): void {
    this.warningData = warningCreationData;
  }

  getShouldHaveNavtex(): boolean {
    return !!this.navtexSource;
  }

  getNavtexSource(): DiffusionNavtexSource {
    return this.navtexSource;
  }

  setNavtexSource(navtexSource: DiffusionNavtexSource): void {
    this.navtexSource = navtexSource;
  }

  setJsonWarningAdminDetails(jsonWarningAdminDetails: JsonWarningAdminDetails): void {
    this.setWarningData(this.convertJsonWarningAdminDetailsToWarningCreationData(jsonWarningAdminDetails));
    this.warningCreationDataSubject.next(this.getWarningData());
  }

  create(): Observable<Warning> {
    return this.warningAdminApi.create$(
      this.convertWarningCreationDataToJsonWarningCreationData(this.getWarningData()), this.authService.getToken());
  }

  update(): Observable<Warning> {
    return this.warningAdminApi.update$(
      this.convertWarningCreationDataToJsonWarningCreationData(this.getWarningData()), this.getWarningData().status === listWarningStatus.PUBLISHED);
  }

  getAvailableAttachmentToLinkAsWarningReference$(warningId: string): Observable<AttachmentDownload[]> {
    return this.warningAdminApi.getAvailableAttachmentToLinkAsWarningReference$(warningId);
  }

  getAvailableEntitiesReferencesToLinkAsWarningReference$(warningId: string): Observable<WarningMaritimeEntityReference[]> {
    return this.warningAdminApi.getAvailableEntitiesReferencesToLinkAsWarningReference$(warningId);
  }

  getAvailableWarningsReferencesAsPublicReference$(warningId: string): Observable<WarningReferenceAsPublicReference[]> {
    return this.warningAdminApi.getAvailableWarningsReferencesAsPublicReference$(warningId);
  }

  getWarningIdsWhichCanBeCancelled(warningId: string): Observable<string[]> {
    return this.warningAdminApi.getWarningIdsWhichCanBeCancelled$(warningId);
  }

  initWarningData(): void {
    this.warningData = initWarningCreationData();
  }

  getFeatureParts(): FeaturePart[] {
    return this.warningData.warningParts.featureParts;
  }

  getIsBathy(): boolean {
    return this.warningData.warningParts.isBathy;
  }

  setFeatureParts(featureParts: FeaturePart[]): void {
    this.warningData.warningParts.featureParts = featureParts;
  }

  convertFeaturePartsToJsonFeatureParts(parts: FeaturePart[], isBathy = false): JsonFeaturePart[] {
    return parts.map((part: FeaturePart) => {
      return {
        ...part,
        ...{
          geometries: part.geometries.map(feature => featureToGeojson(feature, isBathy)),
          affectedAreas: part.affectedAreas.map(feature => featureToGeojson(feature, isBathy)),
          dateRanges: part.dateRanges
        }
      };
    });
  }

  convertJsonFeaturePartsToFeatureParts(parts: JsonFeaturePart[]): FeaturePart[] {
    const geoJson = new GeoJson({
      dataProjection: environment.carto.projection,
      featureProjection: environment.carto.projection
    });

    const geoJsonToFeature = (style: Style, jsonFeature: any) => {
      const convertedGeometry = geoJson.readGeometry(jsonFeature.geometry);
      let featureLabel;
      let feature;
      if (convertedGeometry.getType() === GeometryType.POLYGON && jsonFeature.properties?.isCircle) {
        const polygon = convertedGeometry as Polygon;
        const center = getCenter(polygon.getExtent());
        const radius = getWidth(polygon.getExtent()) / 2;
        feature = new Feature(new Circle(center, radius));
        feature.setStyle(DEFAULT_TOOL_STYLE);
        featureLabel = jsonFeature.properties?.featureLabel;
        if (featureLabel) {
          setFeatureLabel(feature, featureLabel);
        }
        if (jsonFeature.properties?.isBathy) {
          setBathyProperties(feature, jsonFeature.properties);
        }
        return feature;
      }

      feature = new Feature(convertedGeometry);
      feature.setStyle(DEFAULT_TOOL_STYLE);

      const labels = jsonFeature.properties?.labels;
      if (labels) {
        setVertexLabels(feature, labels);
      }

      featureLabel = jsonFeature.properties?.featureLabel;
      if (featureLabel) {
        setFeatureLabel(feature, featureLabel);
      }

      if (jsonFeature.properties?.isBathy) {
        setBathyProperties(feature, jsonFeature.properties);
      }

      return feature;
    };

    return parts.map((part: JsonFeaturePart) => {
      return {
        ...part,
        ...{
          geometries: part.geometries.map(geoJsonToFeature.bind(this, geometryToolsStyle)),
          affectedAreas: part.affectedAreas.map(geoJsonToFeature.bind(this, affectedAreaToolsStyle)),
          dateRanges: part.dateRanges.map(dateRange => this.convertJsonDateRangeToDateRange(dateRange))
        }
      };
    });
  }

  convertJsonDateRangeToDateRange({ dateStart, dateEnd, timeOfDayStart, timeOfDayEnd, timezone }: DateRange): DateRange {
    dateStart = formatDate(dateStart);
    // slice(0, -3) To remove seconds from string (12:52:00 -> 12:52)
    timeOfDayStart = timeOfDayStart ? timeOfDayStart.slice(0, -3) : null;
    dateEnd = formatDate(dateEnd);
    timeOfDayEnd = timeOfDayEnd ? timeOfDayEnd.slice(0, -3) : null;

    return { dateStart, dateEnd, timeOfDayStart, timeOfDayEnd, timezone };
  }

  convertWarningCreationDataToJsonWarningCreationData(warningCreationData: WarningCreationData): JsonWarningCreationData {
    const featurePartsJson = this.convertFeaturePartsToJsonFeatureParts(warningCreationData.warningParts.featureParts, warningCreationData.warningParts.isBathy);
    const jsonWarningCreationData = {
      id: warningCreationData.id,
      lastUpdateUser: warningCreationData.lastUpdateUser,
      useAsModel: warningCreationData.prerequisites.useAsModel,
      parts: featurePartsJson,
      ...warningCreationData.prerequisites,
      ...warningCreationData.attachments,
      ...warningCreationData.finalizationData,
      ...pick(warningCreationData.links, ['cancelledWarningIds', 'replacedWarningIds', 'parentWarningIds', 'infosourcesIds', 'maritimeEntitiesIds', 'georegulationIds']),
      ...pick(warningCreationData.references, ['warningPublicsReferences', 'georegulationReferenceIds', 'attachmentReferenceIds', 'entityReferenceIds', 'warningLinksPublicsReferences']),
      navtexConfig: warningCreationData.navtexConfig
    };

    if (warningCreationData.prerequisites.useAsModel) {
      jsonWarningCreationData.modelName = warningCreationData.prerequisites.modelName;
    }

    if (warningCreationData.prerequisites.cancellationTime) {
      const cancellationTimeAsUtcDate = parseDateTimeToTimezone(warningCreationData.prerequisites.cancellationTime, UTC_TIMEZONE);
      jsonWarningCreationData.cancellationTime = formatToTimeZone(cancellationTimeAsUtcDate, 'YYYY-MM-DD[T]HH:mm:00[Z]', { timeZone: UTC_TIMEZONE });
    }
    jsonWarningCreationData.addCancellationTimeToTelex = warningCreationData.prerequisites.addCancellationTimeToTelex;

    if (warningCreationData.finalizationData.estimatedPublicationDate) {
      jsonWarningCreationData.estimatedPublicationDate = formatFrenchDateToIsoDate(warningCreationData.finalizationData.estimatedPublicationDate);
    }

    if (warningCreationData.finalizationData.reviewDate) {
      jsonWarningCreationData.reviewDate = formatFrenchDateToIsoDate(warningCreationData.finalizationData.reviewDate);
    }

    for (let part of jsonWarningCreationData?.parts) {
      for (const dateRange of part?.dateRanges) {
        if (dateRange.dateStart && FRENCH_DATE_REGEX_PATTERN.test(dateRange.dateStart)) {
          dateRange.dateStart = formatFrenchDateToIsoDate(dateRange.dateStart);
        }

        if (dateRange.dateEnd && FRENCH_DATE_REGEX_PATTERN.test(dateRange.dateEnd)) {
          dateRange.dateEnd = formatFrenchDateToIsoDate(dateRange.dateEnd);
        }
      }
    }

    return jsonWarningCreationData;
  }

  convertJsonWarningAdminDetailsToWarningCreationData(jsonWarningAdminDetails: JsonWarningAdminDetails): WarningCreationData {
    let selectedLocalities = jsonWarningAdminDetails.selectedLocalities;
    if (typeof jsonWarningAdminDetails.selectedLocalities === 'object' && !(jsonWarningAdminDetails.selectedLocalities instanceof Map)) {
      selectedLocalities = new Map(Object.entries(jsonWarningAdminDetails.selectedLocalities));
    }
    const featurePartsJson = this.convertJsonFeaturePartsToFeatureParts(jsonWarningAdminDetails.parts);
    return {
      id: jsonWarningAdminDetails.id,
      status: jsonWarningAdminDetails.status,
      lastUpdate: jsonWarningAdminDetails.lastUpdate,
      lastUpdateUser: jsonWarningAdminDetails.lastUpdateUser,
      prerequisites: {
        serviceId: null,
        serieId: jsonWarningAdminDetails.serieId,
        serieName: jsonWarningAdminDetails.serieName,
        generalAreas: jsonWarningAdminDetails.generalAreas,
        localityNames: jsonWarningAdminDetails.localityNames,
        modelName: jsonWarningAdminDetails.modelName,
        warningNumber: jsonWarningAdminDetails.warningNumber,
        year: jsonWarningAdminDetails.year,
        typeGeneral: jsonWarningAdminDetails.typeGeneral,
        serieType: jsonWarningAdminDetails.serieType,
        selectedLocalities,
        cancellationTime: jsonWarningAdminDetails.cancellationTime ?
          formatToTimeZone(jsonWarningAdminDetails.cancellationTime, FRENCH_DATE_TIME_FORMAT,
            { timeZone: UTC_TIMEZONE }).toString() : null,
        addCancellationTimeToTelex: jsonWarningAdminDetails.addCancellationTimeToTelex,
        isBathy: jsonWarningAdminDetails.isBathy
      },
      links: {
        cancelledWarningIds: jsonWarningAdminDetails.cancelledWarningIds,
        replacedWarningIds: jsonWarningAdminDetails.replacedWarningIds,
        parentWarningIds: jsonWarningAdminDetails.parentWarningIds,
        infosourcesIds: jsonWarningAdminDetails.infosourcesIds,
        infosources: jsonWarningAdminDetails.infosources,
        maritimeEntitiesIds: jsonWarningAdminDetails.maritimeEntitiesIds,
        georegulationIds: jsonWarningAdminDetails.georegulationIds
      },
      warningParts: {
        featureParts: featurePartsJson,
        mandatoryLanguages: [],
        isBathy: jsonWarningAdminDetails.isBathy
      },
      attachments: {
        attachmentIds: jsonWarningAdminDetails.attachmentIds,
        attachmentFiles: jsonWarningAdminDetails.attachmentFiles
      },
      references: {
        warningPublicsReferences: jsonWarningAdminDetails.warningPublicsReferences,
        georegulationReferenceIds: jsonWarningAdminDetails.georegulationReferenceIds,
        attachmentReferenceIds: jsonWarningAdminDetails.attachmentReferenceIds,
        entityReferenceIds: jsonWarningAdminDetails.entityReferenceIds,
        warningLinksPublicsReferences: jsonWarningAdminDetails.warningLinksPublicsReferences
      },
      telex: jsonWarningAdminDetails.telex ?? '',
      navtex: jsonWarningAdminDetails.navtex ?? '',
      navtexConfig: jsonWarningAdminDetails.navtexConfig,
      finalizationData: {
        estimatedPublicationDate: formatDate(jsonWarningAdminDetails.estimatedPublicationDate),
        reviewDate: formatDate(jsonWarningAdminDetails.reviewDate),
        internalComment: jsonWarningAdminDetails.internalComment
      }
    };
  }
}
