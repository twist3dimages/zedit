import 'angular';
import 'angular-ui-router';
import 'ui-router-extras';
import 'angular-spinner';
import 'angular-color-picker';
import 'angular-elastic-input';
import 'angular-marked';
import 'angular-vs-repeat';
import { remote, ipcRenderer, clipboard } from 'electron';
import jetpack from 'fs-jetpack';
import fh from './helpers/fileHelpers';
import logger from './helpers/logger.js';
import buildModuleService from './helpers/moduleService';
import './polyfills';
import './color';
window.xelib = require('xelib').wrapper;

// init logger
logger.init('app');

// handle uncaught exceptions
window.startupCompleted = false;
process.on('uncaughtException', function(e) {
    if (window.startupCompleted) return;
    const msg = `There was a critical error on startup:\n\n${e.stack}`;
    logger.error(msg) && alert(msg);
    remote.app.quit();
});

// initialize xelib when application starts
try {
    const libPath = jetpack.path('XEditLib.dll');
    logger.info(`Initializing xelib with "${libPath}"`);
    xelib.Initialize(libPath);
    logger.info(`xelib initialized successfully`);
} catch (e) {
    const msg = `There was a critical error loading XEditLib.dll:\n\n${e.stack}`;
    logger.error(msg) && alert(msg);
    remote.app.quit();
}

// set up angular application
const ngapp = angular.module('zedit', [
    'ui.router', 'ct.ui.router.extras', 'angularSpinner', 'vs-repeat',
    'mp.colorPicker', 'puElasticInput', 'hc.marked'
]);

ngapp.config(function($urlMatcherFactoryProvider, $compileProvider) {
    // allow urls with and without trailing slashes to go to the same state
    $urlMatcherFactoryProvider.strictMode(false);
    // allow docs:// urls
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|docs):/);
});

// state redirects
ngapp.run(['$rootScope', '$state', function($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (e, toState, params) {
        if (!toState.redirectTo) return;
        e.preventDefault();
        $state.go(toState.redirectTo, params, { location: 'replace' });
    });
}]);

//== begin angular files ==
//=include Directives/*.js
//=include Factories/*.js
//=include Filters/*.js
//=include Services/**/*.js
//=include Views/**/*.js
//== end angular files ==

// load modules
const moduleService = buildModuleService(ngapp, fh, logger);
moduleService.loadModules();
ngapp.run(moduleService.loadDeferredModules);
