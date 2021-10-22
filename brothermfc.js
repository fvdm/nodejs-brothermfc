/*
Name:         brothermfc
Description:  Access Brother MFC web UI details with node.js
Author:       Franklin (https://fvdm.com)
Source:       https://github.com/fvdm/nodejs-brothermfc
License:      Unlicense / Public Domain (see LICENSE file)
*/

const ipp = require ('ipp');
const { doRequest } = require ('httpreq');

module.exports = class BrotherMFC {

  /**
   * @param   {object}  o
   * @param   {string}  o.url             `http://printer.local:1234`
   * @param   {number}  [o.timeout=5000]  Request timeout in ms
   * @param   {number}  [o.ippPort=631]   Printer IPP port
   */

  constructor ({
    url,
    timeout = 5000,
    ippPort = 631,
  }) {
    url = new URL (url);

    this._config = {
      url,
      timeout,
      ippPort,
    };
  }


  /**
   * Communication
   *
   * @param   {object}  o
   * @param   {string}  o.path          Request path
   * @param   {object}  [o.parameters]  Request parameters
   * @param   {string}  [o.method=GET]  HTTP method
   * @param   {object}  [o.headers]     Additional request headers
   *
   * @return  {Promise<mixed>}
   */

  async _talk ({
    path,
    parameters,
    headers,
    method = 'GET',
  }) {
    const options = {
      url: `${this._config.url.protocol}//${this._config.url.host}${this._config.url.pathname}${path}`,
      method,
      parameters,
      timeout: this._config.timeout,
      headers,
    };

    return doRequest (options)
      .then (res => res.body)
    ;
  }


  /**
   * Method: generalStatus
   *
   * @returns {Promise<object>}
   */

  async generalStatus () {
    const data = await this._talk ({ path: '/general/status.html' });
    const result = {
      ink: {},
    };

    data.replace (/<div id="modelName"><h1>([^<]+)<\/h1>/, function (s, t) {
      result.model = t;
    });

    data.replace (/<div id="moni_data"><span class="moni ([^\"]+)">([^<]+)<\/span><\/div>/, function (s, t, m) {
      result.status = t;
      result.message = m;
    });

    data.replace (/<img src="\.\.\/common\/images\/(\w+)\.gif" alt="([^\"]+)" class="tonerremain" height="(\d+)px"/g, function (s, c, s2, p) {
      result.ink[c] = Math.round (p * 1.7857142857);
    });

    data.replace (/<li class="(contact|location)">[^<]+<span class="spacer">:<\/span>([^<]+)<\/li>/g, function (s, t, v) {
      result[t] = v;
    });

    return result;
  }


  /**
   * Method: generalInformation
   *
   * @returns {Promise<object>}
   */

  async generalInformation () {
    const data = await this._talk ({ path: '/etc/mnt_info.csv' });

    data = data.replace (/\""{0}/g, '');
    data = data.split ('\n');

    const one = data[0].split (',');
    const two = data[1].split (',');
    const result = {};
    let key;
    let val;

    for (let i = 0; i < one.length; i++) {
      val = two[i].trim();
      key = one[i].trim().replace (/(.+)/, (s, t) => {
        return t
          .toLowerCase()
          .replace (' ', '_')
          .replace ('.', '')
        ;
      });

      if (key !== '' && val !== '') {
        result[key] = val.match (/^\d+$/) ? val * 1 : val;
      }
    }

    return result;
  }


  /**
   * Method: current
   *
   * @returns {Promise<object>}
   */

  async current () {
    const printer = ipp.Printer (`http://${this._config.ippPort}/ipp/printer`);
    const msg = {
      'operation-attributes-tag': {
        'requested-attributes': [
          'queued-job-count',
          'marker-names',
          'marker-levels',
          'printer-state',
          'printer-state-reasons',
          'printer-up-time',
        ],
      },
    };

    return new Promise ((resolve, reject) => {
      printer.execute ('Get-Printer-Attributes', msg, (err, data) => {
        if (err) {
          reject (err);
          return;
        }

        data = data['printer-attributes-tag'] || {
          state: null,
          stateReason: null,
          jobs: 0,
          uptime: 0,
          uptimeDate: null,
          ink: {},
        };

        const result = {
          state: data['printer-state'],
          stateReasons: data['printer-state-reasons'],
          jobs: data['queued-job-count'],
          uptime: data['printer-up-time'],
          uptimeDate: new Date (Date.now() - (result.uptime * 1000)),
          ink: {},
        };

        if (Array.isArray (data['marker-names']) && Array.isArray (data['marker-levels'])) {
          data['marker-names'].forEach ((name, i) => {
            name = name.toLowerCase().replace (/.*\u001e(\w+) .*/, '$1');
            result.ink[name] = data['marker-levels'][i];
          });
        }

        resolve (result);
      });
    });
  }

};
