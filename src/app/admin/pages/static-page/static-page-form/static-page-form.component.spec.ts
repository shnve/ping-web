import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';

import { StaticPageFormComponent } from './static-page-form.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticPageFormComponent', () => {
  let component: StaticPageFormComponent;
  let fixture: ComponentFixture<StaticPageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticPageFormComponent],
    imports: [ReactiveFormsModule,
        TranslateModule.forRoot()],
    providers: [
        MockProvider(Router, {}),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticPageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
