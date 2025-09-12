import { TRANSLATIONS_LIST_SURVEY_COMPLIANT_STATUS } from '../models/survey.model';
import { SurveyCompliantStatusTxtPipe } from './survey-compliant-status-txt.pipe';

describe('SurveyCompliantStatusTxtPipe', () => {
  let pipe: SurveyCompliantStatusTxtPipe;

  beforeEach(() => {
    pipe = new SurveyCompliantStatusTxtPipe();
  });

  it('create an instance', done => {
    expect(pipe).toBeTruthy();
    done();
  });

  it('should format compliant status as i18n key', done => {
    TRANSLATIONS_LIST_SURVEY_COMPLIANT_STATUS.forEach(entry => {
      const result = pipe.transform(entry['key']);
      expect(result).toEqual(entry['value']);
    });
    done();
  });
});
