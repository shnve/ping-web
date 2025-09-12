import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SurveyAdvancedFilterComponent } from './survey-advanced-filter.component';

describe('SurveyAdvancedFilterComponent', () => {
  let component: SurveyAdvancedFilterComponent;
  let fixture: ComponentFixture<SurveyAdvancedFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyAdvancedFilterComponent ],
      imports: [ TranslateModule.forRoot() ],
      providers: [ UntypedFormBuilder ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyAdvancedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });
});
