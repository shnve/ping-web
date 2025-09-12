export interface CreationFolderDto {
  areaId: string;
  localityId?: string;
  object: string;
  status?: string;
  reviewDate?: string;
  serviceId?: string;
  concernedMaritimeEntityIds?: Array<string>;
  comment?: string;
}

