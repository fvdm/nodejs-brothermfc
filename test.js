var dotest = require ('dotest');
var app = require ('./');
var mfc;

var config = {
  hostname: process.env.MFC_HOSTNAME || null
};

mfc = app (config);


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


if (!config.hostname) {
  dotest.run ();
  dotest.log ('fail', 'MFC_HOSTNAME is required');
  process.exit ();
}


dotest.add ('Method .current', function () {
  mfc.current (function (err, data) {
    dotest.test (err)
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


dotest.run ();

