import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { FolderAttachment } from '@app/folder/models/folder-attachments.model';
import { DAG, Folder, FolderSvgConst, LinkD3, SLink, SNode } from '@app/folder/models/folder.model';
import { folderServiceProvider } from '@app/folder/providers/folder.service.provider';
import { Notion, NotionType } from '@app/models/notion.model';
import { FolderStudy } from '@app/models/study.model';
import { TranslateService } from '@ngx-translate/core';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import { cloneDeep, isEqual } from 'lodash-es';
import moment from 'moment';
import { NodeD3 } from './../../../models/folder.model';
import * as customD3Sankey from './d3-sankey/sankeyLinkHorizontal';

interface IndexById {
  index: number,
  id: string
}

@Component({
  selector: 'folder-modal-graph',
  templateUrl: './folder-modal-graph.component.html',
  styleUrls: ['./folder-modal-graph.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    folderServiceProvider
  ]
})
@Localize()
export class FolderModalGraphComponent implements OnInit, AfterViewInit, OnChangeLang, OnChanges, OnDestroy {

  @Input() folder: Folder;
  folderGraph: DAG = {
    nodes: [],
    links: []
  };
  static svgHeight: number;
  static svgWidth: number;
  static dateFormat: string;

  duplicateDate: string;
  index: number;
  indexByIds: IndexById[] = [];
  node: NodeD3;
  link: LinkD3;
  private coordinateStartOfColumn = new Map();

  constructor(
    protected readonly elRef: ElementRef,
    private readonly translate: TranslateService
  ) { }

