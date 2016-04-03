var dotest = require ('dotest');
var app = require ('./');

var mfc = app ({
  hostname: process.env.MFC_HOSTNAME || null
});


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


dotest.run ();

