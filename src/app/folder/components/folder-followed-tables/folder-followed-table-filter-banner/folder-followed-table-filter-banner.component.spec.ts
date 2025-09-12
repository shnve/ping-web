import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { FolderFollowedTableFilterBannerComponent } from './folder-followed-table-filter-banner.component';

describe('FolderFollowedTableFilterBannerComponent', () => {
  let component: FolderFollowedTableFilterBannerComponent;
  let fixture: ComponentFixture<FolderFollowedTableFilterBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FolderFollowedTableFilterBannerComponent],
      imports: [TranslateModule.forRoot()]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderFollowedTableFilterBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