  ngOnInit() {
    this.constructNode();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.folder && this.folder) {
      this.constructNode();
    }
  }

  ngAfterViewInit(): void {
    if (this.folderGraph.nodes.length) {
      FolderModalGraphComponent.dateFormat = FolderSvgConst[this.translate.currentLang].DATE_FORMAT;
      this.draw();
    }
  }

  onChangeLang(): void {
    FolderModalGraphComponent.dateFormat = FolderSvgConst[this.translate.currentLang].DATE_FORMAT;
    this.constructNode();
    this.redraw();
  }

  onFocus(): void {
    if (this.folderGraph.nodes.length) {
      this.redraw();
    } else {
      this.clearDrawing();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.redraw();
  }

  private redraw(): void {
    this.clearDrawing();
    if (this.folderGraph.nodes.length) {
      this.draw();
    }
  }

  private clearDrawing(): void {
    const existingSvg = d3.select('#folder-graph').select('svg');
    if (existingSvg) {
      existingSvg.remove();
    }
  }

  private convertDate(date: Date): string {
    return moment.utc(moment(date), 'X').format(FolderSvgConst.DATE_FORMAT);
  }

  private createNodeForNotionOrStudy(index: number, object: Notion | FolderStudy, objId: string): SNode {
    let startDate = null;
    let inForce = false;

    switch (object.type) {
      case NotionType.INFOSOURCE:
        startDate = object.number.length ? object.validationTime : object.creationDate;
        break;
      case NotionType.WARNING:
        if (object.number.length) {
          inForce = !object.cancellationDate;
          startDate = object.publicationDate;
        } else {
          startDate = object.creationDate;
        }
        break;
      case NotionType.GEOREGULATION:
        if (object.number.length) {
          inForce = !object.repealDate;
          startDate = object.repealDate ?? object.publicationDate;
        } else {
          startDate = object.creationDate;
        }
        break;
      default:
        startDate = (object as FolderStudy).lastUpdate;
        break;
    }

    return {
      nodeId: index,
      objectId: objId,
      id: object.id,
      name: object.number ?? `(${this.translate.instant('enum.folder-notion-draft')})`,
      type: {
        name: object.type ?? FolderSvgConst.NODE_ATTRIBUTES['STUDY'].name
      },
      startDate: this.convertDate(startDate),
      endDate: this.convertDate(object.endDate ?? moment(startDate).add(1).toDate()),
      inForce
    };
  }

  private createNodeForAttachment(index: number, object: FolderAttachment): SNode {
    const displayedLabel = this.translate.currentLang === 'fr' ? 'name' : 'internationalName';
    return {
      nodeId: index,
      objectId: object.id,
      id: object.id,
      name: object.attachmentFile.filename + (object.maritimeService ? ' - ' + object.maritimeService[displayedLabel] : ''),
      type: {
        name: FolderSvgConst.NODE_ATTRIBUTES['ATTACHMENT'].name,
      },
      startDate: this.convertDate(object.receptionDate),
      endDate: this.convertDate(object.receptionDate)
    };
  }

  private generateLinks(nodes: SNode[], links: SLink[]): SLink[] {
    nodes.forEach(node => {
      if (node.type.name === 'STUDY') {
        const obj = this.folder.studies.find(s => s.id === node.id);
        obj.notions.forEach(notion => this.addLink(notion.objectId, node, nodes, links));
        obj.attachments.forEach(attachment => this.addLink(attachment.id, node, nodes, links));
      } else if (node.type.name !== 'ATTACHMENT') {
        const obj = this.folder.notions.find(n => n.id === node.id);
        let linkedNotionIds = [];
        switch (obj.type) {
          case NotionType.INFOSOURCE:
            linkedNotionIds = obj.infosource.linkedNotionIds;
            break;
          case NotionType.WARNING:
            linkedNotionIds = obj.warning.linkedNotionIds;
            break;
          case NotionType.GEOREGULATION:
            linkedNotionIds = obj.georegulation.linkedNotionIds;
        }
        linkedNotionIds.forEach(id => this.addLink(id, node, nodes, links));
      }
    });

    return links;
  }

  private addLink(notionId: string, node: SNode, nodes: SNode[], links: SLink[]): void {
    const nodeBis = nodes.find(n => n.objectId === notionId);
    if (!nodeBis) {
      return;
    }
    if (node.nodeId === nodeBis.nodeId) {
      return;
    }
    const newLink = { source: node.nodeId, target: nodeBis.nodeId, value: node.nodeId };
    const reverseLink = { source: nodeBis.nodeId, target: node.nodeId, value: nodeBis.nodeId };
    if (!links.find(link => isEqual(link, newLink)) && !links.find(link => isEqual(link, reverseLink))) {
      links.push(newLink);
    }
  }

  private constructNode(): void {
    let index = 0;
    let links = [];
    const nodes = [];

    this.folder.notions.filter(n => n.type === NotionType.WARNING).forEach(notion => {
      nodes.push(this.createNodeForNotionOrStudy(index, notion, notion.warning.id));
      index++;
    });
    this.folder.notions.filter(n => n.type === NotionType.GEOREGULATION).forEach(notion => {
      nodes.push(this.createNodeForNotionOrStudy(index, notion, notion.georegulation.id));
      index++;
    });
    this.folder.notions.filter(n => n.type === NotionType.INFOSOURCE).forEach(notion => {
      nodes.push(this.createNodeForNotionOrStudy(index, notion, notion.infosource.id));
      index++;
    });
    this.folder.studies.forEach(study => {
      nodes.push(this.createNodeForNotionOrStudy(index, study, study.id));
      index++;
    });
    this.folder.attachments.forEach(attachment => {
      nodes.push(this.createNodeForAttachment(index, attachment));
      index++;
    });

    links.push(...this.generateLinks(nodes, links));

    this.folderGraph.nodes = nodes;
    this.folderGraph.links = links;
  }

  private getDaysArray(): string[] {
    const toUnix = (d: string) => moment(d).unix();
    const valuesStartDate = this.folderGraph.nodes.map(v => toUnix(v.startDate));
    const valuesEndDate = this.folderGraph.nodes.map(v => toUnix(v.endDate));

    const min = Math.min.apply(null, valuesStartDate);
    const max = Math.max.apply(null, valuesEndDate);

    const valuesStartDateToDateFormat = valuesStartDate.map(date => moment.unix(date).format(FolderSvgConst.DATE_FORMAT));
    const valuesEndDateToDateFormat = valuesEndDate.map(date => moment.unix(date).format(FolderSvgConst.DATE_FORMAT));

    let addDay = min;
    const days = [];

    const minToDateFormat = moment.unix(min).format(FolderSvgConst.DATE_FORMAT);

    valuesStartDateToDateFormat.forEach(date => {
      if (date === minToDateFormat) {
        days.push(minToDateFormat);
      }
    });

    while (addDay <= max) {
      addDay += FolderSvgConst.DAY_MS;
      const addDayToDateFormat = moment.unix(addDay).format(FolderSvgConst.DATE_FORMAT);
      if (valuesStartDateToDateFormat.includes(addDayToDateFormat) || valuesEndDateToDateFormat.includes(addDayToDateFormat)) {
        if (valuesStartDateToDateFormat.includes(addDayToDateFormat)) {
          valuesStartDateToDateFormat.forEach(date => {
            if (date === addDayToDateFormat) {
              days.push(addDayToDateFormat);
            }
          });
        } else {
          days.push(addDayToDateFormat);
        }
      }
    }

    for (let i = 1; i <= 3; i++) {
      days.push(moment.unix(max + FolderSvgConst.DAY_MS * i).format(FolderSvgConst.DATE_FORMAT));
    }
    days.reverse();

    return days;
  }

  private appendRect(node: NodeD3, days: string[]): void {
    node.append('rect')
      .attr('x', (d: SNode) => d.type.coordinateX)
      .attr('y', (d: SNode) => this.computeYNodeText(d, days) - 15)
      .style('margin-top', 25)
      .attr('dy', FolderSvgConst.NODE_DY)
      .attr('height', '20px')
      .attr('width', (d: SNode) => customD3Sankey.getNodeWidth(d.name))
      .attr('fill', FolderSvgConst.NODE_FILL)
      .attr('fill-opacity', FolderSvgConst.NODE_FILL_OPACITY)
      .attr('stroke', (d: SNode) => 'white')
      .attr('stroke-width', FolderSvgConst.NODE_STROKE_WIDTH);

    this.duplicateDate = null;
  }

  private appendText(node: NodeD3, days: string[]): void {
    node.append('text')
      .attr('x', (d: SNode) => d.type.coordinateX)
      .attr('y', (d: SNode) => this.computeYNodeText(d, days))
      .style('font-size', '15px')
      .attr('text-anchor', 'end')
      .text((d: SNode) => d.name)
      .style('padding-top', '25px')
      .attr('text-anchor', 'start');

    this.duplicateDate = null;
  }

  private appendIcon(node: NodeD3, days: string[]): void {
    node.append('svg:foreignObject')
      .attr('height', '20px')
      .attr('width', '20px')
      .attr('x', (d: SNode) => d.type.coordinateX - 25)
      .attr('y', (d: SNode) => this.computeYNodeText(d, days) - 13)
      .style('cursor', 'pointer')
      .style('color', (d: SNode) => FolderSvgConst.NODE_ATTRIBUTES[d.type.name].stroke)
      .html((d: SNode) => `<i class="pi ${FolderSvgConst.NODE_ATTRIBUTES[d.type.name].icon}"  style="font-size: 15px"></i>`);

    this.duplicateDate = null;
  }

  private appendIconForNotionInForce(node: NodeD3, days: string[]): void {
    node.append('svg:foreignObject')
      .attr('height', '20px')
      .attr('width', '20px')
      .attr('x', (d: SNode) => d.type.coordinateX - 27)
      .attr('y', (d: SNode) => this.computeYNodeText(d, days) - 16)
      .style('cursor', 'pointer')
      .style('color', (d: SNode) => d.inForce ? 'green' : 'transparent')
      .html((d: SNode) => `<i class="pi ${FolderSvgConst.ICON_NOTION_IN_FORCE}" style="font-size: 10px"></i`);
    this.duplicateDate = null;
  }

  private drawTimeline(svg: LinkD3, days: string[]): void {
    svg.append('rect')
      .attr('x', FolderSvgConst.TIMELINE_X + 10)
      .attr('y', 0)
      .attr('height', FolderModalGraphComponent.svgHeight)
      .attr('width', 1)
      .attr('fill', FolderSvgConst.NODE_FILL)
      .attr('stroke', 'black')
      .attr('stroke-width', 1);

    days.forEach((value: string, index: number) => {
      svg.append('text')
        .attr('font-size', FolderSvgConst.FONT_SIZE_FOR_TIMELINE)
        .attr('x', 0)
        .attr('y', ((FolderModalGraphComponent.svgHeight / days.length) * index)
          + FolderSvgConst.TIMELINE_PADDING + FolderSvgConst.NODE_STROKE_WIDTH * 2)
        .attr('text-anchor', 'end')
        .text(moment(value).format(FolderModalGraphComponent.dateFormat))
        .attr('text-anchor', 'start');
    });
  }

  private draw(): void {
    const days = this.getDaysArray();
    FolderModalGraphComponent.svgHeight = days.length * FolderSvgConst.DAY_HEIGHT + 10;
    FolderModalGraphComponent.svgWidth = this.elRef.nativeElement.firstChild.clientWidth;

    const width = FolderModalGraphComponent.svgWidth;
    const height = FolderModalGraphComponent.svgHeight + FolderSvgConst.MARGIN_FOR_LEGEND;

    const svg = d3.select('#folder-graph').append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', '0 ' + (-FolderSvgConst.MARGIN_FOR_LEGEND) + ' ' + width + ' ' + height)
      .attr('preserveAspectRatio', 'none');

    // Add Legend at top of graph
    const colSize = FolderModalGraphComponent.svgWidth / 3 - FolderSvgConst.TIMELINE_X;
    Object.keys(FolderSvgConst.NODE_ATTRIBUTES).forEach(attribute => {
      const coordinateStartOfColumn = (FolderSvgConst.NODE_ATTRIBUTES[attribute].legend.x * colSize) - (FolderSvgConst.NODE_WIDTH * 2.5);
      this.coordinateStartOfColumn.set(attribute, coordinateStartOfColumn);
      svg.append('text')
        .attr('x', coordinateStartOfColumn)
        .attr('y', (FolderModalGraphComponent.svgHeight / days.length)
          + FolderSvgConst.TIMELINE_PADDING + (FolderSvgConst.NODE_STROKE_WIDTH * 2) - FolderSvgConst.MARGIN_FOR_LEGEND)
        .style('font-size', '15px')
        .attr('text-anchor', 'end')
        .text(this.translate.instant(FolderSvgConst.NODE_ATTRIBUTES[attribute].legend.code))
        .attr('text-anchor', 'start');

      svg.append('svg:foreignObject')
        .attr('height', '20px')
        .attr('width', '20px')
        .attr('x', coordinateStartOfColumn - 20)
        .attr('y', (FolderModalGraphComponent.svgHeight / days.length)
          + FolderSvgConst.TIMELINE_PADDING + (FolderSvgConst.NODE_STROKE_WIDTH * 2) - FolderSvgConst.MARGIN_FOR_LEGEND - 15)
        .style('cursor', 'pointer')
        .style('color', FolderSvgConst.NODE_ATTRIBUTES[attribute].stroke)
        .html(`<i class="pi ${FolderSvgConst.NODE_ATTRIBUTES[attribute].icon}"></i>`)
        .append('title').text(this.translate.instant(FolderSvgConst.NODE_ATTRIBUTES[attribute].legend.date_helper));
    });

    this.folderGraph.nodes.forEach(nodeFolderGraph => nodeFolderGraph.type.coordinateX = this.coordinateStartOfColumn.get(nodeFolderGraph.type.name));

    this.drawTimeline(svg, days);

    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    linearGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#FFF');
    linearGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#00B0F0');

    const sankey = d3Sankey.sankey()
      .extent([[1, 1], [width - 1, height - 20]]);

    let link = svg.append('g')
      .attr('class', 'links')
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-opacity', FolderSvgConst.LIGHT_STROKE_OPACITY)
      .selectAll('path');

    let node = svg.append('g')
      .attr('class', 'nodes')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .selectAll('g');

    sankey(this.folderGraph);

    const nodes = cloneDeep(this.folderGraph.nodes).sort((a, b) => (a.startDate > b.startDate) ? 1 : ((b.startDate > a.startDate) ? -1 : 0));
    node = node
      .data(nodes)
      .enter().append('g');

    this.indexByIds = [];

    this.appendRect(node, days);

    this.appendText(node, days);

    this.appendIcon(node, days);

    this.appendIconForNotionInForce(node, days);

    node.append('title').text((d: SNode) => {
      let titleOnHover = d.name + '\n';

      switch (d.type.name) {
        case NotionType.INFOSOURCE:
          titleOnHover += moment(d.startDate).format(FolderModalGraphComponent.dateFormat);
          break;
        case NotionType.WARNING:
        case NotionType.GEOREGULATION:
          titleOnHover += moment(d.startDate).format(FolderModalGraphComponent.dateFormat);
          if (!d.inForce) {
            titleOnHover += '-' + moment(d.endDate).format(FolderModalGraphComponent.dateFormat);
          }
          break;
        default:
          titleOnHover += moment(d.startDate).format(FolderModalGraphComponent.dateFormat);
          break;
      }

      return titleOnHover;
    });

    link = link
      .data(this.folderGraph.links)
      .enter().append('path')
      .attr('d', customD3Sankey.sankeyLinkHorizontal(this.indexByIds, days.length))
      .style('stroke-opacity', FolderSvgConst.LINK_STROKE_OPACITY)
      .attr('stroke-width', FolderSvgConst.LINK_STROKE_WIDTH);

    this.node = node;
    this.link = link;

    link.append('title').text((d: SLink | any) => d.source.name + ' → ' + d.target.name);

    link.on('mouseover', (evt, l: SLink) => FolderModalGraphComponent.onLinkHover(l, node, link));
    link.on('mouseleave', () => FolderModalGraphComponent.onLinkLeave(node, link));

    node.on('mouseover', (evt, d: SNode) => FolderModalGraphComponent.onNodeHover(link, d, node));
    node.on('mouseleave', () => FolderModalGraphComponent.onNodeLeave(link, node));
  }

  computeY(node: SNode, days: string[]): number {
    const timestamp = node.startDate;
    const timestampToDateFormat = moment.unix(moment(timestamp).unix()).format(FolderSvgConst.DATE_FORMAT);

    const index = days.findIndex(day => day === timestampToDateFormat);

    if (this.duplicateDate) {
      if (this.duplicateDate !== timestampToDateFormat && (customD3Sankey.countOccurencesOfDayInDays(days, timestampToDateFormat) > 1)) {
        this.duplicateDate = timestampToDateFormat;
        this.index = index;
      } else if (this.duplicateDate === timestampToDateFormat) {
        this.index += 1;
      } else {
        this.duplicateDate = null;
        this.index = index;
      }
    } else {
      if (customD3Sankey.countOccurencesOfDayInDays(days, timestampToDateFormat) > 1) {
        this.duplicateDate = timestampToDateFormat;
      }
      this.index = index;
    }

    if (this.indexByIds.findIndex(data => data.id === node.id) === -1) {
      this.indexByIds.push({
        index: this.index,
        id: node.id
      });
    }

    return (FolderModalGraphComponent.svgHeight / days.length) * this.index
      + FolderSvgConst.TIMELINE_PADDING + FolderSvgConst.NODE_STROKE_WIDTH * 2;
  }

  computeYNodeText(node: SNode, days: string[]): number {
    return this.computeY(node, days);
  }

  static onNodeHover(link: LinkD3, node: SNode, allNodes: NodeD3): void {
    allNodes
      .selectAll('rect')
      .transition()
      .duration(300)
      .style('stroke', (n: SNode) =>
        node.sourceLinks.some(sourceLink => (sourceLink.source as SNode) === n || (sourceLink.target as SNode) === n)
          || node.targetLinks.some(targetLink => (targetLink.source as SNode) === n || (targetLink.target as SNode) === n) ?
          FolderSvgConst.NODE_ATTRIBUTES[n.type.name].stroke : 'white'
      )
      .style('stroke-opacity', (n: SNode) =>
        node.sourceLinks.some(sourceLink => (sourceLink.source as SNode) === n || (sourceLink.target as SNode) === n)
          || node.targetLinks.some(targetLink => (targetLink.source as SNode) === n || (targetLink.target as SNode) === n) ?
          FolderSvgConst.FULL_STROKE_OPACITY : FolderSvgConst.LIGHT_STROKE_OPACITY
      );

    link
      .transition()
      .duration(300)
      .style('stroke-opacity', (l: SLink) =>
        (l.source as SNode).id === node.id || (l.target as SNode).id === node.id ? FolderSvgConst.FULL_STROKE_OPACITY : FolderSvgConst.LINK_STROKE_OPACITY
      );
  }

  static onNodeLeave(link: LinkD3, allNodes: NodeD3): void {
    allNodes
      .selectAll('rect')
      .transition()
      .duration(300)
      .style('stroke', 'white')
      .style('stroke-opacity', FolderSvgConst.FULL_STROKE_OPACITY);

    link
      .transition()
      .duration(300)
      .style('stroke-opacity', FolderSvgConst.LINK_STROKE_OPACITY);
  }

  static onLinkHover(link: SLink, node: NodeD3, allLinks: LinkD3): void {
    allLinks
      .transition()
      .duration(300)
      .style('stroke-opacity', (l: SLink) =>
        ((l.source as SNode).id === (link.source as SNode).id && (l.target as SNode).id === (link.target as SNode).id) ?
          FolderSvgConst.FULL_STROKE_OPACITY
          : FolderSvgConst.LINK_STROKE_OPACITY
      );

    node
      .selectAll('rect')
      .transition()
      .duration(300)
      .style('stroke', (n: SNode) =>
        (n.id === (link.source as SNode).id || n.id === (link.target as SNode).id) ? FolderSvgConst.NODE_ATTRIBUTES[n.type.name].stroke : 'white'
      )
      .style('stroke-opacity', (n: SNode) =>
        (n.id === (link.source as SNode).id || n.id === (link.target as SNode).id) ? FolderSvgConst.FULL_STROKE_OPACITY : FolderSvgConst.LIGHT_STROKE_OPACITY
      );
  }

  static onLinkLeave(node: NodeD3, allLinks: LinkD3): void {
    allLinks
      .transition()
      .duration(300)
      .style('stroke-opacity', FolderSvgConst.LINK_STROKE_OPACITY);

    node
      .selectAll('rect')
      .transition()
      .duration(300)
      .style('stroke', 'white')
      .style('stroke-opacity', FolderSvgConst.FULL_STROKE_OPACITY);
  }

  ngOnDestroy() {
    this.link?.on('mouseover', null);
    this.link?.on('mouseleave', null);
    this.node?.on('mouseover', null);
    this.node?.on('mouseleave', null);
  }
}
