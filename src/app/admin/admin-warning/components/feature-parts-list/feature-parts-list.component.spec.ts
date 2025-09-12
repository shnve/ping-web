import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LangService } from '@app/core/lang.service';
import { TranslateModule } from '@ngx-translate/core';

import { ConfirmationService } from 'primeng/api';
import { FeaturePartsListComponent } from './feature-parts-list.component';

describe('FeaturePartsListComponent', () => {
  let component: FeaturePartsListComponent;
  let fixture: ComponentFixture<FeaturePartsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturePartsListComponent ],
      providers: [
        LangService,
        ConfirmationService
      ],
      imports: [
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturePartsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
