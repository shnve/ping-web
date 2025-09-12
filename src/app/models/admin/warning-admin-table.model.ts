export interface TableAdminWarning {
  status: string;
  id: string;
  nameOfSeries: string;
  warningNumber: number;
  year: number;
  references: Array<TableAdminReferenceWarning>;
  creationDate: string;
  publicationDate: string;
  state: string;
  warningTypeDetails: string;
  modelName?: string;
  generalAreas: {
    [key: string]: Array<string>
  };
  localities: {
    [key: string]: Array<string>
  };
}

export interface TableAdminReferenceWarning extends Pick<TableAdminWarning, 'nameOfSeries' | 'warningNumber' | 'year'> {}
