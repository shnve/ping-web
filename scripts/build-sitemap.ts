const fs = require('fs');
const { SitemapStream , streamToPromise } = require('sitemap');
const { Readable } = require('stream');

const URL_SITE_MAP = [
  { url: 'avurnav-notice', changefreq: 'hourly', priority: 1.0 },
  { url: 'georegulation-visu', changefreq: 'monthly', priority: 1.0 },
  { url: 'static/data-services', changefreq: 'monthly', priority: 1.0 },
  { url: '', changefreq: 'monthly', priority: 1.0 }
];

const stream = new SitemapStream({ hostname: 'https://portail.xxxx' });

streamToPromise(Readable.from(URL_SITE_MAP).pipe(stream))
  .then(data => fs.writeFileSync('src/assets/sitemap.xml', data.toString()))
  .catch(err => {
    console.error(err);
  });
