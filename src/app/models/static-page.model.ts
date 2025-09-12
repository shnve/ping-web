export interface StaticPage {
  id: string;
  title: string;
  internationalTitle: string;
  path: string;
  content?: string;
  internationalContent?: string;
  locked: boolean;
}