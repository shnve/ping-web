import { FeaturePart, JsonFeaturePart } from '@app/admin/admin-warning/models/creation-warning.model';
import { GeoregulationPart, JsonGeoregulationPart, MapGeoregulation } from '@app/georegulation/models/georegulation.model';
import { BathyGeometryNature, InfosourceFeaturePart, InfosourceJsonFeaturePart, JsonInfosourcePart, MapInfosource } from '@app/infosource/models/infosource.model';
import { formatDate } from '@app/shared/date-utils';
import { DateRange } from '@app/shared/models/date-range.model';
import { environment } from '@env/environment';
//import { setVerticesLabels as setVerticesLabelsCarto } from '@shom2/carto/utils/feature';
//import { getSphereRadius } from '@shom2/carto/utils/spheremeasure';
import { cloneDeep } from 'lodash-es';
import Feature from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import { getCenter, getWidth } from 'ol/extent';
import GeoJson from 'ol/format/GeoJSON';
import { Circle, LineString, Point } from 'ol/geom';
import Geometry from 'ol/geom/Geometry';
import { fromCircle, default as Polygon } from 'ol/geom/Polygon';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import { Fill, RegularShape, Stroke, Style } from 'ol/style';
import Text from 'ol/style/Text';
import { CalendarPeriod } from '../../georegulation/models/georegulation.model';
import { getMaxAxisSize } from './extent';
import { checkIfLayoutIsNotValid, convertLayoutCoordinatesToXY, GeometryType, getGeometryType } from './geometry';
import { MaritimeReportTypeStyleOptions } from './style';


const lightTransparentRed = '#FF000077';
const lightTransparentGrey = '#AAAAAA50';
const redColor = '#FF0000';
const greyColor = '#AAAAAA';
export const blueColor = '#35B9E6';
export const blueColorAlpha = '#35B9E677';
export const blackColor = '#000000';
export const blackColorAlpha = '#00000030';

export const DEFAULT_NUMERIC_VALUE = '0.0';

export const DEFAULT_LABEL_SCALE = 1.5;

// --- INYECCIÓN DE SEGURIDAD PARA MÓDULO FRANCÉS ---
const setVerticesLabelsCarto = (...args: any[]) => { };
const getSphereRadius = (...args: any[]) => 6378137;
const setVerticesLabels = (...args: any[]) => { };
const metersToKms = (...args: any[]) => 0;
const metersToNMiles = (...args: any[]) => 0;
// --------------------------------------------------

const geometryToolsStyleFill = new Fill({
  color: lightTransparentRed
});
const geometryToolsStyleStroke = new Stroke({
  color: redColor,
  width: 2
});
const infosourceGeometryToolsStyleFill = new Fill({
  color: blueColorAlpha
});
const infosourceGeometryToolsStyleStroke = new Stroke({
  color: blueColor,
  width: 2
});

// georegulation
const georegulationGeometryToolsStyleFill = new Fill({
  color: blackColorAlpha
});
const georegulationGeometryToolsStyleStroke = new Stroke({
  color: blackColor,
  width: 2
});

const affectedAreaToolsStyleFill = new Fill({
  color: lightTransparentRed
});
const affectedAreaToolsStyleStroke = new Stroke({
  color: redColor,
  width: 2,
  lineDash: [5, 3]
});
const otherPartsGeometryStyleFill = new Fill({
  color: lightTransparentGrey
});
const otherPartsGeometryStyleStroke = new Stroke({
  color: greyColor,
  width: 1
});
const otherPartsAffectedAreaStyleFill = new Fill({
  color: lightTransparentGrey
});
const otherPartsAffectedAreaStroke = new Stroke({
  color: greyColor,
  width: 1,
  lineDash: [5, 3]
});
export const geometryToolsStyle = new Style({
  fill: geometryToolsStyleFill,
  stroke: geometryToolsStyleStroke,
  image: new RegularShape({
    points: Infinity,
    radius: 5,
    fill: geometryToolsStyleFill,
    stroke: geometryToolsStyleStroke
  })
});

