import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { FormatNotificationTitlePipe } from './format-notification-title.pipe';

describe('FormatNotificationTitlePipe', () => {
  let pipe: FormatNotificationTitlePipe;
  let translate: TranslateService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TranslateService, {})
      ]
    });
  });

  beforeEach(() => {
    translate = TestBed.inject(TranslateService);
    pipe = new FormatNotificationTitlePipe(translate);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format single IS', done => {
    // Given
    const title = '56';
    spyOn(translate, 'instant')
      .withArgs('notification.linked-warnings').and.returnValues('AN concernés : ')
      .withArgs('notification.linked-folders').and.returnValues('Affaires concernées : ');

    // When
    const result = pipe.transform(title);

    // Then
    expect(result).toEqual('56');
    done();
  });

  it('should format IS + AN + folders', done => {
    // Given
    const title = '56{{AN}}1001/24 - 1002/24{{FOLDER}}1 - 2 - 3';
    spyOn(translate, 'instant')
      .withArgs('notification.linked-warnings').and.returnValues('AN concernés : ')
      .withArgs('notification.linked-folders').and.returnValues('Affaires concernées : ');

    // When
    const result = pipe.transform(title);

    // Then
    expect(result).toEqual('56<br/>AN concernés : 1001/24 - 1002/24<br/>Affaires concernées : 1 - 2 - 3');
    done();
  });
});
