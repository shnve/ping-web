import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SurveyCoordinatesOrder } from '@app/survey/models/survey.model';
import { SurveyTranslateWithListPipe } from '@app/survey/pipes/survey-translate-with-list.pipe';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

describe('SurveyTranslateWithListPipe', () => {

  let pipe: SurveyTranslateWithListPipe;
  let mockTranslate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        })],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
    mockTranslate = TestBed.inject(TranslateService);
  });

  beforeEach(() => {
    pipe = new SurveyTranslateWithListPipe(mockTranslate);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('create an instance', done => {
    expect(pipe).toBeTruthy();
    done();
  });

  it('should return a translation based on group with title of this', done => {
    const listName = 'coordinatesOrder';
    const input = SurveyCoordinatesOrder.XYZ;
    const resultExpected = 'enum.survey-coordinates-order.x-y-z';

    const result = pipe.transform(input, listName);

    expect(result).toEqual(resultExpected);
    done();
  });

  it('should return file separator chosen by user', done => {
    const listName = 'fileSeparator';
    const input = '#';

    const result = pipe.transform(input, listName);

    expect(result).toEqual('#');
    done();
  });

  it('should return file separator chosen by user: 2 spaces', done => {
    const listName = 'fileSeparator';
    const input = '  ';
    spyOn(mockTranslate, 'instant').withArgs('enum.survey-file-separator.space').and.returnValues('espace')

    const result = pipe.transform(input, listName);

    expect(result).toEqual('2 ESPACE');
    done();
  });

});
