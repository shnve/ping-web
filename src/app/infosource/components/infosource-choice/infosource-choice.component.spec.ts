import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

import { InfosourceChoiceComponent } from './infosource-choice.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('InfosourceChoiceComponent', () => {
  let component: InfosourceChoiceComponent;
  let fixture: ComponentFixture<InfosourceChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [InfosourceChoiceComponent],
    imports: [TranslateModule.forRoot(),
        RouterModule.forRoot([])],
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
    fixture = TestBed.createComponent(InfosourceChoiceComponent);
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
