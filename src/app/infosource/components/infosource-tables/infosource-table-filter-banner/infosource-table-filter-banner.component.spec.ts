import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { InfosourceTableFilterBannerComponent } from './infosource-table-filter-banner.component';

describe('InfosourceTableFilterBannerComponent', () => {
  let component: InfosourceTableFilterBannerComponent;
  let fixture: ComponentFixture<InfosourceTableFilterBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfosourceTableFilterBannerComponent ],
      imports: [ TranslateModule.forRoot() ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceTableFilterBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
