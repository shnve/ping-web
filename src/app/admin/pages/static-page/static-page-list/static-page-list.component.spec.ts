import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

import { StaticPageListComponent } from './static-page-list.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticPageListComponent', () => {
  let component: StaticPageListComponent;
  let fixture: ComponentFixture<StaticPageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticPageListComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        ConfirmationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticPageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
