import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { SurveyModalMapLegendComponent } from './survey-modal-map-legend.component';

describe('SurveyModalMapLegendComponent', () => {
  let component: SurveyModalMapLegendComponent;
  let fixture: ComponentFixture<SurveyModalMapLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      declarations: [SurveyModalMapLegendComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SurveyModalMapLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
