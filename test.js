var dotest = require ('dotest');
var app = require ('./');

var config = {
  hostname: process.env.MFC_HOSTNAME || null,
  timeout: process.env.MFC_TIMEOUT || 5000
};

var cacheSleep = null;

var mfc = app (config);


dotest.add ('Configuration', function (test) {
  if (!config.hostname) {
    test ()
      .fail ('MFC_HOSTNAME not set')
      .exit ();
  } else {
    test ()
      .good ('MFC_HOSTNAME is set')
      .info ('MFC_TIMEOUT:  ' + config.timeout)
      .done ();
  }
});


dotest.add ('Module', function (test) {
  var general = mfc && mfc.general;

  test ()
    .isFunction ('fail', 'exports', app)
    .isObject ('fail', 'interface', mfc)
    .isFunction ('fail', '.current', mfc && mfc.current)
    .isFunction ('fail', '.sleep', mfc && mfc.sleep)
    .isObject ('fail', '.general', general)
    .isFunction ('fail', '.general.status', general && general.status)
    .isFunction ('fail', '.general.information', general && general.information)
    .done ();
});


dotest.add ('Method .sleep - get value', function (test) {
  mfc.sleep (function (err, data) {
    var value = data && data.value;

    if (value && value.key) {
      cacheSleep = value.key;
    }

    test (err)
      .isObject ('fail', 'data', data)
      .isObject ('fail', 'data.presets', data && data.presets)
      .isObject ('fail', 'data.value', value)
      .isNumber ('fail', 'data.value.key', value && value.key)
      .isNumber ('fail', 'data.presets[1]', data && data.presets && data.presets[1])
      .done ();
  });
});


dotest.add ('Method .sleep - set value', function (test) {
  mfc.sleep (cacheSleep, function (err, data) {
    test (err)
      .isExactly ('fail', 'data', data, true)
      .done ();
  });
});


dotest.add ('Method .current', function (test) {
  mfc.current (function (err, data) {
    test (err)
      .isObject ('fail', 'data', data)
      .isString ('fail', 'data.state', data && data.state)
      .isString ('fail', 'data.stateReasons', data && data.stateReasons)
      .isNumber ('fail', 'data.jobs', data && data.jobs)
      .isNumber ('fail', 'data.uptime', data && data.uptime)
      .isDate ('fail', 'data.uptimeDate', data && data.uptimeDate)
      .isObject ('fail', 'data.ink', data && data.ink)
      .info (data && data.ink)
      .done ();
  });
});


dotest.add ('Method general.status', function (test) {
  mfc.general.status (function (err, data) {
    var i;

    test (err)
      .isObject ('fail', 'data', data)
      .isString ('fail', 'data.model', data && data.model)
      .isString ('fail', 'data.status', data && data.status)
      .isString ('fail', 'data.message', data && data.message)
      .isObject ('fail', 'data.ink', data && data.ink)
      .isNotEmpty ('fail', 'data.ink', data && data.ink);

    for (i in data && data.ink) {
      test () .isNumber ('fail', 'data.ink.' + i, data.ink [i]);
    }

    test () .done ();
  });
});


dotest.run ();
