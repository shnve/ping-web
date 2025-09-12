import { FormatWarningNumberPipe } from './format-warning-number.pipe';

describe('FormatWarningNumberPipe', () => {
  let pipe;

  beforeEach(() => {
    pipe = new FormatWarningNumberPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format warning number if warning data is present', () => {
    expect(pipe.transform({nameOfSeries: 'nameOfSeries', warningNumber: 1, year: '2021'})).toContain('nameOfSeries 1/21');
  });

  it('should return empty string if warning data is not present', () => {
    expect(pipe.transform(undefined)).toEqual('');
  });

  it('should format warning number if warning creation data is present', () => {
    expect(pipe.transform({timezone: 'timezone', serieName: 'nameOfSeries', warningNumber: 1, year: '2021'}, true)).toContain('nameOfSeries 1/21');
  });

  it('should format warning number if model', () => {
    expect(pipe.transform({modelName: 'model01', timezone: 'timezone', serieName: 'nameOfSeries'}, true)).toContain('model01 - nameOfSeries');
  });

  it('should format warning number if no number and not model', () => {
    expect(pipe.transform({nameOfSeries: 'nameOfSeries'})).toContain('nameOfSeries');
  });
});
