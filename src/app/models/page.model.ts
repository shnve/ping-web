export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  last: boolean;
  first: boolean;
}
