import { MainWarningPart } from '@app/models/warning.model';
import { FormatWarningsNumberToCancelPipe } from './format-warnings-number-to-cancel.pipe';

describe('formatWarningsNumberToCancel', () => {
  let pipe;

  beforeEach(() => {
    pipe = new FormatWarningsNumberToCancelPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format warning number if warning data is present', () => {
    const warningPart1: Array<MainWarningPart> = [
      { id: '1', nameOfSeries: 'nameOfSeries 1', warningNumber: 1, year: 2021 },
      { id: '2', nameOfSeries: 'nameOfSeries 2', warningNumber: 1, year: 2022 }
    ];
    const warningPart2: Array<MainWarningPart> = [
      { id: '1', nameOfSeries: 'nameOfSeries 1', warningNumber: 1, year: 2021 }
    ];
    expect(pipe.transform(warningPart1)).toContain('nameOfSeries 1 1/21, nameOfSeries 2 1/22');
    expect(pipe.transform(warningPart2)).toContain('nameOfSeries 1 1/21');
  });

  it('should format 1 warning number if warning data is present', () => {
    expect(pipe.transform([{ nameOfSeries: 'nameOfSeries', warningNumber: 1, year: '2021' }])).toContain('nameOfSeries 1/21');
  });

  it('should return empty string if warning data is not present', () => {
    expect(pipe.transform(undefined)).toEqual('');
  });
});
