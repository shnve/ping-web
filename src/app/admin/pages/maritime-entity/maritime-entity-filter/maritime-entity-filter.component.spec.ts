import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaritimeEntityFilterComponent } from './maritime-entity-filter.component';


describe('MaritimeEntityFilterComponent', () => {
  let component: MaritimeEntityFilterComponent;
  let fixture: ComponentFixture<MaritimeEntityFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaritimeEntityFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaritimeEntityFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
