import { FolderFormatDetailsModalTitlePipe } from '@app/folder/pipes/folder-format-details-modal-title.pipe';
import { Folder } from '@app/folder/models/folder.model';


describe('FolderFormatDetailsModalTitlePipe', () => {
  let pipe: FolderFormatDetailsModalTitlePipe;

  beforeEach(() => {
    pipe = new FolderFormatDetailsModalTitlePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format number with creation year, service and area', () => {
    const folder: Partial<Folder> = {
      id: '123',
      number: '56',
      creationDate: new Date('2020-10-08T10:50:00'),
      issuingService: 'Service Test',
      area: 'Area Test'
    };
    const result = pipe.transform(folder);
    expect(result).toEqual('56/20 - Service Test - Area Test');
  });
});
