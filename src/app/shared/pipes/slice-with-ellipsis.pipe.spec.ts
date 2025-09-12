import { SliceWithEllipsisPipe } from './slice-with-ellipsis.pipe';

describe('SliceWithEllipsisPipe', () => {
  it('create an instance', () => {
    const pipe = new SliceWithEllipsisPipe();
    expect(pipe).toBeTruthy();
  });

  it('return empty string if text is empty', () => {
    const pipe = new SliceWithEllipsisPipe();
    const result = pipe.transform('');
    expect(result).toBe('');
  });

  it('return text without ellipsis', () => {
    const pipe = new SliceWithEllipsisPipe();
    const result = pipe.transform('text');
    expect(result).toBe('text');
  });

  it('return text with ellipsis (default sliceTo value)', () => {
    const pipe = new SliceWithEllipsisPipe();
    const result = pipe.transform('text with more than 100 characters text with more than 100 characters text with more thant 100 characters');
    expect(result).toBe('text with more than 100 characters text with more than 100 characters text with more thant 100 chara...');
  });

  it('return text with ellipsis (provided sliceTo value)', () => {
    const pipe = new SliceWithEllipsisPipe();
    const result = pipe.transform('my text', 5);
    expect(result).toBe('my te...');
  });
});
