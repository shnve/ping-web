
export interface PageInfo {
  page: number;
  // Number of rows for each page
  rows: number;
}

export interface SortInfo {
  field: string;
  order: 1 | -1;
}

export interface ModelItemTablePage<T> {
  modelItems: Array<T>;
  totalElements: number;
}

export interface PaginatedModelItemTableViewDtos<T> {
  _embedded?: {
    items: Array<T>
  };
  _links?: Links;
  page: Page;
}

export interface LinkHref {
  href: string;
}

export interface Links {
  first?: LinkHref;
  self: LinkHref;
  next?: LinkHref;
  last?: LinkHref;
}

export interface Page {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}
