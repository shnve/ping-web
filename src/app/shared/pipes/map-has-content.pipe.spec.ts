import { TestBed } from '@angular/core/testing';
import { MapHasContentPipe } from './map-has-content.pipe';

describe('MapHasContentPipe', () => {
  let pipe;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: []
    });
  });

  beforeEach(() => {
    pipe = new MapHasContentPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return false if map is null', () => {
    const result = pipe.transform();
    expect(result).toBeFalse();
  });

  it('should return false if map is empty', () => {
    const result = pipe.transform({});
    expect(result).toBeFalse();
  });

  it('should return true if map not empty', () => {
    const result = pipe.transform(
      {
        objectName: 'feature 19',
        markupType: 'OTHER'
      }
    );
    expect(result).toBeTrue();
  });
});
