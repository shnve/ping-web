export interface CreationAttachments {
  attachmentIds?: Array<string>;
  attachmentFiles?: Array<CreationAttachment>;
}

export interface CreationAttachment {
  filename: string;
  identifier: string;
  totalSize: number;
  type: string;
  isSurvey?: boolean;
  isBathy?: boolean;
  isTechnicalMetadata?: boolean;
  id?: string;
  uuid?: string;
}
