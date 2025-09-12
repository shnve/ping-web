import { Component, ContentChildren, Input, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, TemplateRef } from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { ReferencesByFolder, TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE } from '@app/folder/models/folder-study.model';
import { TemplateIdDirective } from '@app/shared/directives/template-id.directive';
import { sortAlphabetically } from '@app/shared/generic-utils';
import { TranslateService } from '@ngx-translate/core';
import { Column } from '@shared/components/paginated-table/paginated-table.component';

@Localize()
@Component({
  selector: 'folder-modal-references',
  templateUrl: './folder-modal-references.component.html'
})
export class FolderModalReferencesComponent implements OnInit, OnChanges, OnChangeLang, OnDestroy {
  @Input() referencesByFolder: ReferencesByFolder[];

  referenceTable: Array<{ type: string, value: string, studyNumber: string }> = [];
  columns: Column[] = [];
  columnCellsMap: Map<string, TemplateRef<any>> = new Map();
  @ContentChildren(TemplateIdDirective) cells: QueryList<TemplateIdDirective>;

  constructor(private readonly translate: TranslateService) { }

  ngOnInit(): void {
    this.columns = [
      { key: 'type', translateKey: 'folder-modal-reference.columns.type' },
      { key: 'value', translateKey: 'folder-modal-reference.columns.value' },
      { key: 'study', translateKey: 'folder-modal-reference.columns.study' }
    ];
    this.constructReferenceTable();
  }

  ngAfterViewInit(): void {
    // Map cells templates with their id
    this.cells.forEach(cell => cell.id && this.columnCellsMap.set(cell.id, cell.template));
  }

  private constructReferenceTable(): void {
    this.referenceTable = [];
    this.referenceTable.push(...this.referencesByFolder.map(r => r.studyReferences.map(ref => ({ type: this.getReferenceTypeLabel(ref.type), value: ref.value, studyNumber: r.studyNumber }))).flat());
    this.referenceTable = this.sortReferencesByValue(this.referenceTable).reverse();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.referencesByFolder) {
      this.constructReferenceTable();
    }
  }

  onChangeLang(): void {
    this.constructReferenceTable();
  }

  private getReferenceTypeLabel(referenceType: string): string {
    return this.translate.instant(TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE.find(reference => reference.type === referenceType).label);
  }

  private sortReferencesByValue(references: Array<{ type: string, value: string }>): Array<{ type: string, value: string, studyNumber: string }> {
    return sortAlphabetically(references, 'value');
  }

  ngOnDestroy(): void {
    // empty because use of scavenger
  }
}
