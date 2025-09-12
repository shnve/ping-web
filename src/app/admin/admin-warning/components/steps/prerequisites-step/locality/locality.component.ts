import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { WarningCreationPrerequisites, WarningLocalityNames } from '@app/admin/admin-warning/models/creation-warning.model';
import { SubAreasApi } from '@app/api/sub-areas.api';
import { SubArea } from '@app/models/sub-area.model';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'aw-locality',
  templateUrl: './locality.component.html',
  styleUrls: ['./locality.component.scss']
})
export class LocalityComponent implements OnChanges {
  @Input() area: SubArea;
  @Input() areasList: Array<SubArea>;
  @Input() localitiesList: Array<any>;
  @Input() prerequisites: WarningCreationPrerequisites;
  @Input() selectedArea: SubArea;
  @Input() selectedAreas: Array<SubArea> = [];
  @Input() selectedLocalities: Map<string, Array<SubArea>>;
  @Input() isPublished: boolean;
  checkedLocalities: Array<SubArea>;
  protected chosenLocality: SubArea;
  saveLocalitySubscription: Subscription;
  missingSector = false;
  displayModal = false;
  newLocalityName: string;
  newLocalityInternationalName: string;
  @Output() localityUpdated = new EventEmitter<void>();

  constructor(private readonly subAreasApi: SubAreasApi
  ) { }


  ngOnChanges(): void {
    this.checkedLocalities = this.selectedLocalities.get(this.area.id) ?? [];

    if (this.checkedLocalities.length) {

      // update position of localities
      this.checkedLocalities.forEach(locality =>
        locality.position = this.prerequisites.localityNames.find(l => (l.parentId === this.area.id) && (l.name === locality.name)).position
      );
    }
  }

  onSaveLocality(areaId?: string): void {
    if (!this.newLocalityName || this.isPublished || !areaId) { return; }
    this.displayModal = false;

    this.saveLocalitySubscription = this.subAreasApi.saveLocality(areaId, this.newLocalityName, this.newLocalityInternationalName)
      .pipe(
        tap({
          next: localityCreated => {
            const selectedAreaId = areaId;
            this.selectedArea = this.areasList.find(area => area.id === selectedAreaId);
            this.selectedArea.subAreas.push(localityCreated);
            this.loadLocalitiesList(areaId);
            const newLocality = this.localitiesList.find(locality => locality.id === localityCreated.id);
            newLocality.position = this.selectedArea.subAreas.length + 1;
            this.checkedLocalities.push(newLocality);
            this.chosenLocality = localityCreated;
            this.localityUpdated.emit();
          }
        })
      )
      .subscribe(() => this.onAddLocality(areaId));
  }

  showSaveLocalityModalDialog(): void {
    this.displayModal = true;
  }

  protected onAddLocality(areaId: string): void {
    if (this.isPublished || !this.chosenLocality) { return; }
    const subAreas: SubArea[] = this.selectedLocalities?.get(areaId) || new Array<SubArea>();

    if (!subAreas.some(s => s.name === this.chosenLocality.name)) {
      // we need to increment the position of the new locality depending on the existing localities to maintain the order
      // if no localities are selected, we set the position to 1
      // if localities are selected, we set the position to the max position + 1
      const position = subAreas.length ? Math.max(...subAreas.map(s => s.position)) + 1 : 1;
      this.chosenLocality.position = position;
      subAreas.push(this.chosenLocality);
    }

    this.checkedLocalities = subAreas;

    this.updateLocalities(areaId, subAreas);

    this.newLocalityName = null;
    this.newLocalityInternationalName = null;
    this.chosenLocality = { id: null, name: null };
    this.localityUpdated.emit();
  }

  onRemoveLocality(areaId: string, localityName: string): void {
    if (this.isPublished) { return; }
    const subAreas: SubArea[] = this.selectedLocalities.get(areaId);
    const index = subAreas.findIndex(s => s.name === localityName);
    subAreas.splice(index, 1);

    // update position of localities
    // we need to increment the position of remaining localities to maintain the order after removing one
    // There is only localities for one area
    subAreas.forEach((locality, i) => locality.position = i + 1);

    this.checkedLocalities = subAreas;

    this.updateLocalities(areaId, subAreas);

    this.localityUpdated.emit();
  }

  private updateLocalities(areaId: string, subAreas: SubArea[]): void {
    this.selectedLocalities.set(areaId, subAreas);
    this.prerequisites.selectedLocalities = this.selectedLocalities;
    this.prerequisites.localityNames = LocalityComponent.convertMapSectorLocalitiesToWarningLocalityNamesArray(this.prerequisites.selectedLocalities);
  }

  loadLocalitiesList(areaId: string): void {
    this.localitiesList = this.areasList.filter(area => areaId === area.id && area.subAreas?.length)
      .flatMap(area => area.subAreas);
  }

  public static convertMapSectorLocalitiesToWarningLocalityNamesArray(mapSectorLocalities: Map<string, SubArea[]>): WarningLocalityNames[] {
    return [...mapSectorLocalities].reduce((acc, mapParentLocalitiesEntry) => {
      const [parentSectorId, childrenLocalities] = mapParentLocalitiesEntry;
      const localityNames: WarningLocalityNames[] = [...childrenLocalities].reduce((accLocalities, locality) => {
        accLocalities.push({
          id: locality.id,
          name: locality.name,
          internationalName: locality.internationalName ?? locality.name,
          parentId: parentSectorId,
          position: locality.position
        });
        return accLocalities;
      }, []).flatMap(s => s);
      acc.push(localityNames);
      return acc;
    }, []).flatMap(s => s);
  }
}
