import { SurveyProcessingStatusTranslationPipe } from './survey-processing-status-translation.pipe';

describe('SurveyProcessingStatusTranslationPipe', () => {
  let pipe: SurveyProcessingStatusTranslationPipe;

  beforeEach(() => {
    pipe = new SurveyProcessingStatusTranslationPipe();
  });

  it('create an instance', done => {
    expect(pipe).toBeTruthy();
    done();
  });

  it('should format processing status as i18n value', done => {
    const i18nValues = {
      'FINISHED': 'enum.survey-processing-status.finished',
      'NOT_AVAILABLE': 'enum.survey-processing-status.not-available',
      'PENDING': 'enum.survey-processing-status.pending', 
      'FAILURE': 'enum.survey-processing-status.failure'
    }
    for (const [key, value] of Object.entries(i18nValues)) {
      const result = pipe.transform(key);
      expect(result).toEqual(value);
    }
    done();
  });
});
