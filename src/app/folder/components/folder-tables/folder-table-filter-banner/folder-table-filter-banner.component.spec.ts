import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { FolderTableFilterBannerComponent } from './folder-table-filter-banner.component';

describe('FolderTableFilterBannerComponent', () => {
  let component: FolderTableFilterBannerComponent;
  let fixture: ComponentFixture<FolderTableFilterBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FolderTableFilterBannerComponent ],
      imports: [ TranslateModule.forRoot() ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderTableFilterBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
