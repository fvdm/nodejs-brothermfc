/*
Name:         brothermfc
Description:  Access Brother MFC web UI details with node.js
Author:       Franklin van de Meent (https://frankl.in)
Feedback:     https://github.com/fvdm/nodejs-brothermfc/issues
Source:       https://github.com/fvdm/nodejs-brothermfc
License:      Unlicense / Public Domain (see LICENSE file)
*/

var ipp = require ('ipp');
var httpreq = require ('httpreq');

var config = {
  hostname: null,
  port: null,
  ippPort: 631
};

// Process response
function doResponse (response, callback) {
  var data = response && response.body || '';
  var error = null;

  var res = {
    code: response.statusCode,
    headers: response.headers,
    data: data.trim ()
  };

  if (response.statusCode >= 300) {
    error = new Error ('HTTP error');
    error.code = res.code;
    callback (error);
    return;
  }

  callback (null, res);
}

// Communication
function talk (props, callback) {
  var options = {
    method: props.method || 'GET',
    parameters: props.query || null,
    headers: {}
  };

  options.url = props.protocol || config.protocol || 'http';
  options.url += '://';
  options.url += props.hostname || config.hostname;
  options.url += '/';
  options.url += props.port || config.port || 80;
  options.url += props.path;

  // custom request headers
  if (props.headers) {
    options.headers = props.headers;
  }

  // request
  httpreq.doRequest (options, function (err, res) {
    if (err) {
      callback (err);
      return;
    }

    doResponse (res, callback);
  });
}

function methodGeneralStatus (callback) {
  talk ({ path: '/general/status.html' }, function (err, res) {
    var result = {
      model: null,
      status: null,
      message: null,
      ink: {}
    };

    if (err) {
      callback (err);
      return;
    }

    res.data.replace (/<div id="modelName"><h1>([^<]+)<\/h1>/, function (s, t) {
      result.model = t;
    });

    res.data.replace (/<div id="moni_data"><span class="moni ([^\"]+)">([^<]+)<\/span><\/div>/, function (s, t, m) {
      result.status = t;
      result.message = m;
    });

    res.data.replace (/<img src="\.\.\/common\/images\/(\w+)\.gif" alt="([^\"]+)" class="tonerremain" height="(\d+)px"/g, function (s, c, s2, p) {
      result.ink [c] = Math.round (p * 1.7857142857);
    });

    res.data.replace (/<li class="(contact|location)">[^<]+<span class="spacer">:<\/span>([^<]+)<\/li>/g, function (s, t, v) {
      result [t] = v;
    });

    callback (null, result);
  });
}

function methodGeneralInformation (callback) {
  talk ({ path: '/etc/mnt_info.csv' }, function (err, res) {
    var data;
    var one;
    var two;
    var result = {};
    var i;
    var val;
    var key;

    if (err) {
      callback (err);
      return;
    }

    data = res.data.replace (/\""{0}/g, '');
    data = data.split ('\n');

    one = data [0] .split (',');
    two = data [1] .split (',');
    result = {};

    for (i = 0; i < one.length; i++) {
      val = two [i] .trim ();
      key = one [i] .trim () .replace (/(.+)/, function (s, t) {
        return t.toLowerCase () .replace (' ', '_') .replace ('.', '');
      });

      if (key !== '' && val !== '') {
        result [key] = val.match (/^\d+$/) ? val * 1 : val;
      }
    }

    callback (null, result);
  });
}

function methodSleep (set, callback) {
  var result = {
    presets: []
  };
  var form = {
    pageid: 5,
    postif_registration_reject: 1,
    B15: set
  };

  if (!callback) {
    talk ({ path: '/general/sleep.html' }, function (err, res) {
      if (err) {
        callback (err);
        return;
      }

      res.data.replace (/<select id="B15" name="B15" >(.+)<\/select>/, function (s, sel) {
        sel.replace (/<option value="(\d+)"( selected="selected")?>(\d+)&#32;Mins<\/option>/g, function (s2, a, b, c) {
          result.presets.push ({
            key: a,
            minutes: c * 1
          });

          if (b) {
            result.value = {
              key: a,
              minutes: c * 1
            };
          }
        });
      });

      set (null, result);
    });

    return;
  }

  talk (
    {
      method: 'POST',
      path: '/general/sleep.html',
      query: form
    },
    function (err, res) {
      if (err) {
        callback (err);
        return;
      }

      if (!!~res.data.indexOf ('<div class="postSuccess">')) {
        callback (null, true);
        return;
      }

      callback (new Error ('post failed'));
    }
  );
}

// ! .current
function methodCurrent (callback) {
  var printer = ipp.Printer ('http://' + config.hostname + ':' + config.ippPort + '/ipp/printer');
  var msg = {
    'operation-attributes-tag': {
      'requested-attributes': [
        'queued-job-count',
        'marker-names',
        'marker-levels',
        'printer-state',
        'printer-state-reasons',
        'printer-up-time'
      ]
    }
  };

  printer.execute ('Get-Printer-Attributes', msg, function (err, data) {
    var error = null;
    var result = {};
    var name;
    var i;

    if (err) {
      error = new Error ('ipp error');
      error.error = err;
      return callback (err);
    }

    data = data ['printer-attributes-tag'] || {};

    result.state = data ['printer-state'] || null;
    result.stateReasons = data ['printer-state-reasons'] || null;
    result.jobs = data ['queued-job-count'] || 0;
    result.uptime = data ['printer-up-time'] || 0;
    result.uptimeDate = new Date (Date.now () - (result.uptime * 1000));

    result.ink = {};

    if (data ['marker-names'] instanceof Array && data ['marker-levels'] instanceof Array) {
      for (i = 0; i < data ['marker-names'] .length; i++) {
        name = data ['marker-names'] [i] .toLowerCase () .replace (/.*\u001e(\w+) .*/, '$1');
        result.ink [name] = data ['marker-levels'] [i];
      }
    }

    callback (null, result);
  });
}

// ! module
module.exports = function (setup) {
  var i;

  for (i in setup) {
    config [i] = setup [i];
  }

  return {
    current: methodCurrent,
    sleep: methodSleep,
    general: {
      status: methodGeneralStatus,
      information: methodGeneralInformation
    }
  };
};
