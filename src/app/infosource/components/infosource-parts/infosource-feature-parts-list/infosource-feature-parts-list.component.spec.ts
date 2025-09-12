import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { InfosourceFeaturePartsListComponent } from './infosource-feature-parts-list.component';

describe('InfosourceFeaturePartsListComponent', () => {
  let component: InfosourceFeaturePartsListComponent;
  let fixture: ComponentFixture<InfosourceFeaturePartsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfosourceFeaturePartsListComponent ],
      imports: [ TranslateModule.forRoot() ],
      providers: [ ConfirmationService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceFeaturePartsListComponent);
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
