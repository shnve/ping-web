import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { InfosourceAdvancedFilterComponent } from './infosource-advanced-filter.component';

describe('InfosourceAdvancedFilterComponent', () => {
  let component: InfosourceAdvancedFilterComponent;
  let fixture: ComponentFixture<InfosourceAdvancedFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfosourceAdvancedFilterComponent ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceAdvancedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
