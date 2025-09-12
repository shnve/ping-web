import { KeyValueNoSortPipe } from './keyvalue-no-sort.pipe';

describe('KeyValueNoSortPipe', () => {
  let pipe;

  beforeEach(() => {
    pipe = new KeyValueNoSortPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return unsorted map', () => {
    // Given
    const input = {
      indication: 1,
      level: 'URGENT',
      naturalNoticeCode: 1,
      incidentTitle: 42,
      cmsTitle: 37,
      recoveryTime: 5,
      comment: 'string',
      costalService: 'issuerService',
      territorialDivision: 'string',
      previousNoticeNumber: 'string'
    };

    // When
    const unsortedMap = pipe.transform(input);

    // Then
    expect(unsortedMap.length).toEqual(10);
    expect(unsortedMap[2].key).toEqual('naturalNoticeCode');
    expect(unsortedMap[5].value).toEqual(5);
  });

});
