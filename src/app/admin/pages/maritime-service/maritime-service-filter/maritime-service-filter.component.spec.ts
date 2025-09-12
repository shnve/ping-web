import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderByPipe } from 'ngx-pipes';
import { MaritimeServiceFilterComponent } from './maritime-service-filter.component';

describe('MaritimeServiceFilterComponent', () => {
  let component: MaritimeServiceFilterComponent;
  let fixture: ComponentFixture<MaritimeServiceFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaritimeServiceFilterComponent, OrderByPipe ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaritimeServiceFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
