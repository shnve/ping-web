export interface StaticLogoBase {
  content: string;
  heightWithUnit?: string;
  altTxt: string;
  altTxtInternational: string;
  title?: string;
  titleInternational?: string;
  href?: string;
}

export interface StaticLogo extends StaticLogoBase {
  id: string;
  key: string;
  description: string;
  locked: boolean;
}

export const defaultStaticLogo: StaticLogo = {
  id: null,
  key: null,
  description: null,
  content: null,
  altTxt: null,
  altTxtInternational: null,
  locked: false
};
