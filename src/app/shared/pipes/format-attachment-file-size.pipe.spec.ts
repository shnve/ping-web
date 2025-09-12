import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { FormatAttachmentFileSizePipe } from './format-attachment-file-size.pipe';

describe('FormatAttachmentFileSizePipe', () => {

  let pipe: FormatAttachmentFileSizePipe;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        MockProvider(TranslateService, {
          instant(key: string): string {
            switch (translateService.currentLang) {
              case 'fr': return 'O';
              case 'en': return 'B';
            };
          }
        })
      ]
    }).compileComponents();
    translateService = TestBed.inject(TranslateService);
  });

  beforeEach(() => {
    pipe = new FormatAttachmentFileSizePipe(translateService);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('create an instance', done => {
    expect(pipe).toBeTruthy();
    done();
  });

  it('should return the formatted size of the file in fr', done => {
    let sizeFile = 10000;
    spyOnProperty(translateService, 'currentLang', 'get').and.returnValue('fr');

    const result = pipe.transform(sizeFile);

    expect(result).toEqual('10 KO');
    done();
  });

  it('should return the formatted size of the file in en', done => {
    let sizeFile = 10000;
    spyOnProperty(translateService, 'currentLang', 'get').and.returnValue('en');

    const result = pipe.transform(sizeFile);

    expect(result).toEqual('10 KB');
    done();
  });
})
