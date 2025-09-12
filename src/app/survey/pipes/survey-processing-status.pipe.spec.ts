import { MAPPING_STATUS_SEVERITY, SurveyProcessingStatusPipe } from './survey-processing-status.pipe';

describe('SurveyProcessingStatusPipe', () => {
  let pipe: SurveyProcessingStatusPipe;

  beforeEach(() => {
    pipe = new SurveyProcessingStatusPipe();
  });

  it('create an instance', done => {
    expect(pipe).toBeTruthy();
    done();
  });

  it('should format processing status as severity', done => {
    for (const [key, value] of Object.entries(MAPPING_STATUS_SEVERITY)) {
      const result = pipe.transform(key);
      expect(result).toEqual(value);
    }
    done();
  });
});
