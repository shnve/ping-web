import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StaticSectionFormComponent } from './static-section-form.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticSectionFormComponent', () => {
  let component: StaticSectionFormComponent;
  let fixture: ComponentFixture<StaticSectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticSectionFormComponent],
    imports: [TranslateModule.forRoot()],
    providers: [UntypedFormBuilder, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();

    fixture = TestBed.createComponent(StaticSectionFormComponent);
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
