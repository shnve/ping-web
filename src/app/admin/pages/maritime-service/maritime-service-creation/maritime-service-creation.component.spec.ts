import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaritimeServiceCreationComponent } from './maritime-service-creation.component';

describe('MaritimeServiceCreationComponent', () => {
  let component: MaritimeServiceCreationComponent;
  let fixture: ComponentFixture<MaritimeServiceCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaritimeServiceCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaritimeServiceCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
