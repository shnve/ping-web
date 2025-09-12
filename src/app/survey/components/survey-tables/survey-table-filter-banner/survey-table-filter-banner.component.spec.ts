import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { SurveyTableFilterBannerComponent } from './survey-table-filter-banner.component';

describe('SurveyTableFilterBannerComponent', () => {
  let component: SurveyTableFilterBannerComponent;
  let fixture: ComponentFixture<SurveyTableFilterBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyTableFilterBannerComponent ],
      imports: [ TranslateModule.forRoot() ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyTableFilterBannerComponent);
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
