# ping-web

## Introducing PING

PING is the national platform for nautical information developed and implemented by Shom. The Shom is France's national hydrographic service. It is the NAVAREA II area coordinator of the World-Wide Navigational Warning Service (WWNWS) and the national nautical information coordinator. The platform is co-published by Shom and the Direction Générale des Affaires Maritimes, de la Pêche et de l'Aquaculture. Its development was co-financed by the European Union (Interreg Mediterranean MED OSMoSIS Project, FEAMP). The platform has been operational since April 2024.


The PING web platform is a shared information system that facilitates the transmission, formatting, digitization and posting on the Internet of nautical information. Nautical information is digitized for wide distribution and integration into user systems (ship navigation systems, shore-based service systems, user systems, etc.). Nautical information data is geolocated, formatted and supplied in accordance with applicable standards and recommendations (in particular those developed by the IHO as part of WWNWS, such as S-124), so that it is interoperable and accessible using standardized exchange protocols.


PING presents a portal for users and data services for systems.


The users of the portal are the public, who can consult navigational warnings, notices to mariners and maritime zone regulations (with the option of subscribing) and transmit new information (contributor), and the staff of contributing departments or those responsible for producing official nautical information (navigational warnings and notices to mariners, updates to nautical charts and publications, spatialized maritime regulations). PING includes tools for producing navigational warnings, notices to mariners and spatialized regulations.


There are several types of data services. Some of these data services use Geoserver to deliver WMS or WFS streams, while others are REST APIs, notably to deliver S-124 data in accordance with the SECOM standard.


PING has specific interfaces with broadcast systems and other national systems (REST API or Sftp file transfer).

Some optional notions of S-124 data model have not been implemented: NavwarnPreamble/navwarnTitle, NavwarnPreamble/affectedChartPublications, SpatialQuality, TextPlacement, NavwarnPart/featureName, NavwarnPart/featureReference and NavwarnPart/restriction


For full details of PING features, please refer to the portal home page at https://portail.ping-info-nautique.fr/, to its Data Services section and to the portal's general terms and conditions of use.


## PING projects

PING consists of several Java Spring Boot and Angular projects. The two projects that have been released as open source and are available are as follows:
- ping-api: the back end that interacts with the database and various third-party dependencies (Kafka data bus, Keycloak, email sending, etc.), and responds to requests from ping-web
- ping-web: the front end that will interact directly with ping-api, as well as with Keycloak for the user login part

/!\ Not all projects are available as open source, so it is important to note that certain features/APIs will not be available /!\


## Local usage

### Install
```bash
npm install
```

### Launch in local
```bash
npm run start
```
The application is accessible to the url _http://localhost:4200_.

To launch it with ping-api in local
```bash
npm run start:local
```
The application will request directly ping-api with url _http://localhost:8080_.

### Tests
```bash
npm run test
```
You must have chrome installed on your environment

Code coverage on local env:
```bash
npm run test -- --code-coverage
```

### Test with firefox
```bash
npm run test:firefox
```


### Nginx Configuration

In this project, we can find some files like logs.conf and logs.conf.tmpl : 
* logs.conf is used as a default configuration (for docker)
* logs.conf.tmpl is used to erase some conf for WL delivery

For the configuration of the nginx launch through Docker

```
PING_PORTAL_URL=portail.XXX
PING_SERVICES_URL=services.XXX

SERVER_NAME_PORTAL=${PING_PORTAL_URL}
SERVER_NAME_SERVICES=${PING_SERVICES_URL}

REAL_IP_FROM=127.0.0.1

# conf for services #
#####################

# container : ping-geoserver
GEOSERVER_1=server 0.0.0.0:8080 max_fails=3 fail_timeout=2s;
GEOSERVER_2=server 0.0.0.0:8080 max_fails=3 fail_timeout=2s;
GEOSERVER_3=server 0.0.0.0:8080 max_fails=3 fail_timeout=2s;
GEOSERVER_4=server 0.0.0.0:8080 max_fails=3 fail_timeout=2s;

# container : ping-api
API_1=server 0.0.0.0:8080 max_fails=3 fail_timeout=2s;

# container : ping-auth
AUTH_1=server 0.0.0.0:8080 max_fails=3 fail_timeout=2s;

# container : ping-sissy
SISSY_1=server 0.0.0.0:8080 max_fails=3 fail_timeout=2s;

# SSL configuration (put "ssl" if active and managed on nginx and nothing if not)
SSL_ACTIVE=

# conf for portal #
###################

DEBUG_APP=off

BASE_API_URL=https://${PING_SERVICES_URL}/
BASE_PORTAL_URL=https://${PING_PORTAL_URL}/

BASE_MAP_KEY=XXX
BASE_MAP_KEY_FOR_SHOM_SERVICE=XXX

KEYCLOAK_ROOT_URL=https://${PING_SERVICES_URL}
KEYCLOAK_REDIRECT_URI_DEFAULT=https://${PING_PORTAL_URL}
KEYCLOAK_REDIRECT_URI_ACCOUNT_VALIDATION=https://${PING_PORTAL_URL}/account-validation

ENABLE_SURVEY_MODULE=false

# configuration for CSP = urls of services (separated by space if multiple domains needed)
CSP_PORTAL=*.ping-info-nautique.fr

# configuration for CORS = domains separated by comma with escaped quotes
CORS_DOMAIN="\"ping-info-nautique.fr\""
```

### Manage the Sitemap via Command Line

To add a URL to the sitemap, you need to define it with the associated parameters in the `URL_SITE_MAP` constant in the `build-sitemap.ts` file, located at the root of the project.

#### Example of Adding a URL

In the `build-sitemap.ts` file, add the URL in the following format:

```typescript
{ url: 'url_to_add', changefreq: 'change_frequency', priority: priority_level },
```

#### Parameter Details

- **url**: The page or resource you want to add to the sitemap.
- **changefreq**: Indicates how frequently the content at the URL is likely to change. Possible values:
    - `always`
    - `hourly`
    - `daily`
    - `weekly`
    - `monthly`
    - `yearly`
    - `never`

- **priority**: `0.0` &rarr; `1.0`

#### Generate the Sitemap

Once you've made your changes in `build-sitemap.ts`, run the following command to generate the updated sitemap:

```bash
npm run build-sitemap
```
