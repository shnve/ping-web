import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProUserCreationComponent } from './pro-user-creation.component';

describe('ProUserCreationComponent', () => {
  let component: ProUserCreationComponent;
  let fixture: ComponentFixture<ProUserCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProUserCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProUserCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
