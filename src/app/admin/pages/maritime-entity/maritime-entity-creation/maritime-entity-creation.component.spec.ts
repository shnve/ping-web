import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaritimeEntityCreationComponent } from './maritime-entity-creation.component';

describe('MaritimeEntityCreationComponent', () => {
  let component: MaritimeEntityCreationComponent;
  let fixture: ComponentFixture<MaritimeEntityCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaritimeEntityCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaritimeEntityCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
