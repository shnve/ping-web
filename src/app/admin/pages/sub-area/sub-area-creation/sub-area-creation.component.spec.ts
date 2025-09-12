import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubAreaCreationComponent } from './sub-area-creation.component';

describe('SubAreaCreationComponent', () => {
  let component: SubAreaCreationComponent;
  let fixture: ComponentFixture<SubAreaCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubAreaCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubAreaCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