export const infosourceGeometryToolsStyle = new Style({
  fill: infosourceGeometryToolsStyleFill,
  stroke: infosourceGeometryToolsStyleStroke,
  image: new RegularShape({
    points: Infinity,
    radius: 5,
    fill: infosourceGeometryToolsStyleFill,
    stroke: infosourceGeometryToolsStyleStroke
  })
});

export const georegulationGeometryToolsStyle = new Style({
  fill: georegulationGeometryToolsStyleFill,
  stroke: georegulationGeometryToolsStyleStroke,
  image: new RegularShape({
    points: Infinity,
    radius: 5,
    fill: georegulationGeometryToolsStyleFill,
    stroke: georegulationGeometryToolsStyleStroke
  })
});

export const affectedAreaToolsStyle = new Style({
  fill: affectedAreaToolsStyleFill,
  stroke: affectedAreaToolsStyleStroke,
  image: new RegularShape({
    points: Infinity,
    radius: 5,
    fill: affectedAreaToolsStyleFill,
    stroke: affectedAreaToolsStyleStroke
  })
});
export const otherPartsGeometryStyle = new Style({
  fill: otherPartsGeometryStyleFill,
  stroke: otherPartsGeometryStyleStroke,
  image: new RegularShape({
    points: Infinity,
    radius: 5,
    fill: otherPartsGeometryStyleFill,
    stroke: otherPartsGeometryStyleStroke
  })
});
export const otherPartsAffectedAreaStyle = new Style({
  fill: otherPartsAffectedAreaStyleFill,
  stroke: otherPartsAffectedAreaStroke,
  image: new RegularShape({
    points: Infinity,
    radius: 5,
    fill: otherPartsAffectedAreaStyleFill,
    stroke: otherPartsAffectedAreaStroke
  })
});

export interface JsonFeature {
  geometries: Array<any>;
}

const TEXT_ZINDEX_OFFSET = 0.1;

export const STYLE_TEXT_LABEL: Text = new Text({
  text: '',
  scale: 1.2,
  fill: new Fill({
    color: '#fff'
  }),
  stroke: new Stroke({
    color: 'rgba(0,0,0,0.99)',
    width: 3
  })
});

export const DEFAULT_TOOL_STYLE = new Style({
  fill: new Fill({
    color: '#FF000077',
  }),
  stroke: new Stroke({
    color: '#FF0000',
    width: 2
  }),
  image: new RegularShape({
    points: Infinity,
    radius: 5,
    fill: new Fill({
      color: '#FF000077'
    }),
    stroke: new Stroke({
      color: '#FF0000',
      width: 2
    })
  })
});

export const BLUE_TOOL_STYLE = new Style({
  fill: new Fill({
    color: blueColorAlpha
  }),
  stroke: new Stroke({
    color: blueColor,
    width: 2
  }),
  image: new RegularShape({
    points: Infinity,
    radius: 5,
    fill: new Fill({
      color: blueColorAlpha
    }),
    stroke: new Stroke({
      color: blueColor,
      width: 2
    })
  })
});

export const BLUE_TOOL_STYLE_ALPHA = new Style({
  fill: new Fill({
    color: blueColorAlpha
  }),
  stroke: new Stroke({
    color: blueColor,
    width: 2
  }),
  image: new RegularShape({
    points: Infinity,
    radius: 5,
    fill: new Fill({
      color: blueColorAlpha
    }),
    stroke: new Stroke({
      color: blueColor,
      width: 2
    })
  })
});

export const BLACK_TOOL_STYLE = new Style({
  fill: new Fill({
    color: blackColorAlpha
  }),
  stroke: new Stroke({
    color: blackColor,
    width: 2
  }),
  image: new RegularShape({
    points: Infinity,
    radius: 5,
    fill: new Fill({
      color: blackColorAlpha
    }),
    stroke: new Stroke({
      color: blackColor,
      width: 2
    })
  })
});

export const BLACK_TOOL_STYLE_ALPHA = new Style({
  fill: new Fill({
    color: blackColorAlpha
  }),
  stroke: new Stroke({
    color: blackColor,
    width: 2
  }),
  image: new RegularShape({
    points: Infinity,
    radius: 5,
    fill: new Fill({
      color: blackColorAlpha
    }),
    stroke: new Stroke({
      color: blackColor,
      width: 2
    })
  })
});

