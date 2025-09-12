import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';

import { AddNotionToFolderSelectionComponent } from './add-notion-to-folder-selection.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AddNotionToFolderSelectionComponent', () => {
  let component: AddNotionToFolderSelectionComponent;
  let fixture: ComponentFixture<AddNotionToFolderSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AddNotionToFolderSelectionComponent],
    imports: [TranslateModule.forRoot()],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNotionToFolderSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
