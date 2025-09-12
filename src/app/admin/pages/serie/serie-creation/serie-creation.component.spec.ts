import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SerieCreationComponent } from './serie-creation.component';

describe('SerieCreationComponent', () => {
  let component: SerieCreationComponent;
  let fixture: ComponentFixture<SerieCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SerieCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SerieCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
