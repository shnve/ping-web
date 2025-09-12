import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticLogoCreationComponent } from './static-logo-creation.component';

describe('StaticLogoCreationComponent', () => {
  let component: StaticLogoCreationComponent;
  let fixture: ComponentFixture<StaticLogoCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaticLogoCreationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaticLogoCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
