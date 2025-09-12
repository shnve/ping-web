import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { WarningPublicReferenceType } from './../../models/warning-public-reference.model';
import { FormatReferenceHeaderPipe } from './format-reference-header.pipe';

describe('FormatReferenceHeaderPipe', () => {
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
    pipe = new FormatReferenceHeaderPipe(translateServiceSpy);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return header of warnings publics references based on user preferred language', () => {
    // Given
    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('fr');
    spyOn(translateServiceSpy, 'instant').and.returnValue('{{warningsLength}} AN(s)');

    // When
    const warningsPublicsReferencesHeader = pipe.transform(WarningPublicReferenceType.WARNING, 2);

    // Then
    expect(warningsPublicsReferencesHeader).toEqual('2 AN(s)');
  });

  it('should return header of georegulations references based on user preferred language', () => {
    // Given
    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('fr');
    spyOn(translateServiceSpy, 'instant').and.returnValue('{{georegulationsLength}} GR(s)');

    // When
    const georegulationsPublicsReferencesHeader = pipe.transform(WarningPublicReferenceType.GEOREGULATION, 2);

    // Then
    expect(georegulationsPublicsReferencesHeader).toEqual('2 GR(s)');
  });

  it('should return header of entities references publics references based on user preferred language', () => {
    // Given
    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('fr');
    spyOn(translateServiceSpy, 'instant').and.returnValue('{{entitiesReferencesLength}} référence(s)');

    // When
    const entitiesReferencesPublicsReferencesHeader = pipe.transform(WarningPublicReferenceType.ENTITY_REFERENCE, 2);

    // Then
    expect(entitiesReferencesPublicsReferencesHeader).toEqual('2 référence(s)');
  });

  it('should return header of attachments publics references based on user preferred language', () => {
    // Given
    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('fr');
    spyOn(translateServiceSpy, 'instant').and.returnValue('{{attachmentsLength}} pièce(s) jointes(s)');

    // When
    const attachmentsPublicsReferencesHeader = pipe.transform(WarningPublicReferenceType.ATTACHMENT, 2);

    // Then
    expect(attachmentsPublicsReferencesHeader).toEqual('2 pièce(s) jointes(s)');
  });

  it('should return header of warning links publics references based on user preferred language', () => {
    // Given
    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('fr');
    spyOn(translateServiceSpy, 'instant').and.returnValue('{{linksLength}} lien(s)');

    // When
    const warningLinksPublicsReferencesHeader = pipe.transform(WarningPublicReferenceType.LINK, 2);

    // Then
    expect(warningLinksPublicsReferencesHeader).toEqual('2 lien(s)');
  });
});
