import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { MapInfosource } from '@app/infosource/models/infosource.model';
import { NotionType } from '@app/models/notion.model';
import { MapWarning } from '@app/models/warning.model';
import { FeatureType } from '@app/sig/utils/feature';
import { SurveyDanger } from '@app/survey/models/survey.model';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import { MapGeoregulation } from '../../../georegulation/models/georegulation.model';

@Component({
  selector: 'sig-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverComponent {
  data: MapWarning[] | MapGeoregulation[] | MapInfosource[] | SurveyDanger[] | SimpleGeometry[] = [];
  numberOfRemainingDatas: number;
  type: NotionType;
  protected featureType: FeatureType;
  protected isSurveyFeatureData = false;

  constructor(public element: ElementRef,
    private readonly cdr: ChangeDetectorRef
  ) { }

  setDataToDisplayOnHoverNotion(data: Set<MapWarning> | Set<MapGeoregulation> | Set<MapInfosource>, type: NotionType) {
    let allData;
    this.type = type;

    switch (type) {
      case NotionType.INFOSOURCE:
        allData = Array.from(data as Set<MapInfosource>);
        break;

      case NotionType.WARNING:
        allData = Array.from(data as Set<MapWarning>);
        break;

      case NotionType.GEOREGULATION:
        allData = Array.from(data as Set<MapGeoregulation>);
        break;

      default:
        break;
    }

    this.data = allData.slice(0, 3);
    this.numberOfRemainingDatas = Math.max(allData.length - this.data.length, 0);
    this.cdr.detectChanges();
  }

  setSurveyFeaturesDataToDisplay(data: Set<SurveyDanger> | Set<SimpleGeometry>, type: FeatureType): void {
    let allData;

    switch (type) {
      case FeatureType.DANGER:
        allData = Array.from(data as Set<SurveyDanger>);
        break;

      case FeatureType.SIMPLE_GEOMETRY:
        allData = Array.from(data as Set<SimpleGeometry>);
        break;

      default:
        break;
    }

    this.isSurveyFeatureData = !!allData.length;
    this.featureType = type;
    this.data = allData.slice(0, 3);
    this.numberOfRemainingDatas = Math.max(allData.length - this.data.length, 0);
    this.cdr.detectChanges();
  }

  hide() {
    this.element.nativeElement.style.display = 'none';
  }

  show() {
    this.element.nativeElement.style.display = 'block';
  }
}
