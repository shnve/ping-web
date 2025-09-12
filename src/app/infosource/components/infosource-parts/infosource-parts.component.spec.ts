import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { InfosourcePartsComponent } from './infosource-parts.component';

describe('InfosourcePartsComponent', () => {
  let component: InfosourcePartsComponent;
  let fixture: ComponentFixture<InfosourcePartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfosourcePartsComponent],
      imports: [TranslateModule.forRoot()],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourcePartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
