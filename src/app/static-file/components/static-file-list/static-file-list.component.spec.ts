import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { StaticFileListComponent } from './static-file-list.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticFileListComponent', () => {
  let component: StaticFileListComponent;
  let fixture: ComponentFixture<StaticFileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticFileListComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        ConfirmationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(StaticFileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
