import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { InfosourceHomeComponent } from './infosource-home.component';

describe('InfosourceHomeComponent', () => {
  let component: InfosourceHomeComponent;
  let fixture: ComponentFixture<InfosourceHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfosourceHomeComponent ],
      imports: [
        TranslateModule.forRoot(),
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
