import {Extent} from 'ol/extent';
import {getMaxAxisSize} from './extent';

describe('ExtentUtils', () => {

  it('getMaxAxisSize - should return 9, the max axis size', () => {
    // Given
    const extent: Extent = [1, 0, 10, 5];

    // When
    const res = getMaxAxisSize(extent);

    // Expect
    expect(res).toEqual(9);
  });
});
