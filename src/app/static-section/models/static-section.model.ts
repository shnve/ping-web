export interface StaticSectionBase {
  content?: string;
  internationalContent?: string;
}

export interface StaticSection extends StaticSectionBase {
  id: string;
  key: string;
  location: string;
  path: string;
  name: string;
}