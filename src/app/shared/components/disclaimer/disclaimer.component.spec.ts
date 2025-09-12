import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisclaimerComponent } from './disclaimer.component';
import { TranslateModule } from '@ngx-translate/core';
import { SafeHtmlPipe } from '@shared/pipes/safe-html.pipe';

describe('DisclaimerComponent', () => {
  let component: DisclaimerComponent;
  let fixture: ComponentFixture<DisclaimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DisclaimerComponent,
        SafeHtmlPipe
      ],
      providers: [SafeHtmlPipe],
      imports: [
        TranslateModule.forRoot()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
