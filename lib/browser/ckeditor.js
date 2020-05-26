/* eslint-env browser */
/* globals CKEDITOR */

/**
 * Common features for all pages
 */

// Should be loaded locally in the applications vendor.js file
// var $ = require('jquery')

/**
 * loadScriptAsync(url, eventName)
 *
 * @param {string} url -- the url to the script you want to load
 * @param {string} eventName -- the event to be fired when all scripts have been loaded
 *
 * @example
 *
 * loadScript('/path/to/script_1.js', 'scriptready')
 * loadScript('/path/to/script_2.js', 'scriptready')
 * loadScript('/path/to/script_3.js', 'scriptready')
 *
 * The scripts will be loaded in order, retrying 3 times per script on fail, and when
 * all scripts have been loaded it will trigger $(window).trigger('scriptready')
 *
 */
var scriptLoadTracker = {};
var loadScriptAsync = function (url, eventName, retry) {
  // Storing ajaxsetup setting so we can restore it when done
  var defaultCache = $.ajaxSetup().cache;
  if (scriptLoadTracker[eventName] === undefined) {
    scriptLoadTracker[eventName] = {
      loading: false,
      urls: [url],
    };
  } else if (url) {
    scriptLoadTracker[eventName].urls.push(url);
  }
  if (!scriptLoadTracker[eventName].loading) {
    scriptLoadTracker[eventName].loading = true;
    // Make sure we load from cache
    $.ajaxSetup({ cache: true });
    $.getScript(scriptLoadTracker[eventName].urls[0])
      .done(function (script, textStatus) {
        scriptLoadTracker[eventName].loading = false;
        // Remove the current (first in list) url
        scriptLoadTracker[eventName].urls.shift();
        if (scriptLoadTracker[eventName].urls.length === 0) {
          // We are done, reset ajaxSetup
          $.ajaxSetup({ cache: defaultCache });
          // and trigger the ready event
          $(window).trigger(eventName);
        } else {
          // Load next script
          loadScriptAsync(undefined, eventName);
        }
      })
      .fail(function (jqxhr, settings, exception) {
        scriptLoadTracker[eventName].loading = false;
        // Retry loading 3 times with 100ms delay each time
        if (!retry || retry < 2) {
          setTimeout(function () {
            retry = retry === undefined ? 1 : retry + 1;
            loadScriptAsync(undefined, eventName, retry);
          }, 100);
        }
      });
  }
};

var doHandleMessage = function (event) {
  var data = event.data || event.originalEvent.data;
  if (data) {
    try {
      data = window.JSON.parse(data);
      CKEDITOR.tools.callFunction(data.funcNum, data.url);
    } catch (e) {
      CKEDITOR.tools.callFunction(null, null, e);
    }
  }
};

/**
 * Load and initialize CK Editor
 */
module.exports.ckeditorInstances = [];
module.exports.init = function (options) {
  var _ckeditorBasepath_ = options.ckeditorBasepath;
  // = SERVICE_BASEPATH + '/static/js/ckeditor/'
  var _ckeditorOptions_ = options.ckeditorOptions;
  /*
    var options = {
      customConfig: CKEDITOR.getUrl(CKEDITOR_BASEPATH + 'customConfig.js'),
      contentsCss: [
        CKEDITOR.getUrl(CKEDITOR_BASEPATH + 'contents.css'),
        SERVICE_BASEPATH + '/static/css/bootstrap/bootstrap.min.css',
        SERVICE_BASEPATH + '/static/css/kth-style/kth-bootstrap-theme.css',
        CKEDITOR.getUrl('contentOverride.css')
      ],
      kth_uploadFileUrl: SERVICE_BASEPATH + '/_upload',
      kth_uploadImageUrl: SERVICE_BASEPATH + '/_upload',
      kth_uploadBrowseUrl: SERVICE_BASEPATH + '/_browse',
      embed_provider: SERVICE_BASEPATH + '/_embed?url={url}&callback={callback}',
      language: lang
    }
  */

  // Declaring base path because CK Editor gets confused when being dynamically loaded
  window.CKEDITOR_BASEPATH = _ckeditorBasepath_;

  var initCKEditor = function () {
    CKEDITOR.on("instanceLoaded", function (ev) {
      // prevent default override from running
      ev.stop();
    });

    // Instantiate the ck editors. Returns array of jquery init functions
    module.exports.ckeditorInstances = $(
      ".FieldType-IHTMLAreaField .form-control"
    )
      .map(function (i, el) {
        var height = $(el).height();
        _ckeditorOptions_.height = height - 77; // Removing toolbar height and chrome
        var $editorInit = $(el).ckeditor(_ckeditorOptions_);
        return $editorInit.ckeditorGet();
      })
      .toArray();

    // TODO: Figure out what this does and if it can handle multiple instances
    $(window).on("message", doHandleMessage);
  };

  if ($(".FieldType-IHTMLAreaField").length > 0) {
    $(window).on("ckready", initCKEditor);
    // Get the CK Editor script with jquery adapter. loadScript triggers
    // 'ckready' event when done and we can listen to that event to create
    // the editor instances
    loadScriptAsync(CKEDITOR_BASEPATH + "ckeditor.js", "ckready");
    loadScriptAsync(CKEDITOR_BASEPATH + "adapters/jquery.js", "ckready");
  }
};

module.exports.cleanup = function () {
  $(window).off("message", doHandleMessage);
  // $(window).off('ckready', initCKEditor)
  // Destroy CK Editor instances
  module.exports.ckeditorInstances.each(function (i, instance) {
    instance.destroy();
  });
};
