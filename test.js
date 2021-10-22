const dotest = require ('dotest');
const app = require ('./');

const config = {
  url: process.env.MFC_URL,
  ippPort: process.env.MFC_IPPPORT,
  timeout: process.env.MFC_TIMEOUT,
};

const mfc = new app (config);


dotest.add ('Module', test => {
  test()
    .isClass ('fail', 'exports', app)
    .isFunction ('fail', '.current', mfc.current)
    .isFunction ('fail', '.generalStatus', mfc.generalStatus)
    .isFunction ('fail', '.generalInformation', mfc.generalInformation)
    .done()
  ;
});


dotest.add ('Method current', async test => {
  try {
    const data = await mfc.current();

    test()
      .isObject ('fail', 'data', data)
      .isString ('fail', 'data.state', data.state)
      .isString ('fail', 'data.stateReasons', data.stateReasons)
      .isNumber ('fail', 'data.jobs', data.jobs)
      .isNumber ('fail', 'data.uptime', data.uptime)
      .isDate ('fail', 'data.uptimeDate', data.uptimeDate)
      .isObject ('fail', 'data.ink', data.ink)
      .info (data.ink)
      .done()
    ;
  }
  catch (err) {
    test (err).done();
  }
});


dotest.add ('Method generalStatus', async test => {
  try {
    const data = await mfc.generalStatus();

    test()
      .isObject ('fail', 'data', data)
      .isString ('fail', 'data.model', data.model)
      .isString ('fail', 'data.status', data.status)
      .isString ('fail', 'data.message', data.message)
      .isObject ('fail', 'data.ink', data.ink)
      .isNotEmpty ('fail', 'data.ink', data.ink)
    ;

    for (let i in data.ink) {
      test().isNumber ('fail', 'data.ink.' + i, data.ink [i]);
    }

    test().done();
  }
  catch (err) {
    test (err).done();
  }
});


dotest.add ('Method generalInformation', async test => {
  try {
    const data = await mfc.generalInformation();

    test()
      .isObject ('fail', 'data', data)
      .isString ('fail', 'data.ip_address', data.ip_address)
      .isNumber ('fail', 'data.page_counter', data.page_counter)
      .done()
    ;
  }
  catch (err) {
    test (err).done();
  }
});


dotest.run();
