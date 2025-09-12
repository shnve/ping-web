import { TestBed } from '@angular/core/testing';

import { SessionState } from './session.state';

describe('Session.StateService', () => {
  let service: SessionState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
