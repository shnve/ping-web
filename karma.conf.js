// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
module.exports = function (config) {
  let launchers = [];
  // Default launcher is ChromeDev
  if(!config.browsers.length) {
    launchers.push(require('karma-chrome-launcher'))
  } else {
    if(config.browsers.some(r => ['Firefox', 'FirefoxDeveloper', 'FirefoxAurora', 'FirefoxNightly'].indexOf(r) >= 0)) {
      launchers.push(require('karma-firefox-launcher'));
    }
    if(config.browsers.includes('ChromeDev')) {
      launchers.push(require('karma-chrome-launcher'));
    }
  }

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      ...launchers
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html', subdir: 'html'},
        { type: 'lcovonly' }
      ],
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browserNoActivityTimeout: 120000,
    browsers: config.browsers.length ? config.browsers : ['ChromeDev'],
    customLaunchers: {
      ChromeDev: {
        base: 'Chrome',
        flags: [
          '--remote-debugging-port=9222'
        ]
      }
    },
    singleRun: false
  });
};
