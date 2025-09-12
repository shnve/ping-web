import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import MaritimeService from '@app/models/maritime-service.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { FolderFollowedTablesComponent } from './folder-followed-tables.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('FolderFollowedTablesComponent', () => {
  let component: FolderFollowedTablesComponent;
  let fixture: ComponentFixture<FolderFollowedTablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FolderFollowedTablesComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: { paramMap: convertToParamMap({ folderId: '6cac9acb-927e-4394-b523-edfe754f335c' }) }
            },
        },
        MockProvider(MaritimeServicesApi, {
            findByServiceIds(ids: string[]): Observable<MaritimeService[]> {
                return of([{ id: '1', name: 'my-service', maritimeEntities: [] }]);
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderFollowedTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
