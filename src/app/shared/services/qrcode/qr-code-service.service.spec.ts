import { TestBed } from '@angular/core/testing';

import { QrCodeService } from './qr-code.service';

describe('QrCodeService', () => {
  let service: QrCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QrCodeService],
    });
    service = TestBed.inject(QrCodeService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an img HTML string with the QR code', (done) => {
    // Given
    const sharedLinkUrl = 'http://example.com';
    const size = 200;
    const expectedResult = '<img src="data:image/png;base64,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" width="200"  alt="http://example.com" />';

    // When
    const result = QrCodeService.getImageQrcode(sharedLinkUrl, size);

    // Then
    setTimeout(() => {
      expect(result).toContain(expectedResult);
      done();
    }, 1000);
  });
});