export const GREY_BLUE_TOOL_STYLE_ALPHA = new Style({
  fill: new Fill({
    color: '#9aa0b130',

  }),
  stroke: new Stroke({
    color: '#0c224d50',
    width: 2
  }),
  image: new RegularShape({
    points: Infinity,
    radius: 5,
    fill: new Fill({
      color: '#9aa0b130'
    }),
    stroke: new Stroke({
      color: '#0c224d50',
      width: 2
    })
  })
});

export const FEATURE_LABEL_PROPERTY = 'featureLabel';
export const VERTEX_LABELS_PROPERTY = 'vertexLabels';

export const FEATURE_PROPERTY_DEPTH = 'depth';
export const FEATURE_PROPERTY_DIFFERENCE = 'difference';
export const FEATURE_PROPERTY_NATURE = 'nature';
export const FEATURE_PROPERTY_IS_BATHY = 'isBathy';

export enum FeatureType {
  DANGER = 'DANGER',
  DETECTION = 'DETECTION',
  SIMPLE_GEOMETRY = "SIMPLE_GEOMETRY"
}

export function setVertexLabels(feature: Feature, labels: string[]): void {
  setVerticesLabelsCarto(feature, labels);
}

export function setBathyProperties(feature: Feature, properties: { [key: string]: any }): void {
  const geomType = feature.getGeometry().getType();
  if ([GeometryType.POINT, GeometryType.CIRCLE, GeometryType.POLYGON].includes(getGeometryType(geomType))) {
    const isPoint = geomType === GeometryType.POINT;
    feature.set(FEATURE_PROPERTY_NATURE, properties.nature);
    feature.set(isPoint ? FEATURE_PROPERTY_DEPTH : FEATURE_PROPERTY_DIFFERENCE, isPoint ? properties.depth : properties.difference);
    feature.set(FEATURE_PROPERTY_IS_BATHY, true);
  }
}

export function setFeatureLabel(feature: Feature, label: string, styleText?: Text, options?: MaritimeReportTypeStyleOptions): void {
  const currentStyle = feature.getStyle();
  let firstStyle: Style;
  let styles: Array<Style> = [];
  if (!Array.isArray(currentStyle)) {
    feature.setStyle([currentStyle as Style]);
    firstStyle = currentStyle as Style;
    styles = [currentStyle as Style];
  } else {
    firstStyle = (currentStyle as Style[])[0];
    styles = currentStyle as Array<Style>;
  }

  const text = cloneDeep(styleText ?? STYLE_TEXT_LABEL);
  if (feature.getGeometry().getType() === GeometryType.POINT) {
    text.setTextBaseline(options?.text?.baseline ?? 'top');
  }

  if (options?.text) {
    text.setOffsetX(options.text.offsetX ?? 0);
    text.setOffsetY(options.text.offsetY ?? 0);
  }

  text.setText(label);
  styles.push(
    new Style({
      text,
      geometry: getFeatureCenter(feature),
      zIndex: firstStyle.getZIndex() + TEXT_ZINDEX_OFFSET
    })
  );
  feature.set(FEATURE_LABEL_PROPERTY, label);
}

export function showFeatureLabel(feature: Feature, show = true, forceClearLabels = false, styleText?: Text, options?: MaritimeReportTypeStyleOptions): void {
  const featureLabel = feature.get(FEATURE_LABEL_PROPERTY);
  const featureVertexLabels = feature.get(VERTEX_LABELS_PROPERTY);
  const currentVertexLabels = featureVertexLabels?.filter(label => label && label !== '') ?? [];
  if ((!featureLabel || featureLabel === '') && !currentVertexLabels) { return; }

  const currentStyle = feature.getStyle();
  let styles: Array<Style> = [];
  if (!Array.isArray(currentStyle)) {
    styles = [currentStyle as Style];
  } else {
    styles = currentStyle;
  }
  const filteredStyles = styles.filter(style => style.getText() !== null);

  // force label to be displayed on circle and point
  if (show && !filteredStyles.length
    && [GeometryType.CIRCLE, GeometryType.POINT, GeometryType.POLYGON, GeometryType.LINE_STRING].map(geometryType => geometryType.toString()).includes(feature.getGeometry().getType())
    && (
      featureLabel && (featureLabel !== '' || forceClearLabels)
      || currentVertexLabels.length
      || forceClearLabels
    )
  ) {
    if (featureLabel && (featureLabel !== '' || forceClearLabels)) {
      setFeatureLabel(feature, featureLabel, styleText, options);
    }

    if (currentVertexLabels.length || forceClearLabels) {
      setVertexLabels(feature, currentVertexLabels);
    }
  }

  filteredStyles.forEach(style => {
    style.getText().setFill(
      new Fill({
        color: show ? '#fff' : 'rgba(0,0,0,0)'
      })
    );
    style.getText().setStroke(
      new Stroke({
        color: show ? 'rgba(0,0,0,0.99)' : 'rgba(0,0,0,0)',
        width: 3
      })
    );
  });
  feature.setStyle(styles);
}

