import { TestBed } from '@angular/core/testing';

import { MousePositionFormatterService } from './mouse-position-formatter.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

describe('MousePositionFormatterService', () => {
  let service: MousePositionFormatterService;
  let translateServiceSpy: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
      ],
      providers: [
        TranslateService,
        MousePositionFormatterService
      ]
    });
    service = TestBed.inject(MousePositionFormatterService);
    translateServiceSpy = TestBed.inject(TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
