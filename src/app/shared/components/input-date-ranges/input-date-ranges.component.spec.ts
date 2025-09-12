import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { InputDateRangesComponent } from './input-date-ranges.component';

describe('InputDateRangesComponent', () => {
  let component: InputDateRangesComponent;
  let fixture: ComponentFixture<InputDateRangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputDateRangesComponent ],
      imports: [
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputDateRangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
