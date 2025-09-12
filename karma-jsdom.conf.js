// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const process = require('process');
let canvas, jsdom, request;

const mockScriptFunctions =
  'URL.createObjectURL = () => {};' +
  'requestAnimationFrame = () => {};';

try {
  canvas = require('canvas');
  jsdom = require('jsdom');
  request = require('request-promise-native');
} catch(e) {
  console.error('To run this command, you need to install following packages: "jsdom", "request-promise-native" and "canvas".');
  console.info('To do that run this command: ');
  console.log('\x1b[33m', '> npm i canvas jsdom request-promise-native --no-save');
  process.exit(-1);
}


class CustomResourceLoader extends jsdom.ResourceLoader {
  fetch(url, options) {
    if(/\/_karma_webpack_\/vendor\.js/.exec(url)) {
      const requestOptions = this._getRequestOptions(options);
      console.log('Add "createObjectURL" in vendors');
      return request(url, requestOptions).then((resBuffer) => {
        // Add URL.createObjecURL in vendors for ol
        const prependCode = Buffer.from(mockScriptFunctions);
        return  Buffer.concat([prependCode, resBuffer]);
      });
    }
    return super.fetch(url, options);
  }
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jsdom-launcher'),
      require('karma-jasmine'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
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
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['jsdom'],
    jsdomLauncher: {
      jsdom: {
        beforeParse(window) {
          window.HTMLCanvasElement.prototype.getContext = () => {};
        },
        resources: new CustomResourceLoader()
      }
    },
    singleRun: false
  });
};
