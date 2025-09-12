import { MAPPING_COMPLIANT_ICON, SurveyCompliantStatusPipe } from './survey-compliant-status.pipe';

describe('SurveyCompliantStatusPipe', () => {
  let pipe: SurveyCompliantStatusPipe;

  beforeEach(() => {
    pipe = new SurveyCompliantStatusPipe();
  });

  it('create an instance', done => {
    expect(pipe).toBeTruthy();
    done();
  });

  it('should format compliant status as icon', done => {
    for (const [key, value] of Object.entries(MAPPING_COMPLIANT_ICON)) {
      const result = pipe.transform(key);
      expect(result).toEqual(value);
    }
    done();
  });
});
