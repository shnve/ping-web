import { linkHorizontal } from 'd3-shape';
import { FolderSvgConst } from '../../../../models/folder.model';
import { FolderModalGraphComponent } from '../folder-modal-graph.component';

let indexByIds = [];
let nbEvents = 0;

export function countOccurencesOfDayInDays(days, day) {
  return days.reduce((a, v) => (v === day ? a + 1 : a), 0);
}

export function horizontalSource(link) {
  const colSize = FolderModalGraphComponent.svgWidth / 3 - FolderSvgConst.TIMELINE_X;
  const x = link.source.type.coordinateX  - FolderSvgConst.LINK_SOURCE_PADDING;
  const index = indexByIds.find(data => data.id === link.source.id).index;
  const y = (FolderModalGraphComponent.svgHeight / nbEvents) * index
    + (FolderSvgConst.TIMELINE_PADDING / 2) + FolderSvgConst.NODE_STROKE_WIDTH * 2;

  return [x, y];
}

export function horizontalTarget(link) {
  const colSize = FolderModalGraphComponent.svgWidth / 3 - FolderSvgConst.TIMELINE_X;
  const x = link.target.type.coordinateX  + getNodeWidth(link.target.name);
  const index = indexByIds.find(data => data.id === link.target.id).index;
  const y = (FolderModalGraphComponent.svgHeight / nbEvents) * index
    + (FolderSvgConst.TIMELINE_PADDING / 2) + FolderSvgConst.NODE_STROKE_WIDTH * 2;

  return [x, y];
}

export function sankeyLinkHorizontal(datasArr, numberOfEventsInGraph) {
  indexByIds = datasArr;
  nbEvents = numberOfEventsInGraph;

  return linkHorizontal()
    .source(horizontalSource)
    .target(horizontalTarget)
}

export function getNodeWidth(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = FolderSvgConst.FONT_FOR_RECT;
  const metrics = context.measureText(text);
  return metrics.width;
}