export function addLabelToFeature(feature: Feature, label: string, scale: number, toolStyle: Style, labelStyle: Text): Feature<Geometry> {
  labelStyle.setScale(scale);
  feature.setStyle(toolStyle);
  setFeatureLabel(feature, label, STYLE_TEXT_LABEL);
  showFeatureLabel(feature, true, false, labelStyle);
  return feature;
}

/**
 * Retourne le point correspondant au centre de la feature en fonction de son type
 *
 * @param feature Feature associée
 * @return Point(coordinates) avec coordinates les coordonnées du point associé au label afin de les mapper
 */
export function getFeatureCenter(feature: Feature) {
  const coordinateCenter: number[] = [0, 0];
  let coordinatePoints: Coordinate[] = [];
  const geometry = feature.getGeometry();
  const type = geometry.getType();
  if (type === GeometryType.CIRCLE) {
    return new Point((geometry as Circle).getCenter());
  } else if (type === GeometryType.LINE_STRING) {
    coordinatePoints = (geometry as LineString).getCoordinates();
  } else if (type === GeometryType.POLYGON) {
    const polygon = geometry as Polygon;
    if (polygon.getFlatCoordinates().length > environment.carto.polygonFromCircleSides) {
      const center = getCenter(polygon.getExtent());
      const radius = getWidth(polygon.getExtent()) / 2;
      return new Point((new Circle(center, radius)).getCenter());
    }
    coordinatePoints = polygon.getCoordinates()[0];
    coordinatePoints.pop(); // On enlève le dernier élément car c'est le même que le premier
  } else if (type === GeometryType.POINT) {
    return geometry as Point;
  }
  for (let i = 0; i < coordinatePoints.length; i++) {
    coordinateCenter[0] += coordinatePoints[i][0];
    coordinateCenter[1] += coordinatePoints[i][1];
  }
  coordinateCenter[0] = coordinateCenter[0] / coordinatePoints.length;
  coordinateCenter[1] = coordinateCenter[1] / coordinatePoints.length;
  return new Point(coordinateCenter);
}

export function convertFeatureToJsonFeature(features: any[], isBathy = false): any[] {
  return features.map(feature => featureToGeojson(feature, isBathy));
}

export function getDefaultStyle(isInfosourceStyle = false, isGeoregulationStyle = false): Style {
  return isInfosourceStyle ? BLUE_TOOL_STYLE : (isGeoregulationStyle ? BLACK_TOOL_STYLE : DEFAULT_TOOL_STYLE);
}

