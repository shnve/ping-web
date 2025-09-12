import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FolderBase } from '@app/folder/models/folder.model';
import { FolderService } from '@app/folder/services/folder.service';
import { TableAdminFilterValues } from '@app/models/admin/warning-admin-filter.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { MaritimeEntitiesService } from '@app/services/maritime-entities.service';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { OrderByPipe } from 'ngx-pipes';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { Observable, of } from 'rxjs';
import { TableAdminAdvancedFilterComponent } from './table-admin-advanced-filter.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('TableAdminAdvancedFilterComponent', () => {
  let component: TableAdminAdvancedFilterComponent;
  let fixture: ComponentFixture<TableAdminAdvancedFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        TableAdminAdvancedFilterComponent,
        OrderByPipe
    ],
    imports: [ReactiveFormsModule,
        CalendarModule,
        MultiSelectModule,
        CheckboxModule,
        InputTextModule,
        DropdownModule,
        TriStateCheckboxModule,
        TranslateModule.forRoot()],
    providers: [
        OrderByPipe,
        MockProvider(ModelItemFilterState, {
            getValues$(): Observable<TableAdminFilterValues> {
                return new Observable();
            }
        }),
        MockProvider(MaritimeEntitiesService, {
            getAvailableWarningEntities$(): Observable<MaritimeEntityBase[]> {
                return of([{
                        id: '1',
                        name: 'my-entity'
                    }]);
            },
            getLinkedEntitiesForCoverFiltering$(serieId: string): Observable<MaritimeEntityBase[]> {
                return of([{
                        id: '1',
                        name: 'my-entity'
                    }]);
            }
        }),
        MockProvider(FolderService, {
            getAvailableWarningFolders$(): Observable<FolderBase[]> {
                return of([]);
            }
        }),
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableAdminAdvancedFilterComponent);
    component = fixture.componentInstance;
    component.filterState = TestBed.inject(ModelItemFilterState);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
