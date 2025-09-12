export interface CreationSubscriptionDto {
  serviceId: string;
  title: string;
  areaId: string;
  serieId: string;
  lang: string;
  subAreaIds: Array<string>;
  warningHazardTypeGenerals: Array<string>;
  maritimeEntityIdsGeographicExtent: Array<string>;
  georegulationTypes: Array<string>;
  maritimeEntityIds: Array<string>;
  sendingMail: boolean;
}