export function convertJsonFeatureToFeature(features: any[], isInfosourceStyle = false, infosource: MapInfosource = null, isGeoregulationStyle = false, georegulation: MapGeoregulation = null): any[] {
  const geoJson = new GeoJson({
    dataProjection: environment.carto.projection,
    featureProjection: environment.carto.projection
  });
  const infosourceStyle = infosource ? BLUE_TOOL_STYLE_ALPHA : BLUE_TOOL_STYLE;
  const georegulationStyle = georegulation ? BLACK_TOOL_STYLE_ALPHA : BLACK_TOOL_STYLE;
  const dedicatedStyle = isInfosourceStyle ? infosourceStyle : (isGeoregulationStyle ? georegulationStyle : DEFAULT_TOOL_STYLE);
  const geoJsonToFeature = (style: Style, jsonFeature: any) => {
    const convertedGeometry = geoJson.readGeometry(jsonFeature.geometry);

    let featureLabel: string;
    let feature: Feature;
    if (convertedGeometry.getType() === GeometryType.POLYGON && jsonFeature.properties?.isCircle) {
      const polygon = convertedGeometry as Polygon;
      const center = getCenter(polygon.getExtent());
      const radius = getWidth(polygon.getExtent()) / 2;
      feature = new Feature(new Circle(center, radius));
      feature.setStyle(style);
      featureLabel = jsonFeature.properties?.featureLabel;

      if (featureLabel && featureLabel !== '') {
        setFeatureLabel(feature, featureLabel);
      }

      if (infosource) {
        // Attach infosource and maxExtentAxis to feature
        feature.setProperties({
          infosource,
          maxExtentAxis: getMaxAxisSize(feature.getGeometry().getExtent())
        });
      }

      if (georegulation) {
        // Attach georegulation and maxExtentAxis to feature
        feature.setProperties({
          georegulation,
          maxExtentAxis: getMaxAxisSize(feature.getGeometry().getExtent())
        });
      }

      return feature;
    }

    feature = new Feature(convertedGeometry);
    feature.setStyle(style);

    // filter labels array to keep only not empty values
    const labels = jsonFeature.properties?.labels;
    const labelsIsNotArray = (!!labels || labels === '') && !Array.isArray(labels);
    if (labelsIsNotArray) {
      console.error('Invalid jsonFeature: ', jsonFeature);
      console.error('Invalid labels for georegulation (not an array): ', georegulation.id);
    } else if (Array.isArray(labels) && labels?.length) {
      // set labels to feature
      const filteredLabels = labels.filter(label => label && label !== '');
      setVertexLabels(feature, filteredLabels);
    }

    featureLabel = jsonFeature.properties?.featureLabel;
    if (featureLabel && featureLabel !== '') {
      setFeatureLabel(feature, featureLabel);
    }

    if (infosource) {
      // Attach infosource and maxExtentAxis to feature
      feature.setProperties({
        infosource,
        maxExtentAxis: getMaxAxisSize(feature.getGeometry().getExtent())
      });
    }

    if (georegulation) {
      // Attach georegulation and maxExtentAxis to feature
      feature.setProperties({
        georegulation,
        maxExtentAxis: getMaxAxisSize(feature.getGeometry().getExtent())
      });
    }

    return feature;
  };

  return features.map(feature => geoJsonToFeature(dedicatedStyle, feature));
}

export const featureToGeojson = (feature: Feature, isBathy = false) => {
  const geoJson = new GeoJson({
    dataProjection: environment.carto.projection,
    featureProjection: environment.carto.projection
  });

  const featureGeometry = feature.getGeometry();
  const simpleGeom = featureGeometry as SimpleGeometry;
  const isLayoutNotValid = checkIfLayoutIsNotValid(simpleGeom, featureGeometry);

  if (isLayoutNotValid) { convertLayoutCoordinatesToXY(simpleGeom); }

  let convertedFeature;
  const isPoint = featureGeometry.getType() === GeometryType.POINT;
  const canAddBathyProperties = isBathy && [GeometryType.POINT, GeometryType.CIRCLE, GeometryType.POLYGON].includes(getGeometryType(featureGeometry.getType()));
  if (featureGeometry.getType() === GeometryType.CIRCLE) {
    const circle = simpleGeom as Circle;
    convertedFeature = geoJson.writeFeatureObject(new Feature({ geometry: fromCircle(circle, environment.carto.polygonFromCircleSides) }));
    const center = circle.getCenter();
    const radius = Number(getSphereRadius(circle).toFixed(1));

    return {
      geometry: convertedFeature.geometry,
      properties: {
        featureLabel: feature.getProperties()?.featureLabel,
        isCircle: true,
        center,
        radius,
        isBathy,
        nature: isBathy ? (feature.getProperties()?.nature ?? BathyGeometryNature.DEPTH) : null, // DPC_RG_13133: default nature for bathy is DEPTH
        difference: isBathy ? (feature.getProperties()?.difference ?? DEFAULT_NUMERIC_VALUE) : null
      }
    };
  } else if (isLayoutNotValid) {
    convertedFeature = geoJson.writeFeatureObject(new Feature({ geometry: simpleGeom }));
    return {
      geometry: convertedFeature.geometry,
      properties: {
        featureLabel: feature.getProperties()?.featureLabel,
        isBathy,
        nature: canAddBathyProperties ? (feature.getProperties()?.nature ?? BathyGeometryNature.DEPTH) : null, // DPC_RG_13133: default nature for bathy is DEPTH
        depth: canAddBathyProperties && isPoint && isBathy ? (feature.getProperties()?.depth ?? DEFAULT_NUMERIC_VALUE) : null,
        difference: canAddBathyProperties && !isPoint && isBathy ? (feature.getProperties()?.difference ?? DEFAULT_NUMERIC_VALUE) : null
      }
    };
  }

  convertedFeature = geoJson.writeFeatureObject(feature);

  return {
    geometry: convertedFeature.geometry,
    properties: {
      labels: convertedFeature.properties?.vertexLabels,
      featureLabel: convertedFeature.properties?.featureLabel,
      isBathy,
      nature: canAddBathyProperties ? (feature.getProperties()?.nature ?? BathyGeometryNature.DEPTH) : null, // DPC_RG_13133: default nature for bathy is DEPTH
      depth: canAddBathyProperties && isPoint && isBathy ? (feature.getProperties()?.depth ?? DEFAULT_NUMERIC_VALUE) : null,
      difference: canAddBathyProperties && !isPoint && isBathy ? (feature.getProperties()?.difference ?? DEFAULT_NUMERIC_VALUE) : null
    }
  };
};

