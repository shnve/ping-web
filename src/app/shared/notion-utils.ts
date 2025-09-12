import { Notion, NotionType } from '@app/models/notion.model';
import { environment } from '@env/environment';

export function accessLinkToNotion(notion: Notion) {
    let accessLink: string;
    switch (notion.type) {
        case NotionType.WARNING:
            accessLink = `${environment.basePortalUrl + environment.warningsSharedUrlContext}/${notion.warning.id}`;
            break;
        case NotionType.WARNING_TP:
            accessLink = `${environment.basePortalUrl + environment.warningsSharedUrlContext}/${notion.warningTP.id}`;
            break;
        case NotionType.INFOSOURCE:
            accessLink = `${environment.basePortalUrl + environment.infosourcesSharedUrlContext}/${notion.infosource.id}`;
            break;
        case NotionType.GEOREGULATION:
            accessLink = `${environment.basePortalUrl + environment.georegulationSharedUrlContext}/${notion.georegulation.id}`;
            break;
        default:
            break;
    }
    return accessLink;
}
