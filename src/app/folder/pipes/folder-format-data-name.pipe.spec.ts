import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { FolderDataBase, FolderFormatDataNamePipe } from './folder-format-data-name.pipe';


describe('FolderFormatDataNamePipe', () => {
  let pipe;
  let translateServiceSpy: TranslateService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TranslateService)
      ]
    });

    translateServiceSpy = TestBed.inject(TranslateService);
  });

  beforeEach(() => {
    pipe = new FolderFormatDataNamePipe(translateServiceSpy);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return name based on user preferred language (fr)', () => {
    // Given
    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('fr');
    const folderDataBase: FolderDataBase = {
      id: '1',
      name: 'nom',
      internationalName: 'name'
    };

    // When
    const translateName = pipe.transform(folderDataBase);

    // Then
    expect(translateName).toEqual('nom');
  });

  it('should return name based on user preferred language (en)', () => {
    // Given
    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('en');
    const folderDataBase: FolderDataBase = {
      id: '1',
      name: 'nom',
      internationalName: 'name'
    };

    // When
    const translateName = pipe.transform(folderDataBase);

    // Then
    expect(translateName).toEqual('name');
  });
});
