import { TestBed } from '@angular/core/testing';

import { TableState } from './table.state';

describe('TableState', () => {
  let service: TableState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableState]
    });
    service = TestBed.inject(TableState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
