var dotest = require ('dotest');
var app = require ('./');
var mfc;

var config = {
  hostname: process.env.MFC_HOSTNAME || null
};

mfc = app (config);


dotest.add ('Module', function () {
  dotest.test ()
    .isFunction ('fail', 'exports', app)
    .isObject ('fail', 'interface', mfc)
    .isFunction ('fail', '.current', mfc && mfc.current)
    .isFunction ('fail', '.sleep', mfc && mfc.sleep)
    .isObject ('fail', '.general', mfc && mfc.general)
    .isFunction ('fail', '.general.status', mfc && mfc.general && mfc.general.status)
    .isFunction ('fail', '.general.information', mfc && mfc.general && mfc.general.information)
    .done ();
});


dotest.add ('Method .current', function () {
  mfc.current (function (err, data) {
    dotest.test (err)
      .isObject ('fail', 'data', data)
      .isObject ('fail', 'data.ink', data && data.ink)
      .isDate ('fail', 'data.uptimeDate', data && data.uptimeDate)
      .isNumber ('fail', 'data.uptime', data && data.uptime)
      .isNumber ('fail', 'data.jobs', data && data.jobs)
      .isString ('fail', 'data.state', data && data.state)
      .isString ('fail', 'data.stateReasons', data && data.stateReasons)
      .done ();
  });
});


dotest.run ();

