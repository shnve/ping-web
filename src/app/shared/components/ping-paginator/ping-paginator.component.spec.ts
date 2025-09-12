import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { PingPaginatorComponent } from './ping-paginator.component';

describe('ShomPaginatorComponent', () => {
  let component: PingPaginatorComponent;
  let fixture: ComponentFixture<PingPaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PingPaginatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PingPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should handle next and previous page', fakeAsync((): void => {
    const shomPaginatorElement: HTMLElement = fixture.nativeElement;
    (shomPaginatorElement.querySelector('.next-button') as HTMLButtonElement).click();
    tick(500);
    expect(component.currentPage).toEqual(1);

    (shomPaginatorElement.querySelector('.previous-button') as HTMLButtonElement).click();
    tick(500);
    expect(component.currentPage).toEqual(0);
  }));
});
