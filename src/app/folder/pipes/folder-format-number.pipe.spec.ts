import { FolderFormatNumberPipe } from './folder-format-number.pipe';
import { TableFolder } from '@app/folder/models/folder-table.model';

describe('FolderFormatNumberPipe', () => {
  let pipe: FolderFormatNumberPipe;

  beforeEach(() => {
    pipe = new FolderFormatNumberPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format number with creation year', () => {
    const folder: TableFolder = {
      id: '123',
      number: '56',
      creationDate: new Date('2020-10-08T10:50:00'),
      concernedMaritimeEntities: [],
      sharedMaritimeServices: [],
      status: null,
      comment: null,
      reviewDate: null,
      lastUpdate: new Date('2020-10-08T10:50:00'),
      object: null
    };
    const result = pipe.transform(folder);
    expect(result).toEqual('56/20');
  });
});
