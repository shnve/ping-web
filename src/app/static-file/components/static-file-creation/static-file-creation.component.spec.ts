import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticFileCreationComponent } from './static-file-creation.component';

describe('StaticFileCreationComponent', () => {
  let component: StaticFileCreationComponent;
  let fixture: ComponentFixture<StaticFileCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaticFileCreationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaticFileCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
