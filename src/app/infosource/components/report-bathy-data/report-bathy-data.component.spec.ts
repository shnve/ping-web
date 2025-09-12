import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ReportBathyDataComponent } from './report-bathy-data.component';

describe('ReportBathyDataComponent', () => {
  let component: ReportBathyDataComponent;
  let fixture: ComponentFixture<ReportBathyDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportBathyDataComponent ],
      imports: [ TranslateModule.forRoot() ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportBathyDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
