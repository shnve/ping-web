import { GeoregulationNumber } from '../models/georegulation.model';
import { GeoregulationFormatNumberPipe } from './georegulation-format-number.pipe';

describe('GeoregulationFormatNumberPipe', () => {
  let pipe: GeoregulationFormatNumberPipe;

  beforeEach(() => {
    pipe = new GeoregulationFormatNumberPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format number with date', () => {
    const grNumber: GeoregulationNumber = {
      year: 2022,
      text: 'some text',
      authorityIds: ['auth_id01', 'auth_id02'],
      date: '26042022',
      authorityCodes: [ 'Code1', 'Code2' ]
    };
    const result = pipe.transform(grNumber);
    expect(result).toEqual('2022-some text-Code1-Code2-26042022');
  });

  it('should format number without date', () => {
    const grNumber: GeoregulationNumber = {
      year: 2022,
      text: 'some text',
      authorityIds: ['auth_id01', 'auth_id02'],
      date: null,
      authorityCodes: [ 'Code1', 'Code2' ]
    };
    const result = pipe.transform(grNumber);
    expect(result).toEqual('2022-some text-Code1-Code2-');
  });
});
