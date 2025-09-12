import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PermissionsProvider } from '../../../privileges/permissions-provider';
import { FolderTablesComponent } from './folder-tables.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('FolderTablesComponent', () => {
  let component: FolderTablesComponent;
  let fixture: ComponentFixture<FolderTablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FolderTablesComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: { paramMap: convertToParamMap({ warningId: '6cac9acb-927e-4394-b523-edfe754f335c' }) }
            },
        },
        UntypedFormBuilder,
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