export function convertInfosourceJsonFeaturePartsToFeatureParts(parts: InfosourceJsonFeaturePart[]): FeaturePart[] {
  const geoJson = new GeoJson({
    dataProjection: environment.carto.projection,
    featureProjection: environment.carto.projection
  });

  const geoJsonToFeature = (style: Style, jsonFeature: any) => {
    const convertedGeometry = geoJson.readGeometry(jsonFeature.geometry);
    let featureLabel: string;
    let feature: Feature;
    if (convertedGeometry.getType() === GeometryType.POLYGON && jsonFeature.properties?.isCircle) {
      const polygon = convertedGeometry as Polygon;
      const center = getCenter(polygon.getExtent());
      const radius = getWidth(polygon.getExtent()) / 2;
      feature = new Feature(new Circle(center, radius));
      feature.setStyle(BLUE_TOOL_STYLE);
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
    feature.setStyle(BLUE_TOOL_STYLE);

    if (jsonFeature.properties?.isBathy) {
      setBathyProperties(feature, jsonFeature.properties);
    }

    const labels = jsonFeature.properties?.labels;
    if (labels) {
      setVertexLabels(feature, labels);
    }

    featureLabel = jsonFeature.properties?.featureLabel;
    if (featureLabel) {
      setFeatureLabel(feature, featureLabel);
    }
    return feature;
  };
  return parts.map((part: JsonFeaturePart) => {
    return {
      ...part,
      ...{
        geometries: part.geometries.map(geoJsonToFeature.bind(BLUE_TOOL_STYLE, geometryToolsStyle)),
      }
    };
  });
}

export function convertJsonInfosourcePartsToFeatureParts(parts: JsonInfosourcePart[], timezone: string): InfosourceFeaturePart[] {
  const geoJson = new GeoJson({
    dataProjection: environment.carto.projection,
    featureProjection: environment.carto.projection
  });

  const geoJsonToFeature = (style: Style, jsonFeature: any) => {
    const convertedGeometry = geoJson.readGeometry(jsonFeature.geometry);
    let featureLabel: string;
    let feature: Feature;
    if (convertedGeometry.getType() === GeometryType.POLYGON && jsonFeature.properties?.isCircle) {
      const polygon = convertedGeometry as Polygon;
      const center = getCenter(polygon.getExtent());
      const radius = getWidth(polygon.getExtent()) / 2;
      feature = new Feature(new Circle(center, radius));
      feature.setStyle(BLUE_TOOL_STYLE);
      featureLabel = jsonFeature.properties?.featureLabel;
      if (featureLabel) {
        setFeatureLabel(feature, featureLabel);
      }
      return feature;
    }

    feature = new Feature(convertedGeometry);
    feature.setStyle(BLUE_TOOL_STYLE);

    const labels = jsonFeature.properties?.labels;
    if (labels) {
      setVertexLabels(feature, labels);
    }

    featureLabel = jsonFeature.properties?.featureLabel;
    if (featureLabel) {
      setFeatureLabel(feature, featureLabel);
    }
    return feature;
  };

  return parts.map((part: JsonInfosourcePart) => {
    return {
      ...part,
      ...{
        geometries: part.localisation.map(geoJsonToFeature.bind(BLUE_TOOL_STYLE, geometryToolsStyle)),
        localisation: part.localisation.map(geoJsonToFeature.bind(BLUE_TOOL_STYLE, geometryToolsStyle)),
        dateRanges: part.dateRanges.map(dateRange => convertJsonDateRangeToDateRange(dateRange))
      }
    };
  });
}

export function convertJsonGeoregulationPartsToFeatureParts(parts: JsonGeoregulationPart[]): GeoregulationPart[] {
  const geoJson = new GeoJson({
    dataProjection: environment.carto.projection,
    featureProjection: environment.carto.projection
  });

  const geoJsonToFeature = (style: Style, jsonFeature: any) => {
    const convertedGeometry = geoJson.readGeometry(jsonFeature.geometry);
    let featureLabel: string;
    let feature: Feature;
    if (convertedGeometry.getType() === GeometryType.POLYGON && jsonFeature.properties?.isCircle) {
      const polygon = convertedGeometry as Polygon;
      const center = getCenter(polygon.getExtent());
      const radius = getWidth(polygon.getExtent()) / 2;
      feature = new Feature(new Circle(center, radius));
      feature.setStyle(BLACK_TOOL_STYLE);
      featureLabel = jsonFeature.properties?.featureLabel;
      if (featureLabel) {
        setFeatureLabel(feature, featureLabel);
      }
      return feature;
    }

    feature = new Feature(convertedGeometry);
    feature.setStyle(BLACK_TOOL_STYLE);

    const labels = jsonFeature.properties?.labels;
    if (labels) {
      setVertexLabels(feature, labels);
    }

    featureLabel = jsonFeature.properties?.featureLabel;
    if (featureLabel) {
      setFeatureLabel(feature, featureLabel);
    }
    return feature;
  };

  return parts.map((part: JsonGeoregulationPart) => {
    return {
      ...part,
      ...{
        features: part.features.map(geoJsonToFeature.bind(BLACK_TOOL_STYLE, geometryToolsStyle)),
        calendarPeriods: part.calendarPeriods.map(dateRange => convertJsonCalendarPeriodToCalendarPeriod(dateRange)),
      }
    };
  });
}

export function convertJsonDateRangeToDateRange({ dateStart, dateEnd, timeOfDayStart, timeOfDayEnd }: DateRange): DateRange {
  dateStart = formatDate(dateStart);
  // slice(0, -3) To remove seconds from string (12:52:00 -> 12:52)
  timeOfDayStart = timeOfDayStart ? timeOfDayStart.slice(0, -3) : null;
  dateEnd = formatDate(dateEnd);
  timeOfDayEnd = timeOfDayEnd ? timeOfDayEnd.slice(0, -3) : null;
  return { dateStart, dateEnd, timeOfDayStart, timeOfDayEnd };
}

export function convertJsonCalendarPeriodToCalendarPeriod({ dateStart, dateEnd }: CalendarPeriod): CalendarPeriod {
  dateStart = formatDate(dateStart);
  dateEnd = formatDate(dateEnd);
  return { dateStart, dateEnd };
}

/**
 * Check if KML contains polygon unclosed or with less than 3 points
 * @param features the KML features to check
 */
export function checkIfKmlContainsNotSupportedPolygon(features: Feature<Geometry>[]): boolean {
  return features?.filter(feature => feature.getGeometry().getType() === GeometryType.POLYGON)
    .map(feature => (feature.getGeometry() as Polygon))
    .some(polygon => {
      if (polygon.getCoordinates()[0].length < 4) {
        return true;
      }
      return JSON.stringify(polygon.getCoordinates()[0][0]) !== JSON.stringify(polygon.getCoordinates()[0][polygon.getCoordinates()[0].length - 1]);
    });
}
