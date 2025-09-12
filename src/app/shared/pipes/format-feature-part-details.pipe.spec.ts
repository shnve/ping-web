import { TestBed } from '@angular/core/testing';
import { listWarningHazardTypeDetails } from '@app/models/warning.model';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { FormatFeaturePartDetailsPipe } from './format-feature-part-details.pipe';

describe('FormatFeaturePartDetailsPipe', () => {
  let pipe: FormatFeaturePartDetailsPipe;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TranslateService, {
          instant(key: string): string {
            switch (key) {
              case 'a.first.key': return "A First Key";
              case 'a.second.key': return "A Second Key";
            };
          }
        })
      ]
    });
  });

  beforeEach(() => {
    const translateService: TranslateService = TestBed.inject(TranslateService);
    pipe = new FormatFeaturePartDetailsPipe(translateService);
    spyOn(listWarningHazardTypeDetails, 'find').and.returnValues({key: 'FIRST_KEY', value: 'a.first.key'}, {key: 'SECOND_KEY', value: 'a.second.key'});
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return translated and joint type details', () => {
    // Given
    const typeDetails = ['FIRST_KEY', 'SECOND_KEY'];

    // When
    const text = pipe.transform(typeDetails);

    // Then
    expect(text).toEqual('A First Key, A Second Key');
  });
});
