import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FolderAdvancedFilterComponent } from './folder-advanced-filter.component';

describe('FolderAdvancedFilterComponent', () => {
  let component: FolderAdvancedFilterComponent;
  let fixture: ComponentFixture<FolderAdvancedFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FolderAdvancedFilterComponent ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderAdvancedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
