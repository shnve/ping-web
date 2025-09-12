import { FormatMonthPipe } from './format-month.pipe';

describe('FormatMonthPipe', () => {
  it('create an instance', () => {
    const pipe = new FormatMonthPipe();
    expect(pipe).toBeTruthy();
  });

  [
    { input: 1, output: 'months.january' },
    { input: 2, output: 'months.february' },
    { input: 3, output: 'months.march' },
    { input: 4, output: 'months.april' },
    { input: 5, output: 'months.may' },
    { input: 6, output: 'months.june' },
    { input: 7, output: 'months.july' },
    { input: 8, output: 'months.august' },
    { input: 9, output: 'months.september' },
    { input: 10, output: 'months.october' },
    { input: 11, output: 'months.november' },
    { input: 12, output: 'months.december' }
  ].forEach(({ input, output }) => {
    it(`should get month from number ${input}`, () => {
      const pipe = new FormatMonthPipe();
      expect(pipe.transform(input)).toBe(output);
    });
  });

  [
    { input: 0, output: undefined },
    { input: 13, output: undefined }
  ].forEach(({ input, output }) => {
    it(`should get undefined from number ${input}`, () => {
      const pipe = new FormatMonthPipe();
      expect(pipe.transform(input)).toBe(output);
    });
  });
});
