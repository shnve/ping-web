import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticPageCreationComponent } from './static-page-creation.component';

describe('StaticPageCreationComponent', () => {
  let component: StaticPageCreationComponent;
  let fixture: ComponentFixture<StaticPageCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaticPageCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticPageCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
